# 分布式系统架构文档

本文件夹包含 WhatsChat 项目的分布式系统架构图表，涵盖了分布式系统中的关键方面：服务拓扑、数据流、服务发现、事务处理、负载均衡、消息队列、数据复制和时序交互。

## 📁 文件列表

### 1. 分布式系统架构图
- **文件**: [`distributed-architecture.puml`](./distributed-architecture.puml)
- **描述**: 展示整体服务拓扑和组件间的通信关系
- **内容**: API服务、WebSocket服务、数据库、缓存、消息队列等组件的部署和交互

### 2. 数据流图
- **文件**: [`data-flow.puml`](./data-flow.puml)
- **描述**: 展示关键业务流程中的数据流动路径
- **内容**: 消息发送、用户认证、文件上传等场景的完整数据流

### 3. 服务发现与注册图
- **文件**: [`service-discovery.puml`](./service-discovery.puml)
- **描述**: 展示 Kubernetes 环境下的服务发现机制
- **内容**: Service、Endpoint、DNS解析、服务注册和发现流程

### 4. 分布式事务处理图
- **文件**: [`distributed-transaction.puml`](./distributed-transaction.puml)
- **描述**: 展示跨服务的分布式事务处理流程
- **内容**: 两阶段提交（2PC）、Saga模式、消息发送和群组操作的事务场景

### 5. 负载均衡与容错图
- **文件**: [`load-balancing-fault-tolerance.puml`](./load-balancing-fault-tolerance.puml)
- **描述**: 展示 Kubernetes 负载均衡和自动扩缩容机制
- **内容**: 健康检查、故障转移、熔断降级、多实例部署和故障恢复

### 6. 消息队列架构图
- **文件**: [`message-queue.puml`](./message-queue.puml)
- **描述**: 展示基于 Redis Pub/Sub 的消息队列架构
- **内容**: 生产者、消费者、主题订阅、实时消息推送和离线消息队列

### 7. 数据复制与分片图
- **文件**: [`data-replication.puml`](./data-replication.puml)
- **描述**: 展示 PostgreSQL 主从复制架构
- **内容**: 读写分离、数据同步、故障切换、数据备份和恢复策略

### 8. 服务间通信时序图
- **文件**: [`service-communication-sequence.puml`](./service-communication-sequence.puml)
- **描述**: 展示关键业务流程的时序交互
- **内容**: 用户登录、消息发送、实时推送、群组创建等场景的完整时序

## 🔧 技术栈

WhatsChat 分布式系统基于以下技术栈：

- **应用框架**: NestJS + TypeScript
- **数据库**: PostgreSQL（主从复制）
- **缓存/消息队列**: Redis (ioredis) + Pub/Sub
- **实时通信**: Socket.io + WebSocket
- **容器编排**: Kubernetes + Docker
- **服务发现**: Kubernetes Service Discovery
- **负载均衡**: Kubernetes Service + Ingress

## 📊 如何查看图表

### 方法一：在线查看

1. 访问 [PlantUML 在线编辑器](https://www.plantuml.com/plantuml/uml/)
2. 将 `.puml` 文件内容复制到编辑器中
3. 点击 "Submit" 生成图片

### 方法二：使用 VS Code 插件

1. 安装 [PlantUML 插件](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
2. 在 VS Code 中打开 `.puml` 文件
3. 按 `Alt+D` 预览图片

### 方法三：本地安装 PlantUML

```bash
# 安装 Java (如果未安装)
brew install java

# 安装 PlantUML
brew install plantuml

# 生成所有图表的 PNG 图片
plantuml docs/distributed-systems/*.puml

# 生成 SVG 图片
plantuml -tsvg docs/distributed-systems/*.puml

# 生成特定图表
plantuml docs/distributed-systems/distributed-architecture.puml
```

## 🎯 使用场景

### 架构师
- **系统设计**: 理解分布式系统各组件的关系和交互
- **技术选型**: 评估分布式技术方案的合理性
- **架构演进**: 规划系统扩展和优化方向

### 开发人员
- **新人入职**: 快速了解分布式系统架构
- **功能开发**: 明确服务边界和调用关系
- **问题排查**: 理解数据流和调用链路

### 运维工程师
- **部署规划**: 理解服务部署和依赖关系
- **故障处理**: 快速定位分布式系统中的问题
- **性能优化**: 识别瓶颈和改进点

### 项目管理
- **技术评估**: 理解系统复杂度和技术风险
- **团队协作**: 明确不同服务的职责边界
- **进度跟踪**: 基于架构模块划分开发任务

## 📚 相关文档

- [C4 架构图](../architecture/README.md) - 系统架构的C4模型视图
- [部署架构图](../architecture/c4-deployment.puml) - 生产环境部署结构
- [项目文档首页](../README.md) - 返回文档首页

## 🔗 参考资源

- [PlantUML 官方网站](https://plantuml.com/)
- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [分布式系统设计模式](https://microservices.io/patterns/)
- [Redis Pub/Sub 文档](https://redis.io/docs/manual/pubsub/)

---

最后更新时间：2025年12月

