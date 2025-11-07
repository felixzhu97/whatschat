# 整洁架构 UML 图索引

本文档包含所有整洁架构相关的 UML 图表，使用 PlantUML 格式编写。

## 📊 图表列表

### 1. 整洁架构分层图

**文件**: `clean-architecture-diagrams.puml`

展示整洁架构的四个核心层次及其依赖关系：

- 框架和驱动层（最外层）
- 接口适配器层
- 用例层
- 实体层（最内层）

**用途**: 理解整体架构分层和依赖方向

---

### 2. Web 应用包结构图

**文件**: `clean-architecture-package-diagram.puml`

展示 Web 应用重构后的完整包结构：

- `domain/` - 实体层
- `application/` - 用例层
- `infrastructure/` - 基础设施层
- `ui/` - UI 组件层

**用途**: 查看 Web 应用的目录组织和模块划分

---

### 3. Server 应用包结构图

**文件**: `clean-architecture-server-diagram.puml`

展示 Server 应用重构后的完整包结构：

- `domain/` - 实体层
- `application/` - 用例层
- `infrastructure/` - 基础设施层（包含 Express、Prisma、Redis）

**用途**: 查看 Server 应用的目录组织和模块划分

---

### 4. 类图示例

**文件**: `clean-architecture-class-diagram.puml`

展示登录用例的完整类图，包括：

- 实体类（User、Message）
- 端口接口（AuthRepositoryPort、AuthServicePort）
- 用例类（LoginUseCase、RegisterUseCase）
- 适配器类（ApiUserRepository、HttpAuthService）
- DTO 类
- 展示层（useAuth Hook、AuthStore）
- UI 组件（LoginForm）

**用途**: 理解各层之间的类关系和依赖

---

### 5. 依赖流向图

**文件**: `clean-architecture-dependency-flow.puml`

展示从 UI 层到实体层的完整依赖流向：

- UI 组件 → 展示层 → 适配器层 → 用例层 → 实体层
- 包含具体的组件依赖关系

**用途**: 理解依赖方向和数据流向

---

### 6. 时序图示例

**文件**: `clean-architecture-sequence-diagram.puml`

展示用户登录流程的完整时序图：

- 从用户输入到后端 API 调用的完整流程
- 展示各层之间的交互顺序
- 包含错误处理流程

**用途**: 理解业务流程在各层之间的执行顺序

---

## 🎨 如何查看图表

### 方法 1: 使用 PlantUML 在线编辑器

1. 访问 [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. 打开对应的 `.puml` 文件
3. 复制内容到在线编辑器
4. 查看渲染后的图表

### 方法 2: 使用 VS Code 插件

1. 安装 `PlantUML` 插件
2. 打开 `.puml` 文件
3. 按 `Alt + D` 预览图表

### 方法 3: 使用本地 PlantUML

```bash
# 安装 PlantUML
npm install -g node-plantuml

# 生成图片
puml generate clean-architecture-diagrams.puml -o output.png
```

### 方法 4: 使用 IntelliJ IDEA / WebStorm

1. 安装 `PlantUML integration` 插件
2. 打开 `.puml` 文件
3. 右键选择 "PlantUML" → "Preview Diagram"

---

## 📐 图表说明

### 颜色编码

- 🟢 **绿色 (LightGreen)**: 实体层（Domain）
- 🔵 **蓝色 (LightBlue)**: 用例层（Application）
- 🟡 **黄色 (LightYellow)**: 基础设施层（Infrastructure）
- 🔴 **红色 (LightCoral)**: UI 层

### 依赖关系符号

- `-->` : 依赖关系（从外向内）
- `..|>` : 实现关系（适配器实现端口接口）
- `-->` : 使用关系

---

## 🔄 图表更新

当项目结构发生变化时，请更新相应的 UML 图：

1. **包结构变化** → 更新包结构图
2. **新增用例** → 更新类图和时序图
3. **依赖关系变化** → 更新依赖流向图

---

## 📚 相关文档

- [整洁架构重构建议](./clean-architecture-refactoring.md) - 详细的重构指南
- [整洁架构快速参考](./clean-architecture-quick-reference.md) - 快速参考指南

---

**最后更新**: 2025-01-25  
**图表格式**: PlantUML  
**版本**: 1.0
