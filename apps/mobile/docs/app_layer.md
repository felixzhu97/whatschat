# 应用层文档

## 根布局 (src/app/\_layout.tsx)

- 应用入口和全局配置
- 提供主题和上下文(HistoryProvider)
- 加载字体资源
- 设置状态栏和模糊效果
- 定义初始路由和标签页导航

## 标签页布局 (src/app/(tabs)/\_layout.tsx)

- 标签页导航配置
- 隐藏默认 header
- 定义 index 页面路由

## 首页 (src/app/(tabs)/index.tsx)

- 显示笑话/高情商表达内容
- 提供场景选择(ScenarioSelector)
- 模式切换(ModeToggle)
- 生成按钮(GenerateButton)
- 管理历史记录和加载状态

## 404 页面 (src/app/+not-found.tsx)

- 未找到路由时的显示页面
