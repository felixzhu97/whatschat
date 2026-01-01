# 服务层文档

## 核心接口 (src/services/core/interfaces.ts)

定义缓存服务接口 `ICacheService<T>` 和基于 Map 的实现 `MapCacheService<T>`:

- `get(key: string)`: 获取缓存值
- `set(key: string, value: T)`: 设置缓存值
- `delete(key: string)`: 删除缓存值
- `clear()`: 清空缓存

## 笑话服务 (src/services/JokeService.ts)

实现 `IJokeService` 接口，提供笑话生成功能:

- `getJoke()`: 获取单个笑话
- `getJokes()`: 批量获取笑话
- `preloadJokes()`: 预加载笑话
- 使用缓存(5 分钟过期)和并发请求管理
- 调用 DeepSeek-V3 API 生成幽默段子或高情商表达

## 历史记录服务 (src/services/HistoryService.ts)

管理用户历史记录:

- `initialize()`: 初始化历史记录
- `addItem()`: 添加历史记录项
- `clearHistory()`: 清空历史记录
- `getItems()`: 获取历史记录列表

## 历史记录模型 (src/services/models/History.ts)

定义历史记录数据结构:

- `HistoryItem`: 历史记录项接口
- `History`: 历史记录集合管理类

## 历史记录仓库接口 (src/services/repositories/IHistoryRepository.ts)

定义历史记录存储接口:

- `save()`: 保存历史记录
- `load()`: 加载历史记录
- `clear()`: 清空存储
