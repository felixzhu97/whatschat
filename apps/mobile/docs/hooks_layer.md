# Hooks 层文档

## useHistory (src/hooks/useHistory.ts)

- 历史记录管理 hook
- 提供历史记录上下文(HistoryContext)
- 从 AsyncStorage 加载/保存历史记录
- 添加历史记录项(addToHistory)
- 清空历史记录(clearHistory)

## useJokeGenerator (src/hooks/useJokeGenerator.ts)

- 笑话生成逻辑 hook
- 管理生成状态(isLoading, error)
- 初始化历史记录
- 生成笑话并添加到历史记录
- 返回生成结果和状态

## useColorScheme (src/hooks/useColorScheme.ts)

- 主题模式检测 hook
- 直接导出 React Native 的 useColorScheme

## useThemeColor (src/hooks/useThemeColor.ts)

- 主题颜色应用 hook
- 根据当前主题(light/dark)返回对应颜色
- 可以覆盖默认颜色配置
- 基于 Colors 常量定义的颜色方案
