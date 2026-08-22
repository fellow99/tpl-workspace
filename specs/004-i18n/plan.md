# 多语言国际化支持 技术方案

> 本文件为跨工程聚合技术方案，记录多语言国际化在各子工程的落地方式。
> 模块：004-i18n
> 对应规格：[spec.md](./spec.md)
> 更新日期：2026-08-17

---

## 1. 技术上下文

### 1.1 i18n 架构总览

```
父工程 i18n/（单一事实源：统一命名空间，zh-CN / en-US / zh-TW）
        │
        ├── scripts/verify-i18n.mjs   （key 一致性 / 缺译 / 契约校验，CI 卡口）
        ├── scripts/sync-i18n.mjs     （生成各端原生格式）
        │
        ├──────────────┬──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
   tpl-app-api     tpl-app-web     tpl-app-android tpl-app-harmony tpl-app-mini
   (R.msg=key)    (vue-i18n)     (strings.xml)  (string.json)  (i18n/*.ts)
```

数据流：tpl-app-api 返回 `R.msg = key` → 各前端 `t(key)` 取本端语料 → 未命中显示原 key。

### 1.2 跨子工程落地

| 子工程 | 角色 | i18n 机制 | 语料落点 | 状态 |
|--------|------|-----------|---------|------|
| 父工程 | 事实源 + 管道 | 统一 JSON + 生成/校验脚本 | `i18n/{common,app}/{locale}.json` + `scripts/` | 📋 新建 |
| tpl-app-api | 后端 | `R.msg` 返回 key + `MessageKey` | 契约类 | 📋 改造 |
| tpl-app-web | Web 端 | vue-i18n（Composition 模式） | `src/lang/*.ts` | 📋 接入 |
| tpl-app-android | Android | 原生资源限定符 | `res/values*/strings.xml` | 📋 接入 |
| tpl-app-harmony | 鸿蒙 | 原生资源限定 | `resources/{locale}/element/string.json` | 📋 接入 |
| tpl-app-mini | 小程序 | 手写 `t()` + 语料模块 | `miniprogram/i18n/*.ts` | 📋 接入 |
| tpl-manage | 管理后端 | 沿用 RuoYi 体系 | —（本轮不改动） | ⏸ 排除 |
| tpl-manage-ui | 管理前端 | 沿用 RuoYi-UI 体系 | —（本轮不改动） | ⏸ 排除 |

---

## 2. 宪法合规

- ✅ 原则 1（框架继承不复制）：tpl-manage / tpl-manage-ui 不改动，不 fork RVP/RVP-UI 源码。
- ✅ 原则 3（命名规范）：语料 key 扁平点号、模块域 camelCase。
- ✅ 原则 4（模块编号对齐）：模块编号 `004` 在父工程与各用户端一致。
- ✅ 原则 2/5（sys_* 零修改）：字典语料仅引用 `sys_user_gender` 的 `dict_value`，业务字典用 `tpl_*`。
- ✅ 原则 10（构建部署一致）：语料分发走 CI，不改变各端构建方式。

---

## 3. 语料同步管道设计

### 3.1 语料目录

```
i18n/
├── README.md                  # 命名规范、同步说明
├── common/{zh-CN,en-US,zh-TW}.json   # 跨端共享（common.* 键）
├── app/{zh-CN,en-US,zh-TW}.json      # 用户端（auth/message/userAuth/dict 等键）
└── scripts/{sync-i18n.mjs,verify-i18n.mjs}
```

> zh-CN 事实源当前在 `docs/004-多语言国际化支持.json`（`messages` 对象，212 key）。实现时将其拆为 `common/zh-CN.json` + `app/zh-CN.json`，并人工补齐 `en-US`、`zh-TW` 两套译文。

### 3.2 生成脚本（sync-i18n.mjs）

读取 `i18n/app/*.json` + `i18n/common/*.json`（合并为扁平键集），按端生成：

| 目标端 | 生成物 | 转换规则 |
|--------|--------|----------|
| tpl-app-web | `src/lang/{index,zh-CN,en-US,zh-TW}.ts` | 点号 key 原样，导出扁平对象 |
| tpl-app-android | `app/src/main/res/values/strings.xml`、`values-en/`、`values-zh-rTW/` | `.`→`_`，`<string name="auth_login_failed">` |
| tpl-app-harmony | `resources/{zh_CN,en_US,zh_TW}/element/string.json` | `.`→`_`，`{"name":"auth_login_failed","value":"..."}` |
| tpl-app-mini | `miniprogram/i18n/{zh-CN,en-US,zh-TW}.ts` | 点号 key 原样，导出扁平对象 |

要求：幂等、UTF-8、按端裁剪（app 端只打 `common` + `app` 域）。

### 3.3 校验脚本（verify-i18n.mjs）

| 校验 | 规则 | 失败动作 |
|------|------|---------|
| key 一致性 | 三语言 key 集合完全相等 | 阻断，列出缺译/多余键 |
| 契约校验 | 解析 tpl-app-api `MessageKey` 常量，确保 ⊆ 语料键 | 阻断 |
| 占位符校验 | `{0}`/`{countdown}` 三语言一一对应 | 阻断 |

