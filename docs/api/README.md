# API 文档

本文件夹包含 WhatsChat 项目的 API 相关文档和测试集合。

## 📁 文件说明

### Postman 集合

- [`whatschat-api.postman_collection.json`](./whatschat-api.postman_collection.json) - WhatsChat API 的完整 Postman 测试集合

  包含所有 API 端点的测试用例，包括：
  - 健康检查接口
  - 用户认证接口
  - 消息相关接口
  - 文件上传接口
  - WebSocket 连接测试
  - 其他业务接口

## 🚀 使用方法

### 导入 Postman 集合

1. 打开 Postman 应用
2. 点击左上角的 "Import" 按钮
3. 选择 `whatschat-api.postman_collection.json` 文件
4. 导入完成后，你可以在 Postman 中看到完整的 API 集合

### 配置环境变量

在使用 Postman 集合之前，需要配置以下环境变量：

- `base_url`: API 服务器的基础 URL
  - 开发环境: `http://localhost:3000`
  - 生产环境: `https://api.whatschat.com`

### 运行测试

1. 在 Postman 中选择要测试的 API 端点
2. 确保环境变量已正确配置
3. 点击 "Send" 发送请求
4. 查看响应结果

### 批量运行测试

1. 在 Postman 中选择整个集合或特定文件夹
2. 点击 "Run" 按钮
3. 选择要运行的测试用例
4. 点击 "Run WhatsChat API" 执行批量测试

## 📚 相关文档

- [服务器文档](../server/README.md) - 服务器快速开始和 API 说明
- [API 接口文档](../development/api/api-documentation.md) - 详细的 API 接口文档（如果存在）
- [项目文档首页](../README.md) - 返回文档首页

## 🔧 API 端点分类

根据 Postman 集合，API 端点主要分为以下几类：

- **健康检查**: 服务器状态检查
- **用户认证**: 注册、登录、令牌刷新
- **用户管理**: 用户信息查询和更新
- **消息服务**: 发送、接收、查询消息
- **文件服务**: 文件上传、下载、管理
- **WebSocket**: 实时通信连接

## 📝 注意事项

- 确保服务器已启动并运行
- 某些接口需要先进行用户认证
- 文件上传接口可能需要配置正确的文件路径
- WebSocket 测试需要在 Postman 中启用 WebSocket 支持

## 🔗 参考资源

- [Postman 官方文档](https://learning.postman.com/)
- [Postman 集合格式](https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html)

---

最后更新时间：2025年12月
