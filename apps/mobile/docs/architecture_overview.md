# 架构总览文档

## 架构分层

1. **服务层**

   - 核心业务逻辑实现
   - 包含笑话服务、历史记录服务等
   - 详细文档: [service_layer.md](service_layer.md)

2. **组件层**

   - UI 组件实现
   - 使用策略模式等设计模式
   - 详细文档: [component_layer.md](component_layer.md)

3. **Hooks 层**

   - 自定义 hooks 封装
   - 状态管理和业务逻辑复用
   - 详细文档: [hooks_layer.md](hooks_layer.md)

4. **应用层**
   - 路由和页面布局
   - 入口配置和全局状态
   - 详细文档: [app_layer.md](app_layer.md)

## 数据流

1. 用户交互触发组件事件
2. 组件调用 hooks 或服务
3. 服务处理业务逻辑
4. 状态更新触发 UI 重新渲染

## 技术栈

- React Native
- Expo
- TypeScript
- Emotion (styled-components)
- React Navigation
