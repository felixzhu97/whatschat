import os
import io
import json
import logging
import tempfile
from pathlib import Path
from typing import Any, Optional

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("vision")
import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
import torch
import torchvision.transforms as T
from torchvision.models import resnet50, ResNet50_Weights

app = FastAPI(title="WhatsChat Vision", version="0.1.0")

LABELS_PATH = Path(__file__).resolve().parent.parent / "imagenet_labels.json"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL = None
LABELS = []
TOP_K = int(os.environ.get("VISION_TOP_K", "10"))
REQUEST_TIMEOUT = float(os.environ.get("VISION_REQUEST_TIMEOUT", "15.0"))
MAX_IMAGE_SIZE = int(os.environ.get("VISION_MAX_IMAGE_SIZE", "800"))
MODERATION_ENABLED = os.environ.get("VISION_MODERATION_ENABLED", "true").lower() == "true"
MODERATION_THRESHOLD = float(os.environ.get("VISION_MODERATION_THRESHOLD", "0.15"))
PROHIBITED_INDICES = {414, 764, 765}
NSFW_ENABLED = os.environ.get("VISION_NSFW_ENABLED", "true").lower() == "true"
NSFW_THRESHOLD = float(os.environ.get("VISION_NSFW_THRESHOLD", "0.35"))
NSFW_EXPLICIT_CLASSES = frozenset({
    "FEMALE_GENITALIA_EXPOSED", "FEMALE_BREAST_EXPOSED", "MALE_GENITALIA_EXPOSED",
    "MALE_BREAST_EXPOSED", "BUTTOCKS_EXPOSED", "ANUS_EXPOSED",
})


def _is_explicit_class(cls_name: str) -> bool:
    if not cls_name or "EXPOSED" not in cls_name.upper():
        return False
    u = cls_name.upper()
    return any(x in u for x in ("GENITALIA", "BREAST", "BUTTOCKS", "ANUS"))
MAX_VIDEO_FRAMES = int(os.environ.get("VISION_MAX_VIDEO_FRAMES", "30"))
VIDEO_FRAME_INTERVAL_SEC = float(os.environ.get("VISION_VIDEO_FRAME_INTERVAL_SEC", "2.0"))
MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024

NSFW_DETECTOR = None


def load_labels():
    global LABELS
    if LABELS_PATH.exists():
        with open(LABELS_PATH, "r", encoding="utf-8") as f:
            LABELS = json.load(f)
    else:
        LABELS = [f"class_{i}" for i in range(1000)]


def load_model():
    global MODEL
    weights = ResNet50_Weights.IMAGENET1K_V2
    MODEL = resnet50(weights=weights)
    MODEL.eval()
    MODEL.to(DEVICE)


def load_nsfw_detector():
    global NSFW_DETECTOR
    if not NSFW_ENABLED:
        log.info("NSFW detection disabled by config")
        return
    try:
        from nudenet import NudeDetector
        NSFW_DETECTOR = NudeDetector()
        log.info("NSFW detector loaded (nudenet)")
    except Exception as e:
        log.warning("NSFW detector failed to load: %s", e)
        NSFW_DETECTOR = None


@app.on_event("startup")
def startup():
    load_labels()
    load_model()
    load_nsfw_detector()


