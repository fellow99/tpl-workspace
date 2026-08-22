# tpl-workspace 规格完成度追踪

> 项目：tpl-workspace（父工程）
> 本文件追踪父工程 specs 目录各规范文档的完成情况。

---

## 一、项目级顶层文档

| # | 文档 | 路径 | 状态 |
|---|------|------|------|
| P-01 | 目录结构 | [STRUCTURE.md](./STRUCTURE.md) | ✅ 完成 |
| P-02 | 技术选型 | [TECH.md](./TECH.md) | ✅ 完成 |
| P-03 | 架构设计 | [ARCHITECTURE.md](./ARCHITECTURE.md) | ✅ 完成 |
| P-04 | 宪法原则 | [constitution.md](./constitution.md) | ✅ 完成 |
| P-05 | 整体规格 | [overall-spec.md](./overall-spec.md) | ✅ 完成 |
| P-06 | 整体方案 | [overall-plan.md](./overall-plan.md) | ✅ 完成 |
| P-07 | 数据模型 | [overall-data-model.md](./overall-data-model.md) | ✅ 完成 |
| P-08 | 文档索引 | [README.md](./README.md) | ✅ 完成 |

> 注：按任务要求，父工程不编写 `API.md`、`overall-api.md`、`overall-test-cases.md`。接口契约分散在各子工程 specs 的 `overall-api.md`，测试用例在各子工程 specs。

---

## 二、功能模块文档

| # | 模块 | 目录 | spec.md | plan.md | 状态 |
|---|------|------|:-------:|:-------:|------|
| M-002 | 用户注册及登录 | [002-user-auth/](./002-user-auth/) | ✅ | ✅ | ✅ 完成 |
| M-004 | 多语言国际化支持 | [004-i18n/](./004-i18n/) | ✅ | ✅ | ✅ 完成 |
| M-005 | 主题皮肤支持 | [005-theme/](./005-theme/) | ✅ | ✅ | ✅ 完成 |
| M-202 | 短信平台 API 对接 | [202-sms-integration/](./202-sms-integration/) | ✅ | ✅ | ✅ 完成 |

---

## 三、子工程 specs 文档清单（引用对照）

| 子工程 | specs 目录 | 顶层文档 | 模块文档 |
|--------|-----------|---------|---------|
| tpl-app-api | `../tpl-app-api/specs/` | 12 份 | 002-user-auth、004-i18n、202-sms-integration |
| tpl-app-web | `../tpl-app-web/specs/` | 12 份 | 001-app-shell、002-user-auth、004-i18n、005-theme |
| tpl-manage | `../tpl-manage/specs/` | 11 份 | feature-120、feature-121 |
| tpl-manage-ui | `../tpl-manage-ui/specs/` | 11 份 | feature-123、feature-124 |
| tpl-app-android | `../tpl-app-android/specs/` | 11 份 | 001、002、004、005 |
| tpl-app-harmony | `../tpl-app-harmony/specs/` | 11 份 | 001、002、004、005 |
| tpl-app-mini | `../tpl-app-mini/specs/` | 11 份 | 001、002、004、005 |
| RuoYi-Vue-Plus | `../RuoYi-Vue-Plus/specs/` | 10 份 | 上游框架 |
| RuoYi-Vue-Plus-UI | `../RuoYi-Vue-Plus-UI/specs/` | 10 份 | 上游框架 |

---

## 四、完成度统计

| 类别 | 总数 | 已完成 | 完成率 |
|------|------|--------|--------|
| 项目级顶层文档 | 8 | 8 | 100% |
| 功能模块文档（spec+plan） | 8 | 8 | 100% |
| **合计** | **16** | **16** | **100%** |
