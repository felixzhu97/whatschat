# WhatsFeed Mobile (`apps/mobile`)

React Native + Expo（SDK 55+）客户端，与 `services/server` API 对接；UI 对齐 Instagram（信息流、Reels、私信、探索/搜索、个人主页与「Settings and activity」设置栈）。

## 技术栈

- **路由**：expo-router（`(tabs)` + 独立 Stack 屏）
- **状态**：Redux Toolkit、`feedApi`（RTK Query）、`@whatschat/im` 聊天与 RTC
- **样式**：Emotion（`@emotion/native`）、主题（浅/深/系统，AsyncStorage）
- **国际化**：i18next（`src/locales/en.ts`、`zh.ts`）
- **数据访问**：`src/application/services/FeedService.ts`（GraphQL feed/reels；REST explore、search、`/users/:id`、`/posts/user/:id`、`/posts/:id`、用户推荐等）；与 RTK Query 并存

## Tab 与主要路由

| Tab / 路由 | 说明 |
|------------|------|
| `(tabs)/status` | 首页：Stories + 纵向 Feed（多媒体轮播） |
| `(tabs)/reels` | Reels 竖屏流 |
| `(tabs)/chats` | 私信列表（Ins 风格行） |
| `(tabs)/explore` | 搜索 / Explore：探索网格 + Elasticsearch 搜索 |
| `(tabs)/profile` | **Profile**：个人主页网格与 Discover |
| `settings-menu` | **Settings and activity**：分组设置、主题、语言、登出 |
| `create-post` | 发帖（先上传媒体再提交） |
| `media-viewer` | 全屏媒体；可按 `postId` 单独拉帖 |
| `notifications`、`inbox`、`chat-detail` 等 | 通知、收件箱、会话详情 |

## 运行

在仓库根目录（推荐）：

```bash
pnpm install
pnpm start:mobile:ios
```

或在本目录：

```bash
pnpm exec expo start
```

环境：与 Web 相同 API 基址（见根目录 `README.md` 与 `services/server/.env`）。

## 文档

- 仓库根 [README.md](../../README.md)
- C4 移动端组件图：[docs/en/rd/c4/components-mobile-app.puml](../../docs/en/rd/c4/components-mobile-app.puml)
- TOGAF 应用架构：[docs/en/rd/togaf/application-architecture.puml](../../docs/en/rd/togaf/application-architecture.puml)

## 许可证

与主仓库一致（MIT）。
