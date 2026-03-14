import os
import io
import json
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from PIL import Image
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


@app.on_event("startup")
def startup():
    load_labels()
    load_model()


transform = T.Compose([
    T.Resize((256, 256)),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


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
        image = Image.open(io.BytesIO(content)).convert("RGB")
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
        image = Image.open(io.BytesIO(resp.content)).convert("RGB")
    else:
        raise HTTPException(status_code=400, detail="Provide application/json with image_url or multipart file")
    try:
        labels = predict_image(image)
        return JSONResponse(content={"labels": labels})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