transform = T.Compose([
    T.Resize((256, 256)),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def _open_image_bytes(content: bytes) -> Optional[Image.Image]:
    try:
        img = Image.open(io.BytesIO(content))
        return img.convert("RGB")
    except (UnidentifiedImageError, OSError):
        return None


def predict_image(image: Image.Image) -> list[str]:
    if image.mode != "RGB":
        image = image.convert("RGB")
    w, h = image.size
    if max(w, h) > MAX_IMAGE_SIZE:
        ratio = MAX_IMAGE_SIZE / max(w, h)
        image = image.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    tensor = transform(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        out = MODEL(tensor)
    probs = torch.softmax(out[0], dim=0)
    top_probs, top_indices = torch.topk(probs, min(TOP_K, len(LABELS)))
    result = []
    seen = set()
    for idx in top_indices.cpu().tolist():
        label = LABELS[idx].strip().lower().replace(" ", "_") if idx < len(LABELS) else f"class_{idx}"
        if label not in seen:
            seen.add(label)
            result.append(label)
    return result[:TOP_K]


def _normalize_image_for_moderate(image: Image.Image) -> torch.Tensor:
    if image.mode != "RGB":
        image = image.convert("RGB")
    w, h = image.size
    if max(w, h) > MAX_IMAGE_SIZE:
        ratio = MAX_IMAGE_SIZE / max(w, h)
        image = image.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)
    return transform(image).unsqueeze(0).to(DEVICE)


def _nsfw_score(image: Image.Image) -> float:
    if NSFW_DETECTOR is None:
        return 0.0
    fd, path = None, None
    try:
        buf = io.BytesIO()
        image.save(buf, format="JPEG", quality=90)
        raw = buf.getvalue()
        fd, path = tempfile.mkstemp(suffix=".jpg")
        os.write(fd, raw)
        os.close(fd)
        fd = None
        detections = NSFW_DETECTOR.detect(path)
        max_score = 0.0
        for d in detections or []:
            cls_name = (d.get("class") or d.get("label") or "").strip()
            if not cls_name:
                continue
            s = float(d.get("score") or 0)
            if s < NSFW_THRESHOLD:
                continue
            if cls_name in NSFW_EXPLICIT_CLASSES or _is_explicit_class(cls_name):
                if s > max_score:
                    max_score = s
        if detections and max_score == 0.0:
            classes_seen = { (d.get("class") or d.get("label") or "").strip() for d in detections }
            log.debug("NSFW detections had no explicit class match: %s", classes_seen)
        return max_score
    except Exception as e:
        log.warning("NSFW detect error: %s", e)
    finally:
        if fd is not None:
            try:
                os.close(fd)
            except Exception:
                pass
        if path and os.path.exists(path):
            try:
                os.unlink(path)
            except Exception:
                pass
    return 0.0


def moderate_image(image: Image.Image) -> dict[str, Any]:
    tensor = _normalize_image_for_moderate(image)
    with torch.no_grad():
        out = MODEL(tensor)
    probs = torch.softmax(out[0], dim=0)
    categories: list[dict[str, Any]] = []
    for idx in PROHIBITED_INDICES:
        if idx < len(probs):
            score = float(probs[idx].cpu().item())
            if score >= MODERATION_THRESHOLD:
                categories.append({"label": "prohibited", "score": round(score, 4)})
    nude_score = _nsfw_score(image) if NSFW_ENABLED else 0.0
    if nude_score >= NSFW_THRESHOLD:
        categories.append({"label": "nude", "score": round(nude_score, 4)})
    if not categories:
        return {"safe": True, "categories": []}
    best_by_label: dict[str, float] = {}
    for c in categories:
        label = c["label"]
        score = c["score"]
        if label not in best_by_label or score > best_by_label[label]:
            best_by_label[label] = score
    unique = [{"label": k, "score": v} for k, v in best_by_label.items()]
    log.info("moderation reject: %s", unique)
    return {"safe": False, "categories": unique}


def _extract_frames_from_video(video_path: str) -> list[Image.Image]:
    try:
        import cv2
    except ImportError:
        log.warning("opencv not available, video frame extraction skipped")
        return []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []
    fps = cap.get(cv2.CAP_PROP_FPS) or 1.0
    interval_frames = max(1, int(fps * VIDEO_FRAME_INTERVAL_SEC))
    frames: list[Image.Image] = []
    frame_idx = 0
    while len(frames) < MAX_VIDEO_FRAMES:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % interval_frames == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(rgb))
        frame_idx += 1
    cap.release()
    return frames


def moderate_video(video_path: str) -> dict[str, Any]:
    frames = _extract_frames_from_video(video_path)
    if not frames:
        return {"safe": True, "categories": []}
    all_categories: dict[str, float] = {}
    for frame in frames:
        result = moderate_image(frame)
        if not result.get("safe", True):
            for c in result.get("categories", []):
                label = c.get("label", "")
                score = c.get("score", 0.0)
                if label and (label not in all_categories or score > all_categories[label]):
                    all_categories[label] = score
    if not all_categories:
        return {"safe": True, "categories": []}
    return {"safe": False, "categories": [{"label": k, "score": v} for k, v in all_categories.items()]}


@app.get("/health")
def health():
    return {"status": "ok", "model": "resnet50"}


@app.post("/predict")
async def predict(request: Request, file: Optional[UploadFile] = File(None)):
    image = None
    content_type = request.headers.get("content-type", "") or ""
    if file and file.filename:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large")
        image = _open_image_bytes(content)
    elif "application/json" in content_type:
        body = await request.json()
        image_url = body.get("image_url") if isinstance(body, dict) else None
        if not image_url:
            raise HTTPException(status_code=400, detail="Missing image_url")
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            try:
                resp = await client.get(image_url)
                resp.raise_for_status()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=400, detail=f"Failed to fetch image: {e}")
        image = _open_image_bytes(resp.content)
    else:
        raise HTTPException(status_code=400, detail="Provide application/json with image_url or multipart file")
    if image is None:
        return JSONResponse(content={"labels": []})
    try:
        labels = predict_image(image)
        return JSONResponse(content={"labels": labels})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/moderate")
