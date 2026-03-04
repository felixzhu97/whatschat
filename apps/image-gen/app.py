import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")
if "HF_ENDPOINT" not in os.environ:
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

import uuid
import threading
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

OUTPUT_DIR = Path(os.environ.get("IMAGE_OUTPUT_DIR", "output"))
OUTPUT_DIR.mkdir(exist_ok=True)
HOST = os.environ.get("IMAGE_GEN_HOST", "0.0.0.0")
PORT = int(os.environ.get("IMAGE_GEN_PORT", "3457"))
BASE_URL = os.environ.get("IMAGE_GEN_BASE_URL", f"http://localhost:{PORT}")

jobs = {}
jobs_lock = threading.Lock()
pipe = None
pipe_lock = threading.Lock()


class GenerateBody(BaseModel):
    prompt: str
    negativePrompt: Optional[str] = None


def _device():
    import torch
    if os.environ.get("IMAGE_GEN_DEVICE") == "cpu":
        return "cpu"
    if torch.cuda.is_available():
        return "cuda"
    mps = getattr(torch.backends, "mps", None)
    if mps is not None and mps.is_available():
        return "mps"
    return "cpu"


def get_pipeline():
    global pipe
    with pipe_lock:
        if pipe is None:
            import torch
            from diffusers import StableDiffusionPipeline
            model_id = os.environ.get("SD_MODEL", "runwayml/stable-diffusion-v1-5")
            device = _device()
            pipe = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if device != "cpu" else torch.float32,
            )
            pipe = pipe.to(device)
        return pipe


def run_generate(job_id: str, prompt: str, negative_prompt: str):
    try:
        p = get_pipeline()
        out_path = OUTPUT_DIR / f"{job_id}.png"
        result = p(
            prompt=prompt,
            negative_prompt=negative_prompt or None,
            num_inference_steps=30,
            guidance_scale=7.5,
        )
        img = result.images[0]
        img.save(str(out_path))
        with jobs_lock:
            if job_id in jobs:
                jobs[job_id]["status"] = "succeeded"
                jobs[job_id]["imageUrl"] = f"{BASE_URL}/output/{job_id}.png"
    except Exception as e:
        with jobs_lock:
            if job_id in jobs:
                jobs[job_id]["status"] = "failed"
                jobs[job_id]["error"] = str(e)


app = FastAPI(title="Image Gen API")
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
    background_tasks.add_task(
        run_generate,
        job_id,
        body.prompt,
        body.negativePrompt or "",
    )
    return {"jobId": job_id}


@app.get("/generate/{job_id}")
def get_result(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "status": job["status"],
        **({"imageUrl": job["imageUrl"]} if job.get("imageUrl") else {}),
        **({"error": job["error"]} if job.get("error") else {}),
    }


@app.get("/output/{job_id}.png")
def serve_output(job_id: str):
    path = OUTPUT_DIR / f"{job_id}.png"
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="image/png")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
