# Postman API 测试指南

## 快速开始

### 1. 导入 Postman Collection

1. 打开 Postman
2. 点击左上角的 **Import** 按钮
3. 选择文件：`docs/api/whatschat-api.postman_collection.json`
4. 点击 **Import** 完成导入

### 2. 配置环境变量

在 Postman 中设置以下环境变量：

#### 创建新环境
1. 点击右上角的 **Environments** 图标
2. 点击 **+** 创建新环境
3. 命名为 "WhatsChat Local" 或 "WhatsChat Dev"

#### 设置变量
添加以下变量：

| 变量名 | 初始值 | 当前值 |
|--------|--------|--------|
| `base_url` | `http://localhost:3001` | `http://localhost:3001` |
| `access_token` | (留空) | (自动填充) |
| `refresh_token` | (留空) | (自动填充) |

### 3. 选择环境
在 Postman 右上角选择刚创建的环境。

## 测试流程

### 步骤 1: 健康检查
1. 打开 **健康检查** > **基础健康检查**
2. 点击 **Send**
3. 预期结果：状态码 `200`，返回健康状态

### 步骤 2: 用户注册
1. 打开 **认证** > **用户注册**
2. 修改请求体中的用户信息（避免重复注册）：
   ```json
   {
     "username": "testuser123",
     "email": "test123@example.com",
     "password": "Test123456",
     "phone": "13800138000"
   }
   ```
3. 点击 **Send**
4. 预期结果：状态码 `201`，返回用户信息和 token
5. **重要**：复制返回的 `token` 和 `refreshToken`，手动设置到环境变量中

### 步骤 3: 用户登录
1. 打开 **认证** > **用户登录**
2. 使用注册时的邮箱和密码：
   ```json
   {
     "email": "test123@example.com",
     "password": "Test123456"
   }
   ```
3. 点击 **Send**
4. 预期结果：状态码 `200`，返回用户信息和 token
5. **自动保存 token**：在 **Tests** 标签页添加以下代码（如果还没有）：
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       if (jsonData.data && jsonData.data.token) {
           pm.environment.set("access_token", jsonData.data.token);
       }
       if (jsonData.data && jsonData.data.refreshToken) {
           pm.environment.set("refresh_token", jsonData.data.refreshToken);
       }
   }
   ```

### 步骤 4: 获取当前用户信息
1. 打开 **认证** > **获取当前用户信息**
2. 点击 **Send**
3. 预期结果：状态码 `200`，返回当前登录用户信息

### 步骤 5: 测试其他接口

#### 消息接口
- **获取消息列表**: `GET /api/v1/messages/:chatId`
- **发送消息**: `POST /api/v1/messages`
- **更新消息**: `PUT /api/v1/messages/:messageId`
- **删除消息**: `DELETE /api/v1/messages/:messageId`

#### 聊天接口
- **获取聊天列表**: `GET /api/v1/chats`
- **创建聊天**: `POST /api/v1/chats`
- **获取聊天详情**: `GET /api/v1/chats/:id`
- **更新聊天**: `PUT /api/v1/chats/:id`
- **删除聊天**: `DELETE /api/v1/chats/:id`

#### 用户接口
- **获取用户列表**: `GET /api/v1/users`
- **获取用户详情**: `GET /api/v1/users/:id`

#### 群组接口
- **获取群组列表**: `GET /api/v1/groups`
- **创建群组**: `POST /api/v1/groups`
- **获取群组详情**: `GET /api/v1/groups/:id`
- **更新群组**: `PUT /api/v1/groups/:id`
- **删除群组**: `DELETE /api/v1/groups/:id`

#### 通话接口
- **获取通话记录**: `GET /api/v1/calls`
- **发起通话**: `POST /api/v1/calls`
- **获取通话详情**: `GET /api/v1/calls/:id`
- **接听通话**: `PUT /api/v1/calls/:id/answer`
- **拒绝通话**: `PUT /api/v1/calls/:id/reject`
- **结束通话**: `PUT /api/v1/calls/:id/end`

#### 状态接口
- **获取状态列表**: `GET /api/v1/status`
- **创建状态**: `POST /api/v1/status`
- **获取状态详情**: `GET /api/v1/status/:id`
- **删除状态**: `DELETE /api/v1/status/:id`

## 自动保存 Token 脚本

为了自动保存登录后的 token，在 **用户登录** 请求的 **Tests** 标签页添加：

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("access_token", jsonData.data.token);
        console.log("Access token saved:", jsonData.data.token);
    }
    if (jsonData.data && jsonData.data.refreshToken) {
        pm.environment.set("refresh_token", jsonData.data.refreshToken);
        console.log("Refresh token saved:", jsonData.data.refreshToken);
    }
}
```

在 **用户注册** 请求的 **Tests** 标签页也添加相同的脚本。

## 常见问题

### 1. 401 Unauthorized
- 检查 `access_token` 环境变量是否已设置
- 确认 token 未过期
- 尝试重新登录获取新 token

### 2. 409 Conflict (用户已存在)
- 修改注册请求中的 `email` 和 `username` 为唯一值

### 3. 400 Bad Request
- 检查请求体格式是否正确（JSON）
- 确认必填字段都已提供
- 检查字段验证规则（如密码强度、邮箱格式等）

### 4. 500 Internal Server Error
- 检查服务器日志
- 确认数据库连接正常
- 检查环境变量配置

## 测试检查清单

- [ ] 健康检查接口正常
- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] Token 自动保存到环境变量
- [ ] 获取当前用户信息成功
- [ ] 所有需要认证的接口都能正常访问
- [ ] 刷新 token 功能正常
- [ ] 登出功能正常

## 服务器地址

- **本地开发**: `http://localhost:3001`
- **API 文档**: `http://localhost:3001/api/docs` (Swagger UI)

## 注意事项

1. 确保服务器正在运行：`pnpm dev` (在 `apps/server` 目录)
2. 确保数据库连接正常（开发环境允许连接失败，但功能会受限）
3. 某些接口返回 `NOT_IMPLEMENTED` 是正常的，这些功能还未实现
4. 测试时注意清理测试数据，避免影响后续测试

