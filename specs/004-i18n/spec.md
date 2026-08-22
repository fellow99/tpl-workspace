# 多语言国际化支持 功能规格

> 模块：004-i18n（需求编号 004-i8n，i8n 为 i18n 笔误）
> 状态：实现中
> 更新日期：2026-08-17
> 关联文档：[分析报告](../../docs/004-多语言国际化支持.md)、[语料 JSON](../../docs/004-多语言国际化支持.json)

---

## 1. 模块概述

### 1.1 目的

在父工程建立统一的 i18n 语料总目录，作为全产品线多语言文案的**单一事实源**；通过构建期生成脚本把语料分发为各子工程的原生格式；改造 tpl-app-api 使面向前端的 message 一律返回 **i18n key**，由各前端拿 key 到本端语料取文案。

### 1.2 解决的问题

- 各端文案硬编码、散落、语言不可切换。
- 同一句文案在 5 个前端重复维护、极易漂移。
- 后端返回真实文案导致改文案需改后端代码重新发布。
- 缺少「语料 → 各端」的统一分发与一致性校验。

### 1.3 范围

**包含**：父工程 `i18n/` 语料目录 + 生成/校验脚本；tpl-app-api 的 `R.msg` 返回 key；tpl-app-web / tpl-app-android / tpl-app-harmony / tpl-app-mini 四个用户端 i18n 接入。

**排除**：tpl-manage / tpl-manage-ui（沿用 RuoYi 体系，本轮不改动）；运行时语料热更新（后续可选增强）。

---

## 2. 用户故事

- 作为用户，我可切换 App 语言为中文/英文/繁体，界面与后端提示随之切换。
- 作为后端开发者，我只需在 `MessageKey` 常量返回 key，无需关心文案。
- 作为文案维护者，我只在父工程 `i18n/` 维护一份语料，各端自动同步。
- 作为发布工程师，语料变更经 CI 校验（缺译/键漂移）后自动分发，杜绝「前端有 key 后端没语料」或反之。

---

## 3. 功能需求

### 3.1 语料事实源与命名规范

- FR-004-001: 父工程 MUST 建立 `i18n/` 语料总目录，作为全产品线多语言语料的唯一事实源。
- FR-004-002: 语料 MUST 覆盖三种语言：`zh-CN`、`en-US`、`zh-TW`，三套手工维护、互不自动转换。
- FR-004-003: 语料 MUST 采用**单一命名空间**（不分多端），跨端相似语料合并为同一 key。
- FR-004-004: 语料 key MUST 采用**扁平点号**格式，遵循以下归类：
  | 前缀 | 含义 | 示例 |
  |------|------|------|
  | `dict.<dict_type>.<dict_value>` | 数据字典值 | `dict.sys_user_gender.0` |
  | `message.*` | 信息反馈 | `message.registerSuccess` |
  | `message.error.*` | 错误/失败/校验反馈 | `message.error.loginFailed` |
  | `auth.register.*` | 用户注册 UI | `auth.register.title` |
  | `auth.login.*` | 用户登录 UI | `auth.login.tab.sms` |
  | `auth.wechat.*` | 微信登录 | `auth.wechat.login` |
  | `auth.profile.*` | 个人中心 | `auth.profile.editInfo` |
  | `app.*` | 系统介绍 | `app.name`、`app.slogan` |
  | `ui.*` | 布局/导航/菜单 | `ui.nav.back` |
  | `common.*` | 公共功能 | `common.cancel` |
  | `<业务英文名>.*` | 业务功能 | `userAuth.title` |
- FR-004-005: `dict.<dict_type>.<dict_value>` 的 `<dict_value>` MUST 对应 `sys_dict_data.dict_value`（业务实际存储值）。

### 3.2 语料同步管道

- FR-004-006: 父工程 MUST 提供 `scripts/sync-i18n.mjs`，把语料生成各端原生格式（web→vue-i18n TS、android→strings.xml、harmony→string.json、mini→i18n TS）。
- FR-004-007: 父工程 MUST 提供 `scripts/verify-i18n.mjs` 做校验：(a) 三语言 key 一致；(b) 缺译检测；(c) 后端 `MessageKey` ⊆ 语料键。
- FR-004-008: 语料变更 MUST 经 CI 执行 verify（失败阻断）→ sync（生成分发）。

### 3.3 tpl-app-api 返回 key

- FR-004-009: tpl-app-api 统一响应 `R` 的 `msg` 字段 MUST 返回 i18n key，不再返回真实文案。
- FR-004-010: tpl-app-api MUST 建立 `MessageKey` 常量类集中管理全部可返回 key，禁止魔法字符串。
- FR-004-011: 带参消息 MUST 通过「key + `R.msgArgs` 数组」传递，由前端插值。

### 3.4 各前端 i18n 接入

