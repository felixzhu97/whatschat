# Video Gen (CogVideoX)

Video generation API used by the main server. Implements `POST /generate` (body: `{ prompt }`) and `GET /generate/:jobId`. In `apps/server` set `VIDEO_GENERATION_API_URL` to this app’s base URL (e.g. `http://localhost:3456`).

Requires GPU (e.g. 12GB+ VRAM for 2B model).

```bash
pip install -r requirements.txt
python app.py
```

Env: `VIDEO_GEN_PORT=3456`, `VIDEO_GEN_BASE_URL=http://localhost:3456`, `COGVIDEOX_MODEL=THUDM/CogVideoX-2b` (or `CogVideoX-4b`).
