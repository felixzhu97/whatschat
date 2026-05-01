# Vision Service API Documentation

Vision service providing image tag prediction and NSFW content moderation.

## Base Information

- **Base URL**: `http://localhost:8001`
- **Framework**: FastAPI

## Service Startup

```bash
cd services/vision
python app/main.py
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VISION_TOP_K` | 10 | Number of labels to return |
| `VISION_REQUEST_TIMEOUT` | 15.0 | Request timeout (seconds) |
| `VISION_MAX_IMAGE_SIZE` | 800 | Max image size (pixels) |
| `VISION_MODERATION_ENABLED` | true | Enable content moderation |
| `VISION_MODERATION_THRESHOLD` | 0.15 | Moderation threshold |
| `VISION_NSFW_ENABLED` | true | Enable NSFW detection |
| `VISION_NSFW_THRESHOLD` | 0.35 | NSFW detection threshold |
| `VISION_MAX_VIDEO_FRAMES` | 30 | Max video frames to extract |
| `VISION_VIDEO_FRAME_INTERVAL_SEC` | 2.0 | Video frame extraction interval (seconds) |

---

## Health Check

### Health Status

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "model": "resnet50"
}
```

---

## Image Tag Prediction

### Predict Tags

```
POST /predict
```

Recognizes image content and returns tag list.

**Request Mode 1: multipart/form-data**
```
Content-Type: multipart/form-data
file: <image file>
```

**Request Mode 2: JSON**
```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "labels": ["cat", "tabby_cat", "tiger_cat", "Egyptian_cat"]
}
```

---

## Content Moderation

### Moderate Image

```
POST /moderate
```

Detects if image contains prohibited content.

**Request Mode 1: multipart/form-data**
```
Content-Type: multipart/form-data
file: <image file>
```

**Request Mode 2: JSON**
```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**Response (safe):**
```json
{
  "safe": true,
  "categories": []
}
```

**Response (flagged):**
```json
{
  "safe": false,
  "categories": [
    {"label": "nude", "score": 0.8523},
    {"label": "prohibited", "score": 0.2341}
  ]
}
```

---

### Moderate Video

```
POST /moderate-video
```

Detects if video contains prohibited content (via frame extraction).

**Request Mode 1: multipart/form-data**
```
Content-Type: multipart/form-data
file: <video file>
```

**Request Mode 2: JSON**
```json
{
  "video_url": "https://example.com/video.mp4"
}
```

**Response:**
```json
{
  "safe": true,
  "categories": []
}
```

Or

```json
{
  "safe": false,
  "categories": [
    {"label": "nude", "score": 0.7234}
  ]
}
```

---

## Usage Examples

### Python Request Example

```python
import requests

# Predict tags
response = requests.post(
    "http://localhost:8001/predict",
    files={"file": open("image.jpg", "rb")}
)
print(response.json())

# Or via URL
response = requests.post(
    "http://localhost:8001/predict",
    json={"image_url": "https://example.com/image.jpg"}
)
print(response.json())

# Content moderation
response = requests.post(
    "http://localhost:8001/moderate",
    files={"file": open("image.jpg", "rb")}
)
result = response.json()
if result["safe"]:
    print("Image is safe")
else:
    print(f"Image flagged: {result['categories']}")
```

### curl Examples

```bash
# Predict tags
curl -X POST "http://localhost:8001/predict" \
  -F "file=@image.jpg"

# Moderate content
curl -X POST "http://localhost:8001/moderate" \
  -F "file=@image.jpg"

# Moderate via URL
curl -X POST "http://localhost:8001/moderate" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

---

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request (e.g., image too large or wrong format) |
| 500 | Internal server error |

---

## Moderation Categories

| Category | Description |
|----------|-------------|
| `prohibited` | Contains prohibited content (weapons, violence, etc.) |
| `nude` | Detected nudity |

---

## Dependent Models

- **ResNet50**: ImageNet pretrained model for tag prediction
- **NudeNet**: NSFW detection model (optional, requires separate installation)

---

[中文](../../zh/rd/api/vision-api.md) | English
