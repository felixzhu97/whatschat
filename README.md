# WhatsChat

一个现代化的即时通讯应用，基于 React 和 TypeScript 构建，支持实时聊天、语音视频通话、文件共享等功能。

## ✨ 功能特性

- 🔥 **实时聊天** - 支持文本、表情、语音消息
- 📞 **语音视频通话** - 基于 WebRTC 的高质量通话
- 📎 **文件共享** - 支持图片、文档等文件类型
- 👥 **联系人管理** - 添加、删除、搜索联系人
- 🔍 **消息搜索** - 全文搜索聊天记录
- 📱 **响应式设计** - 支持桌面和移动设备

## 🛠️ 技术栈

**前端**: Next.js 14, TypeScript, Tailwind CSS, Radix UI  
**通信**: WebSocket, WebRTC  
**工具**: Turborepo, PNPM, ESLint, Prettier

## 📁 项目结构

```
whatschat/
├── apps/
│   ├── web/              # Web 应用
│   ├── mobile/           # 移动应用
│   └── server/           # 服务器应用
├── docs/                 # 文档和架构图
└── turbo.json           # Turborepo 配置
```

## 🔧 快速开始

### 环境要求

- Node.js >= 18
- PNPM >= 9.0.0

### 安装运行

```bash
# 克隆项目
git clone https://github.com/your-username/whatschat.git
cd whatschat

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 🏗️ 架构设计

查看 `docs/` 文件夹中的 C4 架构图：

- [系统上下文图](docs/01-system-context.puml)
- [容器图](docs/02-container-diagram.puml)
- [组件图](docs/03-component-diagram.puml)
- [代码图](docs/04-code-diagram.puml)
- [架构概览图](docs/05-architecture-overview.puml)

## 👥 作者

- **Felix Zhu** - _初始开发_ - [felix zhu](mailto:z1434866867@gmail.com)

## 📄 许可证

本项目使用 MIT 许可证。

---

<p align="center">
  <strong>WhatsChat - 连接世界，沟通无界</strong>
</p>