### 3.4 CI 分发流程

```
语料变更提交 → verify-i18n.mjs（失败即阻断）
           → sync-i18n.mjs（生成各端原生格式）
           → 生成物提交到对应子工程仓库
```

---

## 4. 实现策略

### 4.1 父工程（基础设施）

1. 建 `i18n/` 目录 + `README.md`。
2. 从 `docs/004-多语言国际化支持.json` 拆出 `common/zh-CN.json` + `app/zh-CN.json`。
3. 编写 `sync-i18n.mjs`、`verify-i18n.mjs`。
4. 建 GitHub Actions 工作流：语料变更 → verify → sync → 提交。

### 4.2 tpl-app-api（返回 key）

1. `R.java`：`msg` 语义改为 key；新增 `msgArgs` 字段（`String[]`，默认空）。
2. 新建 `MessageKey` 常量类（`org.fellow99.tpl.appapi.model.MessageKey`），集中声明全部可返回 key。
3. 改造 controller/service 返回：成功/失败消息改为 `MessageKey.xxx` 常量；日志保持真实文本。

### 4.3 tpl-app-web（vue-i18n）

1. 引入 `vue-i18n@11.x`；新建 `src/lang/index.ts`（`createI18n` Composition 模式）+ `zh-CN.ts`/`en-US.ts`/`zh-TW.ts`（由 sync 生成）。
2. `appStore` 增加 `language` 状态 + `useStorage('language')` 持久化。
3. 新建 `src/utils/i18n.ts`：`translateApiMessage(msg, args?)`（`te` 守卫 + `t`，未命中回退原 key）。
4. axios 响应拦截器统一对 `R.msg` 调 `translateApiMessage`，模板文案用 `$t('xxx')`。

### 4.4 tpl-app-android（strings.xml）

1. 新增 `res/values-en/strings.xml`、`res/values-zh-rTW/strings.xml`（由 sync 生成），`values/` 为默认中文。
2. 网络层 `R.msg`（key）→ 资源名映射（`.`→`_`），`getString(R.string.xxx, args)`，未命中回退原 key。
3. 语言切换：默认跟随系统；应用内切换用 `AppCompatDelegate.setApplicationLocales`。

### 4.5 tpl-app-harmony（string.json）

1. 新增 `resources/{zh_CN,en_US,zh_TW}/element/string.json`（由 sync 生成），`base/` 为默认。
2. 网络层 `R.msg`（key）→ `$r('app.string.' + key.replace('.','_'))`，未命中回退原 key。
3. 语言切换：默认跟随系统（`i18n.System.getSystemLanguage()`）。

### 4.6 tpl-app-mini（手写 i18n）

1. 新增 `miniprogram/i18n/{zh-CN,en-US,zh-TW}.ts`（由 sync 生成）+ `miniprogram/utils/i18n.ts`（`t(key, args?)`）。
2. `t()` 未命中回退原 key；语言存 storage，默认跟随 `wx.getSystemInfoSync().language`。
3. `app.json` tabBar / 导航栏文案切换时用 `wx.setTabBarItem` / `wx.setNavigationBarTitle` 重写。

---

## 5. 文件清单

| 子工程 | 关键文件 | 改动 |
|--------|---------|------|
| 父工程 | `i18n/**`、`i18n/scripts/*.mjs`、`.github/workflows/i18n-sync.yml` | 新增语料 + 管道 |
| 父工程 | `specs/004-i18n/{spec,plan,tasks}.md` | 新增规格 |
| tpl-app-api | `R.java`、`MessageKey.java`、各 controller/service | msg key 化 |
| tpl-app-web | `src/lang/*.ts`、`src/utils/i18n.ts`、`src/stores/*`、`src/utils/request.ts`、各 view | vue-i18n 接入 |
| tpl-app-android | `res/values*/strings.xml`、网络层 key 映射 | 资源限定 + 翻译 |
| tpl-app-harmony | `resources/{zh_CN,en_US,zh_TW}/element/string.json`、网络层 | 资源限定 + 翻译 |
| tpl-app-mini | `miniprogram/i18n/*.ts`、`miniprogram/utils/i18n.ts`、请求封装 | 语料 + t() |

---

## 6. 分阶段实施顺序

| 阶段 | 内容 | 验收 |
|------|------|------|
| 1 | 父工程 `i18n/` + `sync`/`verify` 脚本 + CI | verify 能拦截缺译；sync 生成物正确 |
| 2 | tpl-app-api（key 化）+ tpl-app-web（vue-i18n） | 用户端主链路三语言切换、后端消息正确翻译 |
| 3 | tpl-app-android / tpl-app-harmony / tpl-app-mini | 各端三语言切换 + 后端 key 翻译 |

---

## 7. 关联文档

| 文档 | 路径 |
|------|------|
| 分析报告 | `../../docs/004-多语言国际化支持.md` |
| 语料 JSON | `../../docs/004-多语言国际化支持.json` |
| 宪法原则 | `../constitution.md` |
| 项目结构 | `../STRUCTURE.md` |
