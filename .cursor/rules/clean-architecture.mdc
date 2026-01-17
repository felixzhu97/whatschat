# 整洁架构规则

## 核心原则

1. **依赖规则**：依赖必须向内指向 `presentation → application → domain`
2. **基础设施层**：实现 domain 和 application 定义的接口
3. **独立性**：业务逻辑不依赖框架、UI、数据库、外部服务
4. **可测试性**：使用依赖注入和接口抽象

## 依赖方向

```
presentation → application → domain
                    ↑
infrastructure ─────┘ (实现接口)
```

## 四层架构

### Domain Layer（领域层）

**位置**：`apps/web/src/domain/`

**内容**：实体、值对象、仓储接口、领域服务接口

**依赖规则**：

- ✅ 工具函数 (`@iot/utils`)、标准库、纯函数库
- ❌ 框架、UI、数据库、HTTP 客户端、其他层

### Application Layer（应用层）

**位置**：`apps/web/src/application/`

**内容**：用例、应用服务、DTOs

**依赖规则**：

- ✅ domain 层、工具函数、domain 层定义的接口
- ❌ 框架、UI、具体实现、其他层

### Infrastructure Layer（基础设施层）

**位置**：`apps/web/src/infrastructure/`

**内容**：仓储实现、API 客户端、数据库客户端、缓存等

**依赖规则**：

- ✅ domain 和 application 层接口、框架库、数据库客户端、HTTP 客户端
- ❌ presentation 层

### Presentation Layer（展示层）

**位置**：`apps/web/app/`, `apps/web/components/`

**内容**：Next.js 路由、React 组件、API 路由

**依赖规则**：

- ✅ 所有内层、框架库、UI 组件库

## 项目结构

```
apps/web/
├── app/                    # Presentation
├── components/             # Presentation
└── src/
    ├── domain/            # 实体、接口
    ├── application/       # 用例、DTOs
    ├── infrastructure/    # 实现
    └── presentation/       # 可选
```

## Monorepo 包依赖

```
apps/web → packages/ui, packages/charts, packages/utils
packages/ui → packages/utils
packages/charts → packages/utils
packages/utils → (无依赖)
```

**禁止**：`packages/*` 依赖 `apps/*`、循环依赖

## 跨层通信

1. **依赖注入**：通过构造函数注入，不直接实例化
2. **接口隔离**：domain 层定义接口，infrastructure 层实现
3. **DTO 转换**：presentation 和 application 层之间使用 DTOs

## 文件命名

- `*.entity.ts` - 实体
- `*.vo.ts` - 值对象
- `*.repository.ts` - 仓储接口
- `*.repository.impl.ts` - 仓储实现
- `*.use-case.ts` - 用例
- `*.dto.ts` - DTO
- `*.controller.ts` - 控制器
- `*.mapper.ts` - 映射器

## 检查清单

- [ ] domain 层不导入框架代码
- [ ] application 层只导入 domain 层
- [ ] infrastructure 层实现接口
- [ ] presentation 层可以导入所有内层
- [ ] 没有循环依赖
- [ ] 使用依赖注入
- [ ] 通过接口通信

## 实施流程

1. **创建新功能**：domain → application → infrastructure → presentation
2. **重构代码**：提取业务逻辑到 domain/application，技术实现到 infrastructure
3. **测试策略**：domain/application 单元测试，infrastructure 集成测试，presentation 端到端测试
