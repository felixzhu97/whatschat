# WhatsChat - 完整的 WhatsApp 克隆应用

一个使用 Flutter 开发的功能完整的 WhatsApp 克隆应用，具有现代化的 UI 设计和丰富的功能。

## 📱 功能特性

### 🎨 界面设计

- **现代化 UI**: 完全仿照 WhatsApp 的设计风格
- **深色/浅色主题**: 支持自动切换和手动选择主题
- **响应式设计**: 适配不同屏幕尺寸
- **流畅动画**: 丰富的过渡动画和交互效果

### 💬 聊天功能

- **实时消息**: 支持文本消息的发送和接收
- **消息状态**: 显示消息发送、送达、已读状态
- **消息类型**: 支持文本、图片、视频、音频、文件、位置等多种消息类型
- **消息操作**: 支持回复、转发、删除、星标等操作
- **表情符号**: 内置表情符号选择器
- **输入状态**: 显示对方正在输入的状态

### 📞 通话功能

- **语音通话**: 支持一对一语音通话
- **视频通话**: 支持一对一和群组视频通话
- **通话记录**: 完整的通话历史记录
- **通话状态**: 显示通话状态（拨出、接听、未接等）

### 📷 状态功能

- **状态更新**: 发布文字、图片、视频状态
- **状态查看**: 查看好友的状态更新
- **隐私控制**: 控制谁可以看到你的状态
- **24小时限制**: 状态自动过期机制

### ⚙️ 设置功能

- **用户资料**: 编辑个人信息和头像
- **隐私设置**: 控制最后上线时间、头像等可见性
- **通知设置**: 自定义通知提醒
- **聊天设置**: 聊天壁纸、主题等个性化设置
- **存储管理**: 管理聊天记录和媒体文件

## 🏗️ 技术架构

### 📦 核心依赖

- **Flutter**: 跨平台移动应用开发框架
- **Provider** (^6.0.3): 状态管理
- **Cached Network Image** (^3.2.0): 图片缓存和加载
- **Adaptive Theme** (^3.4.1): 主题管理（支持深色/浅色模式）
- **Font Awesome Flutter** (^10.1.0): 图标库
- **Timeago** (^3.2.2): 时间格式化（如"2小时前"）
- **Flutter Lints** (^2.0.0): 代码规范和静态分析

### 📁 项目结构

```
lib/
├── main.dart                 # 应用入口
├── models/                   # 数据模型
│   ├── user.dart            # 用户模型
│   ├── chat.dart            # 聊天模型
│   ├── message.dart         # 消息模型
│   ├── status.dart          # 状态模型
│   ├── call.dart            # 通话模型
│   └── models.dart          # 模型导出文件
├── screens/                  # 页面
│   ├── home_screen.dart     # 主页面
│   ├── chat_list_screen.dart # 聊天列表
│   ├── chat_detail_screen.dart # 聊天详情
│   ├── status_screen.dart   # 状态页面
│   ├── calls_screen.dart    # 通话页面
│   └── settings_screen.dart # 设置页面
├── widgets/                  # 自定义组件
│   ├── message_bubble.dart  # 消息气泡
│   └── chat_input_field.dart # 聊天输入框
├── themes/                   # 主题配置
│   └── app_theme.dart       # 应用主题
└── services/                 # 服务层
```

### 🎨 设计模式

- **MVVM 架构**: 分离视图和业务逻辑
- **Provider 状态管理**: 响应式状态更新
- **Repository 模式**: 数据访问抽象层
- **单例模式**: 服务类的生命周期管理

## 🚀 快速开始

### 环境要求

- Flutter SDK >= 3.0.0
- Dart SDK >= 2.17.0
- Android Studio / VS Code / Android Studio
- iOS 模拟器 / Android 模拟器（用于测试）
- CocoaPods（iOS 开发，macOS 系统）

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd whatschat/apps/mobile
```

2. **安装依赖**

```bash
flutter pub get
```

3. **运行应用**

```bash
flutter run
```

### 平台支持

- ✅ Android
- ✅ iOS
- ✅ Web
- ✅ macOS
- ✅ Windows
- ✅ Linux

## 📸 应用截图

### 主界面

- 底部导航栏包含聊天、状态、通话、设置四个主要模块
- 悬浮按钮支持快速创建新聊天或状态

### 聊天列表

- 显示所有聊天对话
- 支持搜索、置顶、静音、归档等操作
- 显示未读消息数量和最后消息预览

### 聊天详情

- 完整的消息收发功能
- 支持多种消息类型
- 消息状态指示器
- 丰富的附件发送选项

### 状态页面

- 查看和发布状态更新
- 支持文字、图片、视频状态
- 状态查看统计

### 通话页面

- 完整的通话记录
- 支持重新拨打
- 通话类型和状态显示

### 设置页面

- 完整的用户设置选项
- 主题切换功能
- 隐私和安全设置

## 🔧 自定义配置

### 主题自定义

在 `lib/themes/app_theme.dart` 中可以自定义应用的颜色主题：

```dart
static const Color primaryGreen = Color(0xFF00A884);
static const Color lightGreen = Color(0xFF25D366);
// 更多颜色配置...
```

### 功能开关

在各个页面中可以启用或禁用特定功能：

```dart
// 示例：禁用语音消息功能
ChatInputField(
  // ...其他参数
  onSendVoice: null, // 设置为 null 禁用
)
```

## 🎯 即将推出

- [ ] 端到端加密
- [ ] 语音/视频通话实现
- [ ] 文件传输功能
- [ ] 群组管理
- [ ] 消息搜索
- [ ] 聊天备份
- [ ] 多语言支持
- [ ] 推送通知
- [ ] 联系人同步
- [ ] 二维码分享

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 这个项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

这个项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- Flutter 团队提供了优秀的跨平台开发框架
- WhatsApp 提供了优秀的设计参考
- 开源社区提供了丰富的插件和工具

## 📞 联系方式

如果你有任何问题或建议，欢迎联系我们：

- Email: z1434866867@gmail.com
- GitHub Issues: [在这里提交问题](https://github.com/your-username/whatschat/issues)

## 🔗 相关链接

- [项目根目录 README](../../README.md)
- [服务器文档](../../docs/server/README.md)
- [架构文档](../../docs/README.md)

---

**注意**: 这是一个学习和演示项目，仅用于教育目的。请不要将其用于商业用途。
