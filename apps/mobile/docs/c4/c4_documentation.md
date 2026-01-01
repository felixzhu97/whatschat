# React Native 应用 C4 模型文档

## 1. 系统上下文图

![系统上下文图](./diagrams/system_context.puml)

**主要元素：**

- 用户：移动用户
- 系统：笑话生成 App
- 外部系统：笑话 API

## 2. 容器图

![容器图](./diagrams/containers.puml)

**技术栈：**

- 移动端：React Native
- 存储：AsyncStorage

## 3. 组件图

![组件图](./diagrams/components.puml)

**核心服务：**

- JokeService：笑话生成
- HistoryService：历史记录管理

## 使用说明

1. 确保已安装 PlantUML 插件
2. 在 VSCode 中打开.puml 文件即可预览
3. 或使用在线查看器：https://www.plantuml.com/plantuml/uml/
