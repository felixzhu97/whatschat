import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
if "HF_ENDPOINT" not in os.environ:
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

import uuid
import threading
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

OUTPUT_BASE = Path(os.environ.get("MEDIA_OUTPUT_DIR", "output"))
IMAGE_OUTPUT = OUTPUT_BASE / "image"
VIDEO_OUTPUT = OUTPUT_BASE / "video"
VOICE_OUTPUT = OUTPUT_BASE / "voice"
for d in (IMAGE_OUTPUT, VIDEO_OUTPUT, VOICE_OUTPUT):
    d.mkdir(parents=True, exist_ok=True)

HOST = os.environ.get("MEDIA_GEN_HOST", "0.0.0.0")
PORT = int(os.environ.get("MEDIA_GEN_PORT", "3456"))
BASE_URL = os.environ.get("MEDIA_GEN_BASE_URL", f"http://localhost:{PORT}")
DEFAULT_VOICE = os.environ.get("EDGE_TTS_VOICE", "zh-CN-XiaoxiaoNeural")

image_jobs = {}
video_jobs = {}
jobs_lock = threading.Lock()
image_pipe = None
video_pipe = None
pipe_lock = threading.Lock()


class ImageGenerateBody(BaseModel):
    prompt: str
    negativePrompt: Optional[str] = None


class VideoGenerateBody(BaseModel):
    prompt: str
    imageUrl: Optional[str] = None


class VoiceSynthesizeBody(BaseModel):
    text: str
    voice: Optional[str] = None


def _device():
    import torch
    if os.environ.get("MEDIA_GEN_DEVICE") == "cpu":
        return "cpu"
    if torch.cuda.is_available():
        return "cuda"
    mps = getattr(torch.backends, "mps", None)
    if mps is not None and mps.is_available():
        return "mps"
    return "cpu"


def _skip_video_local():
    if os.environ.get("VIDEO_GEN_FORCE_LOCAL") == "1":
        return False
    if os.environ.get("MEDIA_VIDEO_FORCE_LOCAL") == "1":
        return False
    import sys
    if sys.platform != "darwin":
        return False
    import torch
    if torch.cuda.is_available():
        return False
    return True


def get_image_pipeline():
    global image_pipe
    with pipe_lock:
        if image_pipe is None:
            import torch
            from diffusers import StableDiffusionPipeline
            model_id = os.environ.get("SD_MODEL", "runwayml/stable-diffusion-v1-5")
            device = _device()
            image_pipe = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if device != "cpu" else torch.float32,
            )
            image_pipe = image_pipe.to(device)
    return image_pipe


def get_video_pipeline():
    global video_pipe
    if _skip_video_local():
        return None
    with pipe_lock:
        if video_pipe is None:
            import torch
            from diffusers import CogVideoXPipeline
            model_id = os.environ.get("COGVIDEOX_MODEL", "THUDM/CogVideoX-2b")
            device = _device()
            video_pipe = CogVideoXPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
            )
            if device == "cuda":
                video_pipe.enable_model_cpu_offload()
            else:
                video_pipe = video_pipe.to(device)
    return video_pipe


def run_image_job(job_id: str, prompt: str, negative_prompt: str):
    try:
        pipe = get_image_pipeline()
        out_path = IMAGE_OUTPUT / f"{job_id}.png"
        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt or None,
            num_inference_steps=30,
            guidance_scale=7.5,
        )
        result.images[0].save(str(out_path))
        with jobs_lock:
            if job_id in image_jobs:
                image_jobs[job_id]["status"] = "succeeded"
                image_jobs[job_id]["imageUrl"] = f"{BASE_URL}/output/image/{job_id}.png"
    except Exception as e:
        with jobs_lock:
            if job_id in image_jobs:
                image_jobs[job_id]["status"] = "failed"
                image_jobs[job_id]["error"] = str(e)


def run_video_job(job_id: str, prompt: str):
    try:
        pipe = get_video_pipeline()
        if pipe is None:
            with jobs_lock:
                if job_id in video_jobs:
                    video_jobs[job_id]["status"] = "failed"
                    video_jobs[job_id]["error"] = "Local video generation not supported on this platform. Set MEDIA_VIDEO_FORCE_LOCAL=1 to try anyway."
            return
        out_path = VIDEO_OUTPUT / f"{job_id}.mp4"
        from diffusers.utils import export_to_video
        video = pipe(
            prompt=prompt,
            num_inference_steps=50,
            guidance_scale=6.0,
        ).frames[0]
        export_to_video(video, str(out_path), fps=8)
        with jobs_lock:
            if job_id in video_jobs:
                video_jobs[job_id]["status"] = "succeeded"
                video_jobs[job_id]["videoUrl"] = f"{BASE_URL}/output/video/{job_id}.mp4"
    except Exception as e:
        with jobs_lock:
            if job_id in video_jobs:
                video_jobs[job_id]["status"] = "failed"
                video_jobs[job_id]["error"] = str(e)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not _skip_video_local():
        get_video_pipeline()
    yield


app = FastAPI(title="Media Gen API (Image + Video + Voice)", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/image/generate")
def image_generate(body: ImageGenerateBody, background_tasks: BackgroundTasks):
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    with jobs_lock:
        image_jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(
        run_image_job,
        job_id,
        body.prompt,
        body.negativePrompt or "",
    )
    return {"jobId": job_id}


@app.get("/image/generate/{job_id}")
def image_get_result(job_id: str):
    with jobs_lock:
        job = image_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "status": job["status"],
        **({"imageUrl": job["imageUrl"]} if job.get("imageUrl") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@app.get("/output/image/{job_id}.png")
def serve_image(job_id: str):
    path = IMAGE_OUTPUT / f"{job_id}.png"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="image/png")


@app.post("/video/generate")
def video_generate(body: VideoGenerateBody, background_tasks: BackgroundTasks):
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    with jobs_lock:
        video_jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(run_video_job, job_id, body.prompt)
    return {"jobId": job_id}


@app.get("/video/generate/{job_id}")
def video_get_result(job_id: str):
    with jobs_lock:
        job = video_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "status": job["status"],
        **({"videoUrl": job["videoUrl"]} if job.get("videoUrl") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@app.get("/output/video/{job_id}.mp4")
def serve_video(job_id: str):
    path = VIDEO_OUTPUT / f"{job_id}.mp4"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="video/mp4")


@app.post("/voice/synthesize")
async def voice_synthesize(body: VoiceSynthesizeBody):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    voice = (body.voice or DEFAULT_VOICE).strip()
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    out_path = VOICE_OUTPUT / f"{job_id}.mp3"
    try:
        import edge_tts
        communicate = edge_tts.Communicate(body.text.strip(), voice)
        await communicate.save(str(out_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"audioUrl": f"{BASE_URL}/output/voice/{job_id}.mp3"}


@app.get("/output/voice/{job_id}.mp3")
def serve_voice(job_id: str):
    path = VOICE_OUTPUT / f"{job_id}.mp3"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="audio/mpeg")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
