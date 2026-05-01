# Vision Service API 文档

视觉服务，提供图片标签预测和 NSFW 内容审核功能。

## 基础信息

- **Base URL**: `http://localhost:8001`
- **框架**: FastAPI

## 服务启动

```bash
cd services/vision
python app/main.py
```

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `VISION_TOP_K` | 10 | 返回的标签数量 |
| `VISION_REQUEST_TIMEOUT` | 15.0 | 请求超时（秒） |
| `VISION_MAX_IMAGE_SIZE` | 800 | 最大图片尺寸（像素） |
| `VISION_MODERATION_ENABLED` | true | 是否启用内容审核 |
| `VISION_MODERATION_THRESHOLD` | 0.15 | 内容审核阈值 |
| `VISION_NSFW_ENABLED` | true | 是否启用 NSFW 检测 |
| `VISION_NSFW_THRESHOLD` | 0.35 | NSFW 检测阈值 |
| `VISION_MAX_VIDEO_FRAMES` | 30 | 视频最大抽帧数 |
| `VISION_VIDEO_FRAME_INTERVAL_SEC` | 2.0 | 视频抽帧间隔（秒） |

---

## 健康检查

### 健康状态

```
GET /health
```

**响应:**
```json
{
  "status": "ok",
  "model": "resnet50"
}
```

---

## 图片标签预测

### 预测标签

```
POST /predict
```

识别图片内容，返回标签列表。

**请求方式 1: multipart/form-data**
```
Content-Type: multipart/form-data
file: <图片文件>
```

**请求方式 2: JSON**
```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**响应:**
```json
{
  "labels": ["cat", "tabby_cat", "tiger_cat", "Egyptian_cat"]
}
```

---

## 内容审核

### 审核图片

```
POST /moderate
```

检测图片是否包含违规内容。

**请求方式 1: multipart/form-data**
```
Content-Type: multipart/form-data
file: <图片文件>
```

**请求方式 2: JSON**
```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**响应（安全）:**
```json
{
  "safe": true,
  "categories": []
}
```

**响应（违规）:**
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

### 审核视频

```
POST /moderate-video
```

检测视频是否包含违规内容（通过抽帧检测）。

**请求方式 1: multipart/form-data**
```
Content-Type: multipart/form-data
file: <视频文件>
```

**请求方式 2: JSON**
```json
{
  "video_url": "https://example.com/video.mp4"
}
```

**响应:**
```json
{
  "safe": true,
  "categories": []
}
```

或

```json
{
  "safe": false,
  "categories": [
    {"label": "nude", "score": 0.7234}
  ]
}
```

---

## 使用示例

### Python 请求示例

```python
import requests

# 预测标签
response = requests.post(
    "http://localhost:8001/predict",
    files={"file": open("image.jpg", "rb")}
)
print(response.json())

# 或通过 URL
response = requests.post(
    "http://localhost:8001/predict",
    json={"image_url": "https://example.com/image.jpg"}
)
print(response.json())

# 内容审核
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

### curl 示例

```bash
# 预测标签
curl -X POST "http://localhost:8001/predict" \
  -F "file=@image.jpg"

# 内容审核
curl -X POST "http://localhost:8001/moderate" \
  -F "file=@image.jpg"

# 通过 URL 审核
curl -X POST "http://localhost:8001/moderate" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

---

## 错误处理

| 状态码 | 描述 |
|--------|------|
| 400 | 请求参数错误（如图片过大或格式错误） |
| 500 | 服务器内部错误 |

---

## 违规类别

| 类别 | 描述 |
|------|------|
| `prohibited` | 包含被禁止的内容（如武器、暴力等） |
| `nude` | 检测到裸露内容 |

---

## 依赖模型

- **ResNet50**: ImageNet 预训练模型，用于标签预测
- **NudeNet**: NSFW 检测模型（可选，需额外安装）

---

中文 | [English](../../en/rd/api/vision-api.md)
