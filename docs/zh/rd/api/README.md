# API 文档

本文件夹包含 WhatsChat 所有服务的 API 文档。

## 服务列表

| 服务 | 端口 | 描述 |
|------|------|------|
| [Server (NestJS)](./server-api.md) | 3001 | 主 API 服务器 |
| [RAG Service](./rag-api.md) | 8002 | 语义搜索和 RAG |
| [Media Gen](./media-gen-api.md) | 3456 | 图片、视频、语音生成 |
| [Vision](./vision-api.md) | 8001 | 图片标签和内容审核 |
| [Recommendation](./recommendation-api.md) | 8000 | 信息流排序和召回 |

---

## 快速链接

### RAG 服务（语义搜索）
- [RAG API](./rag-api.md) - 文档上传、网页爬虫、RAG 查询

### 媒体生成
- [Media Gen API](./media-gen-api.md) - 图片/视频/语音合成

### 视觉与审核
- [Vision API](./vision-api.md) - 图片标签和 NSFW 检测

### 推荐系统
- [Recommendation API](./recommendation-api.md) - 信息流排序和召回

---

## 服务器 API

### Postman 集合

- [whatschat-api.postman_collection.json](../../zh/rd/api/whatschat-api.postman_collection.json) – WhatsChat 服务器 API 的完整 Postman 测试集合

#### 包含测试用例：
- 健康检查
- 用户认证
- 消息
- 文件上传
- WebSocket 连接
- 其他业务接口

### 使用 Postman

1. 打开 Postman
2. 点击 **Import**
3. 选择 `whatschat-api.postman_collection.json`
4. 配置 `base_url` 环境变量：
   - 开发环境: `http://localhost:4000`
   - 生产环境: `https://api.whatschat.com`
5. 运行请求

---

中文 | [English](./README.md)
