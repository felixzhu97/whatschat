# WhatsChat API 文档

## 📋 概述

WhatsChat API 是一个基于 RESTful 架构的即时通讯服务接口，提供用户认证、消息管理、聊天功能、群组管理等核心功能。

### 基础信息

- **Base URL**: `http://localhost:3001/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式

所有API响应都遵循统一的格式：

```json
{
  "success": true|false,
  "message": "操作结果描述",
  "data": {}, // 响应数据（可选）
  "error": "错误详情" // 仅在开发环境显示（可选）
}
```

### 状态码说明

| 状态码 | 说明           |
| ------ | -------------- |
| 200    | 请求成功       |
| 201    | 创建成功       |
| 400    | 请求参数错误   |
| 401    | 未授权访问     |
| 403    | 禁止访问       |
| 404    | 资源不存在     |
| 409    | 资源冲突       |
| 422    | 数据验证失败   |
| 500    | 服务器内部错误 |

---

## 🔐 认证 API

### 用户注册

**POST** `/auth/register`

创建新用户账户。

#### 请求参数

```json
{
  "username": "string", // 必填，3-20个字符，只能包含字母、数字和下划线
  "email": "string", // 必填，有效邮箱地址
  "password": "string", // 必填，至少6个字符，必须包含大小写字母和数字
  "phone": "string" // 可选，中国手机号码
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "phone": "13800138000",
      "avatar": null,
      "status": "在线"
    },
    "token": "jwt_access_token"
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "message": "用户已存在"
}
```

### 用户登录

**POST** `/auth/login`

用户登录获取访问令牌。

#### 请求参数

```json
{
  "email": "string", // 必填，用户邮箱
  "password": "string" // 必填，用户密码
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "phone": "13800138000",
      "avatar": null,
      "status": "在线"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### 刷新令牌

**POST** `/auth/refresh-token`

使用刷新令牌获取新的访问令牌。

#### 请求参数

```json
{
  "refreshToken": "string" // 必填，刷新令牌
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "令牌刷新成功",
  "data": {
    "token": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### 用户登出

**POST** `/auth/logout`

用户登出，使令牌失效。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 响应示例

```json
{
  "success": true,
  "message": "登出成功"
}
```

### 获取当前用户信息

**GET** `/auth/me`

获取当前登录用户的详细信息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "status": "在线",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 更新用户资料

**PUT** `/auth/profile`

更新当前用户的个人资料。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 请求参数

```json
{
  "username": "string", // 可选，3-20个字符
  "status": "string" // 可选，状态信息，最多100个字符
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "资料更新成功",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "new_username",
    "phone": "13800138000",
    "avatar": null,
    "status": "忙碌中"
  }
}
```

### 修改密码

**PUT** `/auth/change-password`

修改用户密码。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 请求参数

```json
{
  "currentPassword": "string", // 必填，当前密码
  "newPassword": "string" // 必填，新密码，至少6个字符，必须包含大小写字母和数字
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "密码修改成功"
}
```

### 忘记密码

**POST** `/auth/forgot-password`

发送密码重置邮件。

#### 请求参数

```json
{
  "email": "string" // 必填，用户邮箱
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "密码重置邮件已发送"
}
```

### 重置密码

**POST** `/auth/reset-password`

使用重置令牌设置新密码。

#### 请求参数

```json
{
  "token": "string", // 必填，重置令牌
  "newPassword": "string" // 必填，新密码
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "密码重置成功"
}
```

---

## 👥 用户管理 API

### 获取用户列表

**GET** `/users`

获取用户列表，支持分页和搜索。

#### 查询参数

| 参数   | 类型   | 必填 | 说明                    |
| ------ | ------ | ---- | ----------------------- |
| page   | number | 否   | 页码，默认1             |
| limit  | number | 否   | 每页数量，1-100，默认20 |
| search | string | 否   | 搜索关键词              |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "username",
        "email": "user@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "status": "在线"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 获取用户详情

**GET** `/users/:id`

获取指定用户的详细信息。

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 用户ID |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "username",
    "email": "user@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "status": "在线",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 更新用户信息

**PUT** `/users/:id`

更新指定用户的信息（管理员权限）。

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 用户ID |

#### 请求参数

```json
{
  "username": "string",
  "status": "string",
  "avatar": "string"
}
```

### 删除用户

**DELETE** `/users/:id`

删除指定用户（管理员权限）。

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 用户ID |

### 阻止用户

**POST** `/users/:id/block`

阻止指定用户。

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 用户ID |

### 取消阻止用户

**DELETE** `/users/:id/block`

取消阻止指定用户。

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 用户ID |

---

## 💬 消息管理 API

### 获取聊天消息

**GET** `/messages/:chatId`

获取指定聊天的消息列表。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数   | 类型   | 说明   |
| ------ | ------ | ------ |
| chatId | string | 聊天ID |

#### 查询参数

| 参数   | 类型   | 必填 | 说明             |
| ------ | ------ | ---- | ---------------- |
| page   | number | 否   | 页码，默认1      |
| limit  | number | 否   | 每页数量，默认20 |
| search | string | 否   | 搜索关键词       |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "Hello World",
        "type": "text",
        "senderId": "uuid",
        "chatId": "uuid",
        "metadata": {},
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 发送消息

**POST** `/messages`

发送新消息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 请求参数

```json
{
  "content": "string", // 必填，消息内容
  "type": "string", // 必填，消息类型：text|image|video|audio|file
  "chatId": "string", // 必填，聊天ID
  "metadata": {} // 可选，消息元数据
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "消息发送成功",
  "data": {
    "id": "uuid",
    "content": "Hello World",
    "type": "text",
    "senderId": "uuid",
    "chatId": "uuid",
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 更新消息

**PUT** `/messages/:messageId`

更新指定消息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数      | 类型   | 说明   |
| --------- | ------ | ------ |
| messageId | string | 消息ID |

#### 请求参数

```json
{
  "content": "string",
  "metadata": {}
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "消息更新成功",
  "data": {
    "id": "uuid",
    "content": "Updated message",
    "type": "text",
    "senderId": "uuid",
    "chatId": "uuid",
    "metadata": {},
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 删除消息

**DELETE** `/messages/:messageId`

删除指定消息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数      | 类型   | 说明   |
| --------- | ------ | ------ |
| messageId | string | 消息ID |

#### 响应示例

```json
{
  "success": true,
  "message": "消息删除成功"
}
```

---

## 💬 聊天管理 API

### 获取聊天列表

**GET** `/chats`

获取当前用户的聊天列表。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "聊天名称",
      "type": "private|group",
      "participants": [
        {
          "id": "uuid",
          "username": "username",
          "avatar": "https://example.com/avatar.jpg"
        }
      ],
      "lastMessage": {
        "id": "uuid",
        "content": "最后一条消息",
        "senderId": "uuid",
        "createdAt": "2024-01-01T00:00:00Z"
      },
      "unreadCount": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 创建聊天

**POST** `/chats`

创建新的聊天。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 请求参数

```json
{
  "name": "string", // 可选，聊天名称
  "type": "private|group", // 必填，聊天类型
  "participants": ["uuid"] // 必填，参与者ID列表
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "聊天创建成功",
  "data": {
    "id": "uuid",
    "name": "聊天名称",
    "type": "private",
    "participants": [
      {
        "id": "uuid",
        "username": "username",
        "avatar": "https://example.com/avatar.jpg"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取聊天详情

**GET** `/chats/:id`

获取指定聊天的详细信息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 聊天ID |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "聊天名称",
    "type": "private",
    "participants": [
      {
        "id": "uuid",
        "username": "username",
        "avatar": "https://example.com/avatar.jpg",
        "role": "admin|member"
      }
    ],
    "settings": {
      "muted": false,
      "archived": false
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 更新聊天信息

**PUT** `/chats/:id`

更新聊天信息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 聊天ID |

#### 请求参数

```json
{
  "name": "string",
  "description": "string"
}
```

### 删除聊天

**DELETE** `/chats/:id`

删除指定聊天。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 聊天ID |

### 归档聊天

**POST** `/chats/:id/archive`

归档指定聊天。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 聊天ID |

### 静音聊天

**POST** `/chats/:id/mute`

静音指定聊天。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 聊天ID |

---

## 👥 群组管理 API

### 获取群组列表

**GET** `/groups`

获取当前用户参与的群组列表。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "群组名称",
      "description": "群组描述",
      "avatar": "https://example.com/group-avatar.jpg",
      "participantCount": 10,
      "role": "admin|member",
      "lastMessage": {
        "id": "uuid",
        "content": "最后一条消息",
        "senderId": "uuid",
        "createdAt": "2024-01-01T00:00:00Z"
      },
      "unreadCount": 3,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 创建群组

**POST** `/groups`

创建新的群组。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 请求参数

```json
{
  "name": "string", // 必填，群组名称
  "description": "string", // 可选，群组描述
  "avatar": "string", // 可选，群组头像URL
  "participants": ["uuid"] // 必填，初始成员ID列表
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "群组创建成功",
  "data": {
    "id": "uuid",
    "name": "群组名称",
    "description": "群组描述",
    "avatar": "https://example.com/group-avatar.jpg",
    "participants": [
      {
        "id": "uuid",
        "username": "username",
        "avatar": "https://example.com/avatar.jpg",
        "role": "admin"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取群组详情

**GET** `/groups/:id`

获取指定群组的详细信息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 群组ID |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "群组名称",
    "description": "群组描述",
    "avatar": "https://example.com/group-avatar.jpg",
    "participants": [
      {
        "id": "uuid",
        "username": "username",
        "avatar": "https://example.com/avatar.jpg",
        "role": "admin",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "settings": {
      "muted": false,
      "archived": false
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 更新群组信息

**PUT** `/groups/:id`

更新群组信息（需要管理员权限）。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 群组ID |

#### 请求参数

```json
{
  "name": "string",
  "description": "string",
  "avatar": "string"
}
```

### 删除群组

**DELETE** `/groups/:id`

删除群组（需要管理员权限）。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 群组ID |

### 添加群组成员

**POST** `/groups/:id/participants`

添加新成员到群组。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 群组ID |

#### 请求参数

```json
{
  "userIds": ["uuid"] // 必填，要添加的用户ID列表
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "成员添加成功",
  "data": {
    "addedParticipants": [
      {
        "id": "uuid",
        "username": "username",
        "avatar": "https://example.com/avatar.jpg",
        "role": "member"
      }
    ]
  }
}
```

### 移除群组成员

**DELETE** `/groups/:id/participants/:userId`

从群组中移除成员。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数   | 类型   | 说明   |
| ------ | ------ | ------ |
| id     | string | 群组ID |
| userId | string | 用户ID |

#### 响应示例

```json
{
  "success": true,
  "message": "成员移除成功"
}
```

### 更改成员角色

**PUT** `/groups/:id/participants/:userId/role`

更改群组成员角色。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数   | 类型   | 说明   |
| ------ | ------ | ------ |
| id     | string | 群组ID |
| userId | string | 用户ID |

#### 请求参数

```json
{
  "role": "admin|member" // 必填，新角色
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "角色更改成功",
  "data": {
    "userId": "uuid",
    "role": "admin"
  }
}
```

---

## 📞 通话管理 API

### 发起通话

**POST** `/calls`

发起新的音视频通话。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 请求参数

```json
{
  "type": "audio|video", // 必填，通话类型
  "participants": ["uuid"], // 必填，参与者ID列表
  "chatId": "string" // 可选，关联的聊天ID
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "通话发起成功",
  "data": {
    "id": "uuid",
    "type": "video",
    "status": "initiating",
    "participants": [
      {
        "id": "uuid",
        "username": "username",
        "status": "invited"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取通话记录

**GET** `/calls`

获取通话历史记录。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 查询参数

| 参数  | 类型   | 必填 | 说明             |
| ----- | ------ | ---- | ---------------- | ----- |
| page  | number | 否   | 页码，默认1      |
| limit | number | 否   | 每页数量，默认20 |
| type  | string | 否   | 通话类型：audio  | video |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "calls": [
      {
        "id": "uuid",
        "type": "video",
        "status": "completed",
        "duration": 300, // 秒
        "participants": [
          {
            "id": "uuid",
            "username": "username",
            "status": "answered"
          }
        ],
        "startedAt": "2024-01-01T00:00:00Z",
        "endedAt": "2024-01-01T00:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### 获取通话详情

**GET** `/calls/:id`

获取指定通话的详细信息。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 通话ID |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "video",
    "status": "completed",
    "duration": 300,
    "participants": [
      {
        "id": "uuid",
        "username": "username",
        "status": "answered",
        "joinedAt": "2024-01-01T00:00:00Z",
        "leftAt": "2024-01-01T00:05:00Z"
      }
    ],
    "startedAt": "2024-01-01T00:00:00Z",
    "endedAt": "2024-01-01T00:05:00Z"
  }
}
```

### 接听通话

**POST** `/calls/:id/answer`

接听通话。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 通话ID |

#### 响应示例

```json
{
  "success": true,
  "message": "通话已接听"
}
```

### 拒绝通话

**POST** `/calls/:id/reject`

拒绝通话。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 通话ID |

#### 响应示例

```json
{
  "success": true,
  "message": "通话已拒绝"
}
```

### 结束通话

**POST** `/calls/:id/end`

结束通话。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 路径参数

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 通话ID |

#### 响应示例

```json
{
  "success": true,
  "message": "通话已结束"
}
```

---

## 📊 状态管理 API

### 更新在线状态

**PUT** `/status`

更新用户在线状态。

#### 请求头

```
Authorization: Bearer <access_token>
```

#### 请求参数

```json
{
  "status": "online|away|busy|invisible" // 必填，状态类型
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "状态更新成功",
  "data": {
    "status": "online",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取状态列表

**GET** `/status`

获取所有可用的状态选项。

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "key": "online",
      "label": "在线",
      "description": "用户当前在线"
    },
    {
      "key": "away",
      "label": "离开",
      "description": "用户暂时离开"
    },
    {
      "key": "busy",
      "label": "忙碌",
      "description": "用户正在忙碌"
    },
    {
      "key": "invisible",
      "label": "隐身",
      "description": "用户隐身在线"
    }
  ]
}
```

---

## 🏥 健康检查 API

### 系统健康检查

**GET** `/health`

检查系统运行状态。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "uptime": 86400,
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "websocket": "healthy"
    }
  }
}
```

---

## 🔧 WebSocket 事件

### 连接认证

客户端连接时需要发送认证事件：

```javascript
socket.emit("authenticate", {
  token: "jwt_access_token",
});
```

### 消息事件

#### 发送消息

```javascript
socket.emit("send_message", {
  chatId: "uuid",
  content: "Hello World",
  type: "text",
});
```

#### 接收消息

```javascript
socket.on("new_message", (message) => {
  console.log("收到新消息:", message);
});
```

### 通话事件

#### 发起通话

```javascript
socket.emit("start_call", {
  type: "video",
  participants: ["uuid1", "uuid2"],
});
```

#### 通话状态更新

```javascript
socket.on("call_status_update", (data) => {
  console.log("通话状态更新:", data);
});
```

### 在线状态事件

#### 状态更新

```javascript
socket.emit("update_status", {
  status: "online",
});
```

#### 用户状态变化

```javascript
socket.on("user_status_changed", (data) => {
  console.log("用户状态变化:", data);
});
```

---

## 🚨 错误处理

### 常见错误码

| 错误码   | 说明           | 解决方案           |
| -------- | -------------- | ------------------ |
| AUTH_001 | 令牌无效或过期 | 重新登录获取新令牌 |
| AUTH_002 | 用户不存在     | 检查用户ID是否正确 |
| AUTH_003 | 密码错误       | 检查密码是否正确   |
| AUTH_004 | 权限不足       | 联系管理员获取权限 |
| MSG_001  | 消息发送失败   | 检查网络连接和参数 |
| MSG_002  | 聊天不存在     | 检查聊天ID是否正确 |
| CALL_001 | 通话发起失败   | 检查WebRTC配置     |
| CALL_002 | 参与者离线     | 确认参与者在线状态 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "令牌无效或过期",
    "details": "Token has expired"
  }
}
```

---

## 📝 开发注意事项

### 1. 认证机制

- 所有需要认证的API都需要在请求头中包含 `Authorization: Bearer <token>`
- 令牌有效期默认7天，可通过刷新令牌获取新令牌
- 建议在令牌即将过期前主动刷新

### 2. 分页处理

- 所有列表API都支持分页，默认每页20条记录
- 使用 `page` 和 `limit` 参数控制分页
- 响应中包含分页信息

### 3. 数据验证

- 所有输入数据都会进行严格验证
- 验证失败会返回422状态码和详细错误信息
- 建议在前端也进行相同验证以提升用户体验

### 4. 实时通信

- 使用WebSocket进行实时消息推送
- 连接时需要先进行认证
- 支持断线重连机制

### 5. 文件上传

- 支持图片、视频、音频、文档等文件类型
- 文件大小限制为10MB
- 上传成功后返回文件URL

### 6. 性能优化

- 使用Redis缓存热点数据
- 数据库查询支持索引优化
- 支持CDN加速静态资源

---

## 🔗 相关链接

- [WhatsChat 项目主页](../README.md)
- [架构文档](./README.md)
- [开发指南](./development-guide.md)
- [部署指南](./deployment-guide.md)

---

_本文档随API更新持续维护，最后更新时间：2024年1月_
