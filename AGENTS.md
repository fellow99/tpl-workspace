# AGENTS.md — 项目开发规范与技能指引

## 一、通用规范

### 1.1 代码风格

- 遵循项目已有代码风格，保持一致性优先于个人偏好。
- 缩进、命名、注释风格与项目现有代码保持一致。
- 如项目无明确规范，遵循语言/框架社区最佳实践：
  - TypeScript/JavaScript：使用 ESLint + Prettier，严格类型（禁用 `any`、`@ts-ignore`）。
  - Python：使用 Ruff + Pyright，类型注解完整。
  - Go：使用 gofumpt + golangci-lint。
- **禁止**通过 `as any`、`@ts-ignore`、`@ts-expect-error` 等方式压制类型错误。
- **禁止**使用空 `catch(e) {}` 吞掉异常。

### 1.2 提交规范（Git Commit）

在提交代码前，**必须**先确认项目中是否已安装 `git-commit` 技能。

> 若未安装，请执行：
> ```
> npx skills add -p -y https://github.com/github/awesome-copilot --skill git-commit
> ```

**所有 Git 提交信息必须遵循 `git-commit` 技能定义的 Conventional Commits 规范**，前缀格式如下：

| 前缀 | 说明 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `docs:` | 文档变更 |
| `style:` | 代码格式（不影响代码运行） |
| `refactor:` | 代码重构 |
| `perf:` | 性能优化 |
| `test:` | 测试相关 |
| `chore:` | 构建/工具/依赖变更 |
| `ci:` | CI 配置变更 |

**示例**：`feat(auth): 添加 JWT 登录验证`, `fix(api): 修复空指针异常`

**⚠️ 严格禁止使用上述前缀之外的任意自定义前缀。**

### 1.3 文档规范

- 所有规范文档、设计文档使用 Markdown 格式。
- 文件名使用小写字母 + 短横线（kebab-case），如 `api-design.md`。
- 中文文档使用 UTF-8 编码。

---

## 二、技能（Skills）清单与使用流程

本项目依赖以下 AI 辅助技能，请在开始相应任务前确认技能已安装。

### 2.1 Speckit 系列（需求 → 规格 → 计划 → 任务 → 实现）

> 若未安装，请执行：
> ```
> npx skills add -p -y https://github.com/dceoy/speckit-agent-skills
> ```

| 技能 | 用途 | 触发时机 |
|------|------|----------|
| `speckit-specify` | 从自然语言描述生成功能规格（spec.md） | 新功能需求提出时 |
| `speckit-clarify` | 识别规格中的模糊点，提出澄清问题 | 规格初稿完成后 |
| `speckit-plan` | 基于规格生成实现计划（plan.md） | 规格确认后 |
| `speckit-tasks` | 生成依赖排序的任务列表（tasks.md） | 计划完成后 |
| `speckit-implement` | 按任务列表逐步实现功能 | 任务列表就绪后 |
| `speckit-checklist` | 生成功能验收清单 | 实现前/验收时 |
| `speckit-analyze` | 跨产物一致性分析（spec ↔ plan ↔ tasks） | 任务生成后 |
| `speckit-constitution` | 创建/更新项目宪章 | 项目初始化或原则变更 |
| `speckit-baseline` | 从现有代码逆向生成规格 | 遗留系统文档化 |
| `speckit-taskstoissues` | 将任务转换为 GitHub Issues | 需要项目管理集成时 |

**Speckit 标准工作流**：

```
需求描述 → speckit-specify → speckit-clarify → speckit-plan → speckit-tasks → speckit-analyze → speckit-implement
                                                                                        ↓
                                                                              speckit-checklist
```

### 2.2 产品 / 需求规划阶段

在进入产品规划或需求分析阶段时，**必须**先确认是否已安装 `brainstorming` 技能。

> 若未安装，请执行：
> ```
> npx skills add -p -y https://github.com/obra/superpowers --skill brainstorming
> ```

**使用方式**：
- 在进行任何创造性工作（功能设计、组件设计、架构调整）之前，使用 `brainstorming` 技能探索用户意图、需求和设计方案。
- 通过 `brainstorming` 的结构化问答流程，明确需求边界、技术约束和验收标准，再进入 speckit 流程。

### 2.3 规范文档编写任务

在编写规范文档（spec、设计文档、架构文档）时，**必须**先确认是否已安装 `specs-as-built` 技能。

> 若未安装，请执行：
> ```
> npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill opus-specs-as-built
> ```

**使用方式**：
- 使用 `specs-as-built` 从现有代码库逆向生成完整的规范文档（spec.md、plan.md、架构文档、数据模型、API 契约等）。
- 适用于已有代码的文档化、重构前的基线建立。

### 2.4 开发任务（全流程）

在执行开发任务时，**必须**确认以下技能均已安装：