- FR-004-012: 各前端 MUST 能按当前语言 `t(key)` 取文案，未命中回退显示原 key。
- FR-004-013: tpl-app-web MUST 引入 vue-i18n（Composition 模式），axios 拦截器统一对 `R.msg` 做 `$t`。
- FR-004-014: tpl-app-android MUST 用原生资源限定符 `values-*/strings.xml` 承载语料。
- FR-004-015: tpl-app-harmony MUST 用原生资源限定 `resources/{locale}/element/string.json` 承载语料。
- FR-004-016: tpl-app-mini MUST 提供 `t(key, args?)` 工具 + 语料模块，切换时用 `wx.setTabBarItem`/`wx.setNavigationBarTitle` 重写不可变量化文案。
- FR-004-017: 各前端语言切换 MUST 遵循「默认跟随系统，应用内可手动切换并本地持久化」。

### 3.5 数据字典

- FR-004-018: 数据字典 label 多语言 MUST 由**前端语料翻译**（`dict.*` 键），后端返回字典 `dict_value`（语言无关 code），不改字典表。

### 3.6 范围约束

- FR-004-020: 本轮 MUST 不改动 tpl-manage / tpl-manage-ui。

---

## 4. 关键契约

### 4.1 语料目录结构

```
i18n/
├── README.md                    # 命名规范、同步说明
├── common/{zh-CN,en-US,zh-TW}.json
├── app/{zh-CN,en-US,zh-TW}.json
└── scripts/{sync-i18n.mjs,verify-i18n.mjs}
```

> 语料 JSON 的 zh-CN 事实源当前维护于 `docs/004-多语言国际化支持.json`（统一 `messages` 对象），实现时迁移到 `i18n/app/zh-CN.json` + `i18n/common/zh-CN.json`，并补齐 en-US/zh-TW。

### 4.2 后端返回 key 契约

| 场景 | R.msg | 参数 |
|------|-------|------|
| 成功提示 | `"message.registerSuccess"` | — |
| 失败提示 | `"message.error.loginFailed"` | — |
| 带参提示 | `"message.error.invalidField"` | `R.msgArgs = []` |

### 4.3 各端语料落点

| 子工程 | 生成物 | 格式 |
|--------|--------|------|
| tpl-app-web | `src/lang/*.ts` | vue-i18n 扁平对象 |
| tpl-app-android | `app/src/main/res/values*/strings.xml` | Android 资源（key `.`→`_`） |
| tpl-app-harmony | `resources/{zh_CN,en_US,zh_TW}/element/string.json` | HarmonyOS 资源 |
| tpl-app-mini | `miniprogram/i18n/*.ts` | 扁平对象 + `t()` |

---

## 5. 验收场景

- **后端返回 key 前端翻译**：Given 用户英文、tpl-app-api 返回 `R.msg="message.error.loginFailed"`，When 前端收到，Then 显示英文文案。
- **语料缺失兜底**：Given 前端语料无该 key，When 翻译，Then 显示原 key、不白屏。
- **三语言切换**：Given 用户在 web 切换 zh-CN→en-US→zh-TW，When 重渲染，Then 界面与后端消息随之切换且持久化。
- **语料一致性**：Given zh-CN 增 `auth.newKey` 但 en-US/zh-TW 未增，When CI 跑 verify，Then 阻断并提示缺译。
- **带参消息**：Given `R.msg="message.error.invalidField"` + `R.msgArgs=[]`，When 前端翻译，Then 参数正确插值。

---

## 6. 非功能需求

- 语料 MUST 单一来源（父工程 `i18n/` 一处维护）。
- 生成脚本 MUST 幂等；校验 MUST 在 CI 卡口执行。
- 语料文件 MUST UTF-8 编码。
- 未命中兜底 MUST 不抛异常、不影响主流程。

---

## 7. 约束与假设

- **字典 label**：由前端语料 `dict.*` 翻译，后端返回 `dict_value`；业务字典的中文 label 在实现具体业务时定稿。
- **性别字典**：`sys_user_gender` 以 `dict_value` `'0'/'1'/'2'`（男/女/未知）为准。
- **生成物归属**：`sync` 生成的各端原生文件提交进各子工程仓库。
- **语言切换模型**：默认跟随系统，应用内可手动切换并本地持久化。
- **tpl-manage / tpl-manage-ui**：本轮不改动，未来接入时新增 `i18n/manage/` 域即可。

---

## 8. 依赖

- 上游：父工程 `i18n/`（语料 + 脚本）、GitHub Actions 工作流。
- 下游：tpl-app-api（key 化）、tpl-app-web / android / harmony / mini（i18n 接入）。
- 工具链：Node.js（脚本）、Vite / Gradle / Hvigor / 微信开发者工具。
- 参考：RuoYi-Vue-Plus（MessageUtils 兜底）、RuoYi-Vue-Plus-UI（vue-i18n Composition 模式）。
