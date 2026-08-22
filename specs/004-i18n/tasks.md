# 多语言国际化支持 任务列表

> 模块：004-i18n
> 对应规格：[spec.md](./spec.md)、技术方案：[plan.md](./plan.md)
> 更新日期：2026-08-17

任务按依赖排序（先基础设施，再后端契约，再各前端）。任务编号 `T-004-XX`。

---

## 阶段 1：父工程基础设施（无依赖，先行）

| 任务 | 描述 | 依赖 | 验证 |
|------|------|------|------|
| T-004-01 | 建 `i18n/` 目录 + `README.md`（命名规范、同步说明） | — | 目录结构完整 |
| T-004-02 | 从 `docs/004-多语言国际化支持.json` 拆出 `common/zh-CN.json` + `app/zh-CN.json` | T-004-01 | zh-CN 键与原 JSON 一致 |
| T-004-03 | 人工补齐 `en-US`、`zh-TW` 两套译文（common + app） | T-004-02 | 三语言 key 集合一致 |
| T-004-04 | 编写 `scripts/sync-i18n.mjs`（生成 web/android/harmony/mini 原生格式） | T-004-02 | 生成物正确、幂等 |
| T-004-05 | 编写 `scripts/verify-i18n.mjs`（key 一致性/缺译/契约校验） | T-004-02 | 缺译被拦截 |
| T-004-06 | 建 GitHub Actions 工作流 `i18n-sync.yml`（语料变更→verify→sync→提交） | T-004-04, T-004-05 | CI 卡口生效 |

## 阶段 2：后端契约 + 用户端主链路（依赖阶段 1）

| 任务 | 描述 | 依赖 | 验证 |
|------|------|------|------|
| T-004-07 | tpl-app-api：`R.java` 加 `msgArgs` 字段、`msg` 语义改 key | T-004-02 | R 结构正确 |
| T-004-08 | tpl-app-api：新建 `MessageKey` 常量类，集中声明可返回 key | T-004-02 | 常量与语料键对齐 |
| T-004-09 | tpl-app-api：改造 controller/service 返回为 `MessageKey`（日志保持真实文本） | T-004-07, T-004-08 | 后端返回 key |
| T-004-10 | tpl-app-web：引入 vue-i18n + `src/lang/*.ts` + `appStore.language` | T-004-03, T-004-09 | 静态 UI 可切换语言 |
| T-004-11 | tpl-app-web：`src/utils/i18n.ts` + axios 拦截器翻译 `R.msg` | T-004-10 | 后端消息正确翻译 |
| T-004-12 | tpl-app-web：改造各 view 硬编码文案为 `$t()` | T-004-10 | 无残留硬编码中文 |

## 阶段 3：多端接入（依赖阶段 1）

| 任务 | 描述 | 依赖 | 验证 |
|------|------|------|------|
| T-004-13 | tpl-app-android：新增 `values-en/`、`values-zh-rTW/strings.xml` | T-004-04 | 资源生成正确 |
| T-004-14 | tpl-app-android：网络层 key→资源名映射 + 硬编码文案资源化 | T-004-13, T-004-09 | 后端 key 翻译 |
| T-004-15 | tpl-app-harmony：新增 `resources/{zh_CN,en_US,zh_TW}/element/string.json` | T-004-04 | 资源生成正确 |
| T-004-16 | tpl-app-harmony：网络层 key→`$r` 映射 + 硬编码文案资源化 | T-004-15, T-004-09 | 后端 key 翻译 |
| T-004-17 | tpl-app-mini：新增 `i18n/*.ts` + `utils/i18n.ts`（`t()`） | T-004-04 | 语料模块正确 |
| T-004-18 | tpl-app-mini：硬编码文案改 `t()` + tabBar/导航栏切换重写 | T-004-17, T-004-09 | 后端 key 翻译 |

## 阶段 4：验证与收尾

| 任务 | 描述 | 依赖 | 验证 |
|------|------|------|------|
| T-004-19 | 各端构建验证（web build / android assemble / harmony hvigor / mini 编译） | 阶段 2、3 | 构建通过 |
| T-004-20 | Code Review（requesting-code-review + receiving-code-review） | T-004-19 | Critical/Important 清零 |
| T-004-21 | 回归测试（三语言切换、后端 key 翻译、缺译兜底） | T-004-20 | 验收场景通过 |

---

## 依赖关系图

```
阶段1: T-004-01 → T-004-02 → T-004-03
                          ├→ T-004-04 → T-004-06
                          └→ T-004-05 → T-004-06
阶段2: T-004-02 → T-004-07 → T-004-08 → T-004-09
                T-004-03 + T-004-09 → T-004-10 → T-004-11 / T-004-12
阶段3: T-004-04 + T-004-09 → T-004-13 → T-004-14（android）
                            T-004-15 → T-004-16（harmony）
                            T-004-17 → T-004-18（mini）
阶段4: 阶段2+3 → T-004-19 → T-004-20 → T-004-21
```