> 若未安装，请执行：
> ```
> npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill specs-based-devflow
> npx skills add -p -y https://github.com/obra/superpowers --skill requesting-code-review
> npx skills add -p -y https://github.com/obra/superpowers --skill receiving-code-review
> ```

#### 2.4.1 开发流程（specs-based-devflow）

使用 `specs-based-devflow` 技能执行**从需求到交付**的完整开发流程：

```
需求 → 规格 → 实现 → Code Review → 测试 → Bug 修复 → 回归测试
```

该技能编排了 speckit 系列 + Code Review + 测试修复的完整流水线。

#### 2.4.2 Code Review（requesting-code-review / receiving-code-review）

- **提交审查前**：使用 `requesting-code-review` 技能验证工作是否符合需求。
- **收到审查反馈后**：使用 `receiving-code-review` 技能，带着技术严谨性审视反馈，**不允许**盲目接受或表演性同意所有建议。

#### 2.4.3 调试规范（systematic-debugging）

遇到任何 Bug、测试失败或异常行为时，在提出修复方案**之前**，使用 `systematic-debugging` 技能进行系统性调试：

- 形成 ≥3 个假设
- 并行调查
- 确认根因后再修复
- 先写失败测试锁定问题，再最小化修复

### 2.5 前端界面开发任务

在执行前端 UI/UX 开发任务时，除上述开发流程技能外，**还必须**确认是否已安装 `frontend-design` 技能。

> 若未安装，请执行：
> ```
> npx skills add -p -y https://github.com/anthropics/skills --skill frontend-design
> ```

**使用方式**：
- 在构建新 UI 或重构现有界面时，使用 `frontend-design` 指导视觉设计方向、排版、配色和交互决策。
- 避免使用模板化的默认样式，确保界面具有独特性和辨识度。

### 2.6 鸿蒙（HarmonyOS）开发任务

在执行 HarmonyOS / OpenHarmony 应用开发任务时，**必须**确认以下技能均已安装：

> 若未安装，请执行：
> ```
> npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill harmonyos-app-dev
> npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill harmonyos-app-testing
> ```

#### 2.6.1 鸿蒙应用开发（harmonyos-app-dev）

覆盖鸿蒙应用全生命周期（ArkTS + ArkUI + Stage 模型）：
- 项目初始化、功能实现、调试到发布前审查。
- 内置安全/质量扫描命令，检查：硬编码凭证、未加密数据库、ResultSet 泄漏、`async forEach`、`console` vs `hilog`、V1/V2 装饰器混用等问题。

#### 2.6.2 鸿蒙应用测试（harmonyos-app-testing）

通过 `hdc` CLI 工具链驱动鸿蒙应用：
- 构建（`hvigorw`）、安装（`bm install`）、启动（`aa start`）。
- UI 树转储、手势注入、截图、日志捕获（`hilog`）。
- 不依赖 DevEco Studio GUI。

---

## 三、其他辅助技能

以下技能按需安装和使用：

| 技能 | 用途 | 安装命令 |
|------|------|----------|
| `codegraph-cli` | 通过预构建语义知识图谱探索代码库（替代 grep/Read 循环） | `npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill codegraph-cli` |
| `systematic-debugging` | 系统性调试方法论 | 内置技能，无需安装 |

---

## 四、技能缺失时的补充安装

若在执行任务时发现所需技能缺失，请统一执行以下脚本进行批量安装：

```bash
npx skills add -p -y https://github.com/dceoy/speckit-agent-skills
npx skills add -p -y https://github.com/obra/superpowers --skill brainstorming
npx skills add -p -y https://github.com/obra/superpowers --skill requesting-code-review
npx skills add -p -y https://github.com/obra/superpowers --skill receiving-code-review
npx skills add -p -y https://github.com/github/awesome-copilot --skill git-commit
npx skills add -p -y https://github.com/anthropics/skills --skill frontend-design
npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill opus-specs-as-built
npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill specs-based-devflow
npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill codegraph-cli
npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill harmonyos-app-dev
npx skills add -p -y https://github.com/fellow99/fellow99-skills --skill harmonyos-app-testing
```

---

## 五、任务分类与技能匹配速查表

| 任务类型 | 必须使用的技能 |
|----------|---------------|
| Git 提交 | `git-commit` |
| 产品 / 需求规划 | `brainstorming` |
| 规范 / 设计文档编写 | `specs-as-built` |
| 新功能开发（全流程） | `specs-based-devflow`（含 speckit 系列） |
| Code Review（提交方） | `requesting-code-review` |
| Code Review（接收方） | `receiving-code-review` |
| Bug 调试 | `systematic-debugging` |
| 前端 UI 开发 | `frontend-design` + 开发流程技能 |
| 鸿蒙应用开发 | `harmonyos-app-dev` + 开发流程技能 |
| 鸿蒙应用测试 | `harmonyos-app-testing` |
| 代码库探索 | `codegraph-cli` |
