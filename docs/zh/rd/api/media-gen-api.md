# Media Gen Service API 文档

媒体生成服务，提供图片生成（Stable Diffusion）、视频生成（CogVideoX）和语音合成（edge-tts）功能。

## 基础信息

- **Base URL**: `http://localhost:3456`
- **框架**: FastAPI

## 服务启动

```bash
cd services/media-gen
python app.py
```

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `MEDIA_GEN_PORT` | 3456 | 服务端口 |
| `MEDIA_GEN_BASE_URL` | http://localhost:3456 | 基础 URL |
| `MEDIA_OUTPUT_DIR` | output | 输出目录（包含 image/、video/、voice/ 子目录） |
| `MEDIA_GEN_DEVICE` | auto | 设备（auto/cpu，macOS 自动检测 MPS） |
| `SD_MODEL` | runwayml/stable-diffusion-v1-5 | 图片生成模型 |
| `COGVIDEOX_MODEL` | THUDM/CogVideoX-2b | 视频生成模型 |
| `EDGE_TTS_VOICE` | zh-CN-XiaoxiaoNeural | 默认语音 |
| `MEDIA_VIDEO_FORCE_LOCAL` | (空) | 设为 1 强制在 macOS 本地生成视频 |

---

## 图片生成

### 生成图片

```
POST /image/generate
```

异步生成图片，返回 jobId 后需轮询状态。

**请求体:**
```json
{
  "prompt": "a beautiful sunset over the ocean",
  "negativePrompt": "ugly, blurry, low quality"
}
```

**参数说明:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `prompt` | string | 是 | 图片描述 |
| `negativePrompt` | string | 否 | 负面提示词 |

**响应:**
```json
{
  "jobId": "job-a1b2c3d4e5f6"
}
```

---

### 查询生成状态

```
GET /image/generate/{jobId}
```

**响应示例（进行中）:**
```json
{
  "status": "pending"
}
```

**响应示例（成功）:**
```json
{
  "status": "succeeded",
  "imageUrl": "http://localhost:3456/output/image/job-a1b2c3d4e5f6.png"
}
```

**响应示例（失败）:**
```json
{
  "status": "failed",
  "error": "Error message"
}
```

---

### 获取图片

```
GET /output/image/{jobId}.png
```

返回 PNG 格式的图片文件。

---

## 视频生成

### 生成视频

```
POST /video/generate
```

异步生成视频，返回 jobId 后需轮询状态。

**请求体:**
```json
{
  "prompt": "a bird flying in the sky",
  "imageUrl": "https://example.com/initial-image.png"
}
```

**参数说明:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `prompt` | string | 是 | 视频描述 |
| `imageUrl` | string | 否 | 初始图片 URL |

**响应:**
```json
{
  "jobId": "job-g7h8i9j0k1l2"
}
```

---

### 查询生成状态

```
GET /video/generate/{jobId}
```

与图片状态查询相同，返回 `status`、`videoUrl` 或 `error`。

---

### 获取视频

```
GET /output/video/{jobId}.mp4
```

返回 MP4 格式的视频文件。

---

## 语音合成

### 合成语音

```
POST /voice/synthesize
```

同步合成语音，直接返回音频 URL。

**请求体:**
```json
{
  "text": "你好，欢迎使用语音合成服务",
  "voice": "zh-CN-XiaoxiaoNeural"
}
```

**参数说明:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `text` | string | 是 | 要合成的文本 |
| `voice` | string | 否 | 语音名称，默认 zh-CN-XiaoxiaoNeural |

**响应:**
```json
{
  "audioUrl": "http://localhost:3456/output/voice/job-m3n4o5p6q7r8.mp3"
}
```

---

### 获取语音

```
GET /output/voice/{jobId}.mp3
```

返回 MP3 格式的音频文件。

---

## 使用示例

### Python 请求示例

```python
import requests

# 生成图片
response = requests.post("http://localhost:3456/image/generate", json={
    "prompt": "a cute cat",
    "negativePrompt": "blurry"
})
job_id = response.json()["jobId"]

# 轮询状态
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

### curl 示例

```bash
# 生成图片
curl -X POST "http://localhost:3456/image/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a beautiful landscape"}'

# 语音合成
curl -X POST "http://localhost:3456/voice/synthesize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "voice": "en-US-JennyNeural"}'
```

---

## 错误处理

所有端点可能返回以下错误：

| 状态码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源不存在（如 jobId 错误） |
| 500 | 服务器内部错误 |

---

## 依赖服务

Media Gen 服务依赖：
- PyTorch（图片/视频生成）
- Diffusers（Stable Diffusion、CogVideoX）
- edge-tts（语音合成）

---

中文 | [English](../../en/rd/api/media-gen-api.md)
