# Media Gen Service API Documentation

Media generation service providing image generation (Stable Diffusion), video generation (CogVideoX), and voice synthesis (edge-tts).

## Base Information

- **Base URL**: `http://localhost:3456`
- **Framework**: FastAPI

## Service Startup

```bash
cd services/media-gen
python app.py
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MEDIA_GEN_PORT` | 3456 | Service port |
| `MEDIA_GEN_BASE_URL` | http://localhost:3456 | Base URL |
| `MEDIA_OUTPUT_DIR` | output | Output directory (with image/, video/, voice/ subdirs) |
| `MEDIA_GEN_DEVICE` | auto | Device (auto/cpu, auto-detects MPS on macOS) |
| `SD_MODEL` | runwayml/stable-diffusion-v1-5 | Image generation model |
| `COGVIDEOX_MODEL` | THUDM/CogVideoX-2b | Video generation model |
| `EDGE_TTS_VOICE` | zh-CN-XiaoxiaoNeural | Default voice |
| `MEDIA_VIDEO_FORCE_LOCAL` | (empty) | Set to 1 to force local video on macOS |

---

## Image Generation

### Generate Image

```
POST /image/generate
```

Asynchronously generates an image, returns jobId for status polling.

**Request Body:**
```json
{
  "prompt": "a beautiful sunset over the ocean",
  "negativePrompt": "ugly, blurry, low quality"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Image description |
| `negativePrompt` | string | No | Negative prompt |

**Response:**
```json
{
  "jobId": "job-a1b2c3d4e5f6"
}
```

---

### Check Generation Status

```
GET /image/generate/{jobId}
```

**Response Example (in progress):**
```json
{
  "status": "pending"
}
```

**Response Example (success):**
```json
{
  "status": "succeeded",
  "imageUrl": "http://localhost:3456/output/image/job-a1b2c3d4e5f6.png"
}
```

**Response Example (failed):**
```json
{
  "status": "failed",
  "error": "Error message"
}
```

---

### Get Image

```
GET /output/image/{jobId}.png
```

Returns PNG image file.

---

## Video Generation

### Generate Video

```
POST /video/generate
```

Asynchronously generates a video, returns jobId for status polling.

**Request Body:**
```json
{
  "prompt": "a bird flying in the sky",
  "imageUrl": "https://example.com/initial-image.png"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Video description |
| `imageUrl` | string | No | Initial image URL |

**Response:**
```json
{
  "jobId": "job-g7h8i9j0k1l2"
}
```

---

### Check Generation Status

```
GET /video/generate/{jobId}
```

Same as image status, returns `status`, `videoUrl`, or `error`.

---

### Get Video

```
GET /output/video/{jobId}.mp4
```

Returns MP4 video file.

---

## Voice Synthesis

### Synthesize Voice

```
POST /voice/synthesize
```

Synchronously synthesizes voice, returns audio URL directly.

**Request Body:**
```json
{
  "text": "Hello, welcome to the voice synthesis service",
  "voice": "en-US-JennyNeural"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to synthesize |
| `voice` | string | No | Voice name, default zh-CN-XiaoxiaoNeural |

**Response:**
```json
{
  "audioUrl": "http://localhost:3456/output/voice/job-m3n4o5p6q7r8.mp3"
}
```

---

### Get Voice

```
GET /output/voice/{jobId}.mp3
```

Returns MP3 audio file.

---

## Usage Examples

### Python Request Example

```python
import requests

# Generate image
response = requests.post("http://localhost:3456/image/generate", json={
    "prompt": "a cute cat",
    "negativePrompt": "blurry"
})
job_id = response.json()["jobId"]

# Poll status
import time
while True:
    status = requests.get(f"http://localhost:3456/image/generate/{job_id}").json()
    if status["status"] == "succeeded":
        print(f"Image ready: {status['imageUrl']}")
        break
    elif status["status"] == "failed":
        print(f"Failed: {status['error']}")
        break
    time.sleep(2)
```

### curl Examples

```bash
# Generate image
curl -X POST "http://localhost:3456/image/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a beautiful landscape"}'

# Voice synthesis
curl -X POST "http://localhost:3456/voice/synthesize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "voice": "en-US-JennyNeural"}'
```

---

## Error Handling

All endpoints may return:

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request parameters |
| 404 | Resource not found (e.g., wrong jobId) |
| 500 | Internal server error |

---

## Dependencies

Media Gen service depends on:
- PyTorch (image/video generation)
- Diffusers (Stable Diffusion, CogVideoX)
- edge-tts (voice synthesis)

---

[中文](../../zh/rd/api/media-gen-api.md) | English
