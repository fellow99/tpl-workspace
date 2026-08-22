# 微信登录集成 任务列表

> 模块：002-user-auth（微信登录扩展）
> 需求编号：002-user-auth（继续完善，不新建编号）
> 生成日期：2026-08-16
> 依赖排序：后端（tpl-app-api）先行 → 四端并行 → tpl-manage-ui 删除（独立）

---

## 依赖关系

```
T1 tpl-app-api（后端 social/xcx 策略）
 ├─▶ T2 tpl-app-web（扫码登录）    —— 依赖 T1 的接口
 ├─▶ T3 tpl-app-mini（一键登录）   —— 依赖 T1 的接口
 ├─▶ T4 tpl-app-android（拉起登录）—— 依赖 T1 的接口
 └─▶ T5 tpl-app-harmony（拉起登录）—— 依赖 T1 的接口

T6 tpl-manage-ui（删除第三方登录）  —— 独立，无依赖
T7 tpl-manage（后端保留）           —— 零改动（仅核验）
```

---

## T1. tpl-app-api 后端实现（`org.fellow99.tpl.appapi`）

| # | 任务 | 产出 | 依赖 |
|---|------|------|------|
| 1.1 | `pom.xml` 增加 `io.github.windtool:JustAuth:3.0.1` 依赖 | 依赖可解析 | — |
| 1.2 | 新增 `config/properties/WechatProperties.java` + `SocialLoginConfigProperties.java`（prefix=`justauth`） | 配置绑定 | 1.1 |
| 1.3 | 新增 `util/AuthRedisStateCache.java`（`AuthStateCache`，key `tpl:social_auth_codes:{state}`，3 分钟）+ Bean 注册 | state 缓存 | 1.1 |
| 1.4 | 新增 `util/WechatAuthUtils.java`（`loginAuth`/`getAuthRequest`：`wechat_open`/`wechat_app`→`AuthWeChatOpenRequest`，`wechat_xcx`→`AuthWechatMiniProgramRequest`） | 微信接口封装 | 1.2/1.3 |
| 1.5 | 新增 `entity/SysSocial.java` + `mapper/SysSocialMapper.java`（`@TableName("sys_social")`，零 DDL） | 数据层 | — |
| 1.6 | 新增 `service/SysSocialService.java`（`selectByAuthId`/`selectByUserId`/`insert`/`update`/`delete`） | 服务层 | 1.5 |
| 1.7 | 新增 `model/dto/SocialLoginBody.java` + `XcxLoginBody.java` | DTO | — |
| 1.8 | 新增 `service/strategy/IAuthStrategy.java`（静态 `login(body, grantType)` Bean 分发）+ `SocialAuthStrategy.java` + `XcxAuthStrategy.java` | 策略分发 | 1.4/1.6/1.7 |
| 1.9 | 改造 `AuthService.login()`：grantType if/else → `IAuthStrategy.login()`（password/sms 兜底保留）；social/xcx 跳过图形验证码 | 登录分发 | 1.8 |
| 1.10 | 扩展 `AuthController`：`GET /auth/binding/{source}`、`POST /auth/social/callback`、`DELETE /auth/unlock/{socialId}`；新增 `SystemSocialController`（`GET /system/social/list`） | 接口 | 1.6/1.9 |
| 1.11 | `application.yml` 增加 `wechat.enabled` + `justauth.type.{wechat_open,wechat_app,wechat_xcx}`（环境变量注入）；`wechat.enabled=false` 时不注册策略 | 配置 + 开关 | 1.8/1.10 |
| 1.12 | `mvn compile` + `lsp_diagnostics` 通过 | 验证 | 全部 |

---

## T2. tpl-app-web 扫码登录（完全参考 RuoYi-Vue-Plus-UI）

| # | 任务 | 产出 | 依赖 |
|---|------|------|------|
| 2.1 | 新增 `src/api/social.ts`（`authRouterUrl`/`socialLogin`/`socialCallback`） | API 层 | T1 |
| 2.2 | 新增 `src/views/SocialCallback.vue`（读 code/state/source → 无 token socialLogin / 有 token socialCallback → `userStore.setToken` → 跳 `/profile`） | 回调页 | 2.1 |
| 2.3 | `src/router/index.ts` 注册 `/social-callback` 路由（**不加 `meta.guest`**，登录/未登录均可达）+ 守卫放行 | 路由 | 2.2 |
| 2.4 | `src/views/LoginPage.vue` 加微信登录按钮（`source='wechat_open'`，`v-if="wechatLoginEnabled"`） | 入口 | 2.1 |
| 2.5 | `.env`/`.env.production` 加 `VITE_APP_WECHAT_LOGIN_ENABLED=true` + `VITE_APP_CLIENT_ID`；`vite-env.d.ts` 声明类型 | 配置 + 开关 | 2.4 |
| 2.6 | `npm run build` 通过（vue-tsc + vite） | 验证 | 全部 |