async def moderate(request: Request, file: Optional[UploadFile] = File(None)):
    if not MODERATION_ENABLED:
        return JSONResponse(content={"safe": True, "categories": []})
    image = None
    content_type = request.headers.get("content-type", "") or ""
    if file and file.filename:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large")
        image = _open_image_bytes(content)
    elif "application/json" in content_type:
        body = await request.json()
        image_url = body.get("image_url") if isinstance(body, dict) else None
        if not image_url:
            raise HTTPException(status_code=400, detail="Missing image_url")
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            try:
                resp = await client.get(image_url)
                resp.raise_for_status()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=400, detail=f"Failed to fetch image: {e}")
        image = _open_image_bytes(resp.content)
    else:
        raise HTTPException(status_code=400, detail="Provide application/json with image_url or multipart file")
    if image is None:
        return JSONResponse(content={"safe": True, "categories": []})
    try:
        result = moderate_image(image)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/moderate-video")
async def moderate_video_endpoint(request: Request, file: Optional[UploadFile] = File(None)):
    if not MODERATION_ENABLED:
        return JSONResponse(content={"safe": True, "categories": []})
    video_path: Optional[str] = None
    content_type = request.headers.get("content-type", "") or ""
    if file and file.filename:
        content = await file.read()
        if len(content) > MAX_VIDEO_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Video too large")
        suffix = Path(file.filename or "video").suffix or ".mp4"
        fd, video_path = tempfile.mkstemp(suffix=suffix)
        try:
            os.write(fd, content)
            os.close(fd)
            result = moderate_video(video_path)
            return JSONResponse(content=result)
        finally:
            if video_path and os.path.exists(video_path):
                os.unlink(video_path)
    elif "application/json" in content_type:
        body = await request.json()
        video_url = body.get("video_url") if isinstance(body, dict) else None
        if not video_url:
            raise HTTPException(status_code=400, detail="Missing video_url")
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT * 2) as client:
            try:
                resp = await client.get(video_url)
                resp.raise_for_status()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=400, detail=f"Failed to fetch video: {e}")
        if len(resp.content) > MAX_VIDEO_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Video too large")
        suffix = ".mp4"
        fd, video_path = tempfile.mkstemp(suffix=suffix)
        try:
            os.write(fd, resp.content)
            os.close(fd)
            result = moderate_video(video_path)
            return JSONResponse(content=result)
        finally:
            if video_path and os.path.exists(video_path):
                os.unlink(video_path)
    else:
        raise HTTPException(status_code=400, detail="Provide application/json with video_url or multipart file")
