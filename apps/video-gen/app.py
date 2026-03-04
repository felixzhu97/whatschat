import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
if "HF_ENDPOINT" not in os.environ:
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

import uuid
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

OUTPUT_DIR = Path(os.environ.get("VIDEO_OUTPUT_DIR", "output"))
OUTPUT_DIR.mkdir(exist_ok=True)
HOST = os.environ.get("VIDEO_GEN_HOST", "0.0.0.0")
PORT = int(os.environ.get("VIDEO_GEN_PORT", "3456"))
BASE_URL = os.environ.get("VIDEO_GEN_BASE_URL", f"http://localhost:{PORT}")

jobs = {}
jobs_lock = threading.Lock()
pipe = None
pipe_lock = threading.Lock()


class GenerateBody(BaseModel):
    prompt: str
    imageUrl: Optional[str] = None


def _device():
    import torch
    if os.environ.get("VIDEO_GEN_DEVICE") == "cpu":
        return "cpu"
    if torch.cuda.is_available():
        return "cuda"
    mps = getattr(torch.backends, "mps", None)
    if mps is not None and mps.is_available():
        return "mps"
    return "cpu"


def _skip_local_pipeline():
    if os.environ.get("VIDEO_GEN_FORCE_LOCAL") == "1":
        return False
    import sys
    if sys.platform != "darwin":
        return False
    import torch
    if torch.cuda.is_available():
        return False
    return True


def get_pipeline():
    global pipe
    if _skip_local_pipeline():
        return None
    with pipe_lock:
        if pipe is None:
            import torch
            from diffusers import CogVideoXPipeline
            model_id = os.environ.get("COGVIDEOX_MODEL", "THUDM/CogVideoX-2b")
            device = _device()
            pipe = CogVideoXPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
            )
            if device == "cuda":
                pipe.enable_model_cpu_offload()
            else:
                pipe = pipe.to(device)
        return pipe


def run_generate(job_id: str, prompt: str):
    try:
        p = get_pipeline()
        if p is None:
            with jobs_lock:
                if job_id in jobs:
                    jobs[job_id]["status"] = "failed"
                    jobs[job_id]["error"] = "Local video generation is not supported on macOS (known crash). Use VIDEO_GEN_FORCE_LOCAL=1 to try anyway, or use a remote API / Linux with NVIDIA GPU."
            return
        out_path = OUTPUT_DIR / f"{job_id}.mp4"
        video = p(
            prompt=prompt,
            num_inference_steps=50,
            guidance_scale=6.0,
        ).frames[0]
        from diffusers.utils import export_to_video
        export_to_video(video, str(out_path), fps=8)
        with jobs_lock:
            if job_id in jobs:
                jobs[job_id]["status"] = "succeeded"
                jobs[job_id]["videoUrl"] = f"{BASE_URL}/output/{job_id}.mp4"
    except Exception as e:
        with jobs_lock:
            if job_id in jobs:
                jobs[job_id]["status"] = "failed"
                jobs[job_id]["error"] = str(e)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if not _skip_local_pipeline():
        get_pipeline()
    yield


app = FastAPI(title="Video Gen API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/generate")
def generate(body: GenerateBody, background_tasks: BackgroundTasks):
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    with jobs_lock:
        jobs[job_id] = {"status": "pending"}
    background_tasks.add_task(run_generate, job_id, body.prompt)
    return {"jobId": job_id}


@app.get("/generate/{job_id}")
def get_result(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "status": job["status"],
        **({"videoUrl": job["videoUrl"]} if job.get("videoUrl") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@app.get("/output/{job_id}.mp4")
def serve_output(job_id: str):
    path = OUTPUT_DIR / f"{job_id}.mp4"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="video/mp4")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
