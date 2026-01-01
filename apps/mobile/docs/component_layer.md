# 组件层文档

## 业务组件

### JokeCard (src/components/JokeCard.tsx)

- 显示笑话内容的卡片组件
- 包含圆角、阴影等视觉效果
- 使用 styled-components 定义样式

### GenerateButton (src/components/GenerateButton.tsx)

- 生成按钮组件(策略模式实现)
- 组合生成内容策略和清缓存策略
- 与历史记录(hooks/useHistory)交互

### GenerateButtonStrategy (src/components/GenerateButtonStrategy.tsx)

- 按钮策略容器组件
- 渲染主按钮和清缓存按钮
- 主按钮触发生成内容策略
- 清缓存按钮触发清缓存策略

### GenerateContentStrategy (src/components/GenerateContentStrategy.tsx)

- 生成内容策略实现
- 执行生成内容操作
- 将结果添加到历史记录
- 自动滚动到底部(如果有 scrollRef)

### ClearCacheStrategy (src/components/ClearCacheStrategy.tsx)

- 清缓存策略实现
- 显示确认对话框
- 清空 AsyncStorage 中的历史记录
- 更新 UI 状态
- 处理错误情况
