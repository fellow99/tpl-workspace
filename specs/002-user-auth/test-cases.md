# 微信登录集成 测试用例

> 模块：002-user-auth（微信登录扩展）
> 生成日期：2026-08-16
> 说明：微信真实授权依赖开放平台审核通过的 AppID，本用例区分「可自动化验证」与「需真实微信环境联调」两类。

---

## TC-WX-API. 后端 tpl-app-api

| # | 用例 | 步骤 | 预期 | 类型 |
|---|------|------|------|------|
| API-1 | 配置加载 | 启动服务，检查日志 | `justauth.type.*` 与 `wechat.enabled` 正确绑定，无启动错误 | 自动 |
| API-2 | social 未绑定 | `POST /auth/login` `{grantType:'social', source:'wechat_open', socialCode:'<假code>', socialState:'<state>'}`（无真实 appid 时应报微信接口错误，而非 500 空指针） | 返回统一错误结构，不崩溃 | 自动 |
| API-3 | 绑定接口鉴权 | 无 token 调 `POST /auth/social/callback` | 返回 401/未登录 | 自动 |
| API-4 | 绑定列表 | 有 token 调 `GET /system/social/list` | 返回 `code=200` + 列表 | 自动 |
| API-5 | 解绑 | 有 token 调 `DELETE /auth/unlock/{socialId}` | 删除成功或返回明确错误 | 自动 |
| API-6 | 授权 URL | `GET /auth/binding/wechat_open` | 返回 `code=200` + authorize URL（含 appid/redirect_uri/state） | 自动 |
| API-7 | 开关关闭 | `wechat.enabled=false` 重启后调 `/auth/binding/wechat_open` | 端点不开放/策略 Bean 不注册 | 自动 |
| API-8 | sys_social 零 DDL | 对比 `sql/001-init-sys.sql` | 无新增 DDL，复用现有 `sys_social` 表 | 自动 |
| API-9 | 微信换码 | 真实 code（需联调） | `grantType=social` 成功换 openid/unionid 并登录 | 联调 |
| API-10 | 小程序换码 | 真实 `xcxCode`（需联调） | `grantType=xcx` 成功换 openid/session_key；新 openid + phoneCode 自动建号 | 联调 |

---

## TC-WX-WEB. tpl-app-web

| # | 用例 | 步骤 | 预期 | 类型 |
|---|------|------|------|------|
| WEB-1 | 微信按钮显隐 | 开关 true/false 构建 | 按钮按 `VITE_APP_WECHAT_LOGIN_ENABLED` 显隐 | 自动 |
| WEB-2 | 跳转授权 | 点击微信按钮 | `authRouterUrl('wechat_open')` 返回 URL 并 `window.location.href` 跳转 | 自动/联调 |
| WEB-3 | 回调登录 | 扫码后跳 `/social-callback?code=..&state=..&source=wechat_open` | 无 token 调 socialLogin → 存 token → 跳 `/profile` | 联调 |
| WEB-4 | 回调绑定 | 已登录访问 `/social-callback` | 有 token 调 socialCallback → 绑定成功 | 联调 |
| WEB-5 | 路由可达 | 未登录与已登录访问 `/social-callback` | 均不被守卫拦截/重定向 | 自动 |

---

## TC-WX-MINI. tpl-app-mini

| # | 用例 | 步骤 | 预期 | 类型 |
|---|------|------|------|------|
| MINI-1 | 按钮显隐 | `WECHAT_LOGIN_ENABLED` true/false | 一键登录按钮显隐 | 自动 |
| MINI-2 | 一键登录（老用户） | 点击微信一键登录 | `wx.login` → xcx 登录 → 命中 openid → 存 token → 个人中心 | 联调 |
| MINI-3 | 一键登录（新用户） | 新 openid 点击登录 | 弹出 getPhoneNumber → 授权 → 建号/绑定 → 登录 | 联调 |
| MINI-4 | 编译 | 微信开发者工具 | 无编译错误 | 自动 |

---

## TC-WX-ANDROID. tpl-app-android

| # | 用例 | 步骤 | 预期 | 类型 |
|---|------|------|------|------|
| AND-1 | 构建 | `./gradlew assembleDebug` | 通过（SDK 依赖、manifest、WXEntryActivity 均正确） | 自动 |
| AND-2 | 拉起 | 点击微信登录 | 拉起微信授权（`SendAuth.Req` scope=snsapi_userinfo） | 联调 |
| AND-3 | 回调登录 | 授权后 `WXEntryActivity.onResp` 取 code | 调 `socialLogin(source='wechat_app')` → 存 token → 个人中心 | 联调 |
| AND-4 | 绑定入口 | 个人中心点「绑定微信」 | 拉起 → `POST /auth/social/callback`（需 token） | 联调 |
| AND-5 | 开关 | `WECHAT_LOGIN_ENABLED=false` | 微信入口隐藏 | 自动 |

---

## TC-WX-HARMONY. tpl-app-harmony

| # | 用例 | 步骤 | 预期 | 类型 |
|---|------|------|------|------|
| HAR-1 | 构建 | `hvigorw assembleHap` | 通过（SDK、queryscheme、ability 均正确） | 自动 |
| HAR-2 | 拉起 | 点击微信登录 | 拉起微信授权（`SendAuthReq`） | 联调 |
| HAR-3 | 回调登录 | `DefaultAbility` `handleWant`/`onResp` 取 code | 调 `socialLogin(source='wechat_app')` → 存 token | 联调 |
| HAR-4 | 绑定入口 | 个人中心「绑定微信」 | 拉起 → `POST /auth/social/callback` | 联调 |
| HAR-5 | 开关 | `WECHAT_LOGIN_ENABLED=false` | 微信入口隐藏 | 自动 |

---

## TC-WX-MANAGE. tpl-manage / tpl-manage-ui

| # | 用例 | 步骤 | 预期 | 类型 |
|---|------|------|------|------|
| MAN-1 | 前端删除 | 打开 tpl-manage-ui 登录页 | 无第三方登录按钮（`.social-panel` 已删） | 自动 |
| MAN-2 | 前端构建 | `npm run build` | 通过，`thirdParty.vue` 仍可引用框架 `@/api/system/social/auth.ts` | 自动 |
| MAN-3 | 后端保留 | tpl-manage 启动 | 社交接口 `/system/social/list` 仍存在（未配 justauth 时返回「不支持」） | 自动 |
| MAN-4 | 文案清理 | 检查 `lang/zh_CN.ts`/`en_US.ts` | `login.social.*` 已删 | 自动 |