---

## T3. tpl-app-mini 一键登录

| # | 任务 | 产出 | 依赖 |
|---|------|------|------|
| 3.1 | 新建 `miniprogram/utils/config.ts`（`export const WECHAT_LOGIN_ENABLED = true`） | 开关常量 | — |
| 3.2 | `typings/auth.d.ts` 加 `XcxLoginRequest` 类型 | 类型 | — |
| 3.3 | `pages/login/login.ts` 加 `handleWechatLogin()`（`wx.login` → `POST /auth/login {grantType:'xcx', clientId:'mini', xcxCode}`；未命中走 getPhoneNumber + `phoneCode`） | 逻辑 | 3.1/3.2/T1 |
| 3.4 | `pages/login/login.wxml` 加微信按钮（复用 `.wechat-btn`/`.separator` 样式）+ getPhoneNumber 按钮 | 界面 | 3.3 |
| 3.5 | 微信开发者工具编译通过 | 验证 | 全部 |

---

## T4. tpl-app-android 拉起登录

| # | 任务 | 产出 | 依赖 |
|---|------|------|------|
| 4.1 | `gradle/libs.versions.toml` + `app/build.gradle.kts` 加 `wechat-sdk-android:6.8.0` + `WECHAT_LOGIN_ENABLED`/`WECHAT_APP_ID` buildConfigField | 依赖 + 开关 | — |
| 4.2 | `AndroidManifest.xml` 加 `<queries>` + 注册 `.wxapi.WXEntryActivity` | 清单 | 4.1 |
| 4.3 | 新增 `wxapi/WXEntryActivity.kt`（`WXAPIFactory.createWXAPI` + `onResp` 取 code） | 回调 | 4.1 |
| 4.4 | `model/SocialLoginRequest.kt` + `AuthApi.socialLogin`（`@Headers("isToken: false","isEncrypt: true")`） | API | T1 |
| 4.5 | `LoginFragment` + `fragment_login.xml` 加微信按钮（`SendAuth.Req(scope=snsapi_userinfo)`）；`ProfileFragment` 加「绑定微信」 | 界面 | 4.3/4.4 |
| 4.6 | `./gradlew assembleDebug` 通过 | 验证 | 全部 |

---

## T5. tpl-app-harmony 拉起登录

| # | 任务 | 产出 | 依赖 |
|---|------|------|------|
| 5.1 | `products/default/oh-package.json5` 加 `@tencent/wechat_open_sdk`；`module.json5` 加 `queryscheme` | 依赖 + 声明 | — |
| 5.2 | `build-profile.json5` buildProfileFields 加 `WECHAT_LOGIN_ENABLED`/`WECHAT_APP_ID` | 开关 | — |
| 5.3 | `DefaultAbility.ets` 接入 `WXApi.handleWant` + `onNewWant` + `WXApiEventHandler` | 回调 | 5.1 |
| 5.4 | `AuthModels.ets` 加 `SocialLoginRequest`；`AuthService.ets` 加 `socialLogin` | API | T1 |
| 5.5 | `LoginForm.ets` 加微信按钮（`SendAuthReq` → `sendReq`）；`ProfilePage.ets` 加「绑定微信」 | 界面 | 5.3/5.4 |
| 5.6 | `hvigorw assembleHap` 通过 | 验证 | 全部 |

---

## T6. tpl-manage-ui 删除第三方登录

| # | 任务 | 产出 | 依赖 |
|---|------|------|------|
| 6.1 | `src/views/login.vue` 删除 `.social-panel` 区块 + `doSocialLogin` + `authRouterUrl` import + `HttpStatus` import + 相关 CSS | 删除入口 | — |
| 6.2 | `src/lang/zh_CN.ts`/`en_US.ts` 删除 `login.social.*` 文案 | 清理文案 | 6.1 |
| 6.3 | 构建/校验通过（不删框架 `@/api/system/social/auth.ts`，`thirdParty.vue` 保持可用） | 验证 | 全部 |

---

## T7. tpl-manage 后端（零改动，仅核验）

| # | 任务 | 产出 | 依赖 |
|---|------|------|------|
| 7.1 | 核验社交接口保留（`/system/social/list` 等），不删任何接口、不配 `justauth.type.*` | 核验记录 | — |

---

## 验收映射

| 验收标准 | 覆盖任务 |
|---------|---------|
| AC-WX-1（mini 一键登录） | T3 |
| AC-WX-2（android/harmony 拉起） | T4、T5 |
| AC-WX-3（web 扫码闭环） | T2 |
| AC-WX-4（后端开关） | T1.11 |
| AC-WX-5（sys_social 零 DDL + 绑定接口） | T1.5/T1.6/T1.10 |
| AC-WX-6（manage-ui 删除 + manage 保留） | T6、T7 |
| AC-WX-7（各端开关默认启用） | T1.11/T2.5/T3.1/T4.1/T5.2 |
