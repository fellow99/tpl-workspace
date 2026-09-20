# tpl-workspace 目录结构与工程清单

> 项目：tpl-workspace（多端业务应用框架 · 父工程）
> 版本：v1.0
> 日期：2026-08-22

---

## 一、父工程目录结构

```
tpl-workspace/
├── AGENTS.md                  # AI 代理开发规范（技能清单、提交规范）
├── README.md                  # 框架介绍、系统架构、技术栈总览
├── DESIGN.md                  # 设计系统（色彩/字体/组件/动效）
├── .gitmodules                # 子模块声明（子工程独立 Git 仓库）
├── docs/                      # 📋 设计文档
│   ├── 产品概念设计.md          #   框架定位、能力全景、核心决策
│   ├── 技术选型.md              #   全产品线技术栈选型
│   ├── 数据模型设计.md          #   数据库表结构、字段、数据字典
│   ├── 002-用户注册及登录设计.md #   用户模块详细设计
│   ├── 002-用户注册及登录设计-加密机制.md
│   ├── 002-用户注册及登录设计-微信登录集成.md
│   ├── 004-多语言国际化支持.md  #   国际化能力设计
│   ├── 005-主题皮肤支持.md      #   主题皮肤设计
│   └── 202-短信平台API对接.md   #   短信平台对接设计
├── deploy/                    # 🐳 部署编排（Docker Compose）
│   ├── docker-compose.yml     #   服务编排（postgres/redis/后端/前端/nginx）
│   ├── .env / .env.sample     #   环境变量（密码 / API Key）
│   ├── Dockerfile.tpl-manage   #   管理后端多阶段构建（Maven → JRE）
│   ├── Dockerfile.tpl-manage-ui#   管理前端多阶段构建（pnpm → Nginx）
│   ├── Dockerfile.tpl-app-api  #   用户侧后端多阶段构建
│   ├── Dockerfile.tpl-app-web  #   用户侧前端多阶段构建
│   ├── Dockerfile.tpl-website  #   官网静态文件筛选 → Nginx
│   ├── nginx/                 #   Nginx 总网关 + 各前端 SPA 配置
│   ├── sql/                   #   数据库初始化脚本
│   └── README.md              #   部署指南
├── sql/                       # 业务建表脚本
│   ├── 001-init-sys.sql #   管理后台库（tpl_manage）建表 + 种子数据
│   └── 002-init-tpl.sql  #   用户侧库（tpl_app）建表
├── specs/                     # 📋 本规范文档目录
├── RuoYi-Vue-Plus/            # ⬇️ 上游后端框架（不编译，被 tpl-manage 聚合引用）
├── RuoYi-Vue-Plus-UI/         # ⬇️ 上游前端框架（不编译，被 tpl-manage-ui alias 引用）
├── tpl-manage/                # 管理后台后端（Maven 聚合 RVP，端口 8081）
├── tpl-manage-ui/             # 管理后台前端（alias 继承 RVP-UI）
├── tpl-app-api/               # 用户侧业务后端（独立工程，端口 8082）
├── tpl-app-web/               # 用户侧 Web（Vue 3 + Vite）
├── tpl-website/               # 品牌介绍官网（原生 HTML/CSS/JS，浅色/暗色主题）
├── tpl-app-android/           # Android 客户端（Kotlin）
├── tpl-app-harmony/           # 鸿蒙客户端（ArkTS）
├── tpl-app-mini/              # 微信小程序（TypeScript + Skyline）
├── tpl-desktop/               # 桌面工作台（wujie 微前端宿主，多页面可视化桌面）
└── tpl-desktop-plugin-demo/   # 桌面工作台插件示例（wujie 微前端子应用）
```

---

## 二、子工程清单（12 个）

### 2.1 上游框架工程（不编译打包，仅被引用）

| 工程 | 类型 | 角色 | 被谁引用 |
|------|------|------|---------|
| **RuoYi-Vue-Plus** | 后端框架 | RuoYi-Vue-Plus 6.0.0 企业级开发平台 | tpl-manage（Maven `<modules>` 聚合） |
| **RuoYi-Vue-Plus-UI** | 前端框架 | RuoYi-Vue-Plus 官方 Vue3 前端 | tpl-manage-ui（`@plus-ui` alias） |

### 2.2 管理后台（Admin）

| 工程 | 技术栈 | 端口 | 上下文路径 | 构建方式 |
|------|--------|------|-----------|---------|
| **tpl-manage** | Spring Boot 4.1 / JDK 21 / Sa-Token / MyBatis-Plus / PostgreSQL | 8081（docker 38081） | `/admin` | Maven 聚合 RVP，级联编译 |
| **tpl-manage-ui** | Vue 3.5 / TypeScript / Element Plus / Vite | 内部 80 | `/tpl-manage-ui` | pnpm + `@plus-ui` alias 继承 |

### 2.3 用户侧（App）

| 工程 | 技术栈 | 端口 | 上下文路径 | 说明 |
|------|--------|------|-----------|------|
| **tpl-app-api** | Spring Boot 4.1.0 / JDK 21 / Sa-Token JWT / MyBatis-Plus | 8082（docker 38082） | `/api` | 独立工程，参考 RVP 但不依赖 |
| **tpl-app-web** | Vue 3.5 / TypeScript / Vite / Pinia / Axios / 纯 CSS | 5173（dev） | `/web` | 无 UI 框架，DESIGN.md 设计系统 |
| **tpl-app-android** | Kotlin / Jetpack / MVVM / Retrofit | — | — | applicationId `org.fellow99.tpl.TplAppAndroid` |
| **tpl-app-harmony** | ArkTS / ArkUI / Stage Model / HAP+HAR | — | — | bundleName `org.fellow99.tpl.TplAppHarmony` |
| **tpl-app-mini** | TypeScript / Skyline / glass-easel | — | — | AppID `wxChangeMe` |
| **tpl-website** | 原生 HTML / CSS / JS（无框架、无构建） | 内部 80 | `/`（网关根路径） | 品牌介绍官网，纯静态，浅色/暗色主题，不接入后端 API |

### 2.4 桌面工作台（Desktop Workbench · 前端门户）

| 工程 | 技术栈 | 端口 | 上下文路径 | 说明 |
|------|--------|------|-----------|------|
| **tpl-desktop** | Vue 3.5 / Vite 8 / Element Plus / GridStack.js 11 / Swiper 14 / wujie / Sass | 5173（dev） | `/` | wujie 微前端宿主，多页面可视化桌面，纯前端（认证 mock 降级） |
| **tpl-desktop-plugin-demo** | Vue 3.5 / Vite 8 / dayjs / @number-flow/vue / Sass | 5273（dev） | `/tpl-desktop-plugin-demo/` | wujie 微前端子应用，提供 Demo Widget / App / 背景 / UI 组件 |

---

## 三、服务端口与上下文路径

| 服务 | 本地端口 | Docker 映射 | 上下文路径 | 说明 |
|------|---------|------------|-----------|------|
| nginx 总网关 | — | 38088:80 | `/` | 反向代理 + 静态资源 |
| tpl-website | — | 内部 80 | `/` | 品牌介绍官网（纯静态，Nginx 直出） |
| tpl-manage | 8081 | 38081:8081 | `/admin/*` | 管理后台 API |
| tpl-app-api | 8082 | 38082:8082 | `/api/*`、`/auth/*` | 用户侧 API |
| tpl-manage-ui | 81（dev） | 内部 80 | `/tpl-manage-ui` | 管理后台 SPA |
| tpl-app-web | 5173（dev） | 内部 80 | `/web` | 用户侧 SPA |
| tpl-desktop | 5173（dev） | — | `/` | 桌面工作台（wujie 宿主，纯前端，不纳入 docker 编排） |
| tpl-desktop-plugin-demo | 5273（dev） | — | `/tpl-desktop-plugin-demo/` | 桌面工作台插件子应用（纯前端，不纳入 docker 编排） |
| postgres | 35432 | 35432:5432 | — | 业务数据库 `tpl_manage` |
| redis | 36379 | 36379:6379 | — | 缓存 / Session |

---

## 四、各子工程 specs 目录对照

父工程 specs（本目录）是**产品线级聚合文档**，各子工程拥有独立的 specs 规范文档，二者通过交叉引用关联：

| 子工程 | specs 目录 | 模块编号 |
|--------|-----------|---------|
| tpl-app-api | `tpl-app-api/specs/` | 002-user-auth |
| tpl-app-web | `tpl-app-web/specs/` | 001-app-shell、002-user-auth |
| tpl-manage | `tpl-manage/specs/` | feature-120-project-build、feature-121-tpl-auth |
| tpl-manage-ui | `tpl-manage-ui/specs/` | feature-123-branding、feature-124-message-integration |
| tpl-app-android | `tpl-app-android/specs/` | 001-app-shell、002-user-auth |
| tpl-app-harmony | `tpl-app-harmony/specs/` | 001-app-shell、002-user-auth |
| tpl-app-mini | `tpl-app-mini/specs/` | 001-app-shell、002-user-auth |
| tpl-website | —（纯静态官网，不登记 specs） | — |
| tpl-desktop | `tpl-desktop/specs/` | 001-desktop-framework、002-widget-system、003-app-system、004-background-system、005-theme-system、006-iconfont-emoji、007-wujie-system、011-auth-mock、101-prop-editor、201-page-index、301-widget-basic-widgets、401-app-basic-apps |
| tpl-desktop-plugin-demo | `tpl-desktop-plugin-demo/specs/` | 001-wujie-adaptor、002-demo-widgets、003-demo-app、004-demo-backgrounds |
| RuoYi-Vue-Plus | `RuoYi-Vue-Plus/specs/` | 上游框架（002-user ~ 019-build、feature-101~119） |
| RuoYi-Vue-Plus-UI | `RuoYi-Vue-Plus-UI/specs/` | 上游框架（002-user ~ 102-demo、feature-120~122） |

---

## 五、父工程功能模块编号（本 specs 目录）

父工程按**产品功能**划分模块，编号与 `docs/` 设计文档一一对应：

| 编号 | 模块 | 设计文档 | 涉及子工程 |
|------|------|---------|-----------|
| 002 | 用户注册及登录（user-auth） | docs/002-用户注册及登录设计.md | tpl-app-api、tpl-app-web、tpl-manage、各多端 |

> **桌面工作台（前端门户）**：`tpl-desktop` / `tpl-desktop-plugin-demo` 使用**桌面线自有模块编号**（`001`~`401`、`006`/`007`），与父工程多端业务模块编号（`002`/`004`/`005`/`202`）相互独立。其模块规格文档分别位于各自 `specs/` 目录，父工程不重复编写，仅交叉引用。

---

## 六、源码目录速览（各子工程）

### tpl-app-api（独立 Spring Boot 工程）

```
tpl-app-api/src/main/java/org/fellow99/tpl/appapi/
├── TplAppApiApplication.java        # 启动入口
├── config/                          # CorsConfig、SaTokenConfigure、SmsProperties 等
├── controller/                      # AuthController、SmsController、SystemUserController 等
├── service/                         # AuthService、UserService、SmsService 等
├── mapper/                          # MyBatis-Plus 数据访问
├── entity/                          # 数据库实体
├── model/                           # R 统一响应 + DTO
└── util/                            # CaptchaUtils 图形验证码、EncryptUtils 加密
```

### tpl-manage（Maven 聚合工程）

```
tpl-manage/
├── pom.xml                          # 聚合 POM（<modules> 引入 RVP + tpl-manage-admin）
├── sql/001-init-sys.sql      # PostgreSQL 建表 + 种子数据
└── tpl-manage-admin/                 # 启动模块
    └── src/main/java/org/fellow99/tpl/manage/
        ├── TplManageApplication.java # 双包扫描启动类
        └── controller/              # AuthController、CaptchaController
```

### tpl-app-web（Vue 3 SPA）

```
tpl-app-web/src/
├── api/          # index.ts（axios 实例）、auth.ts
├── stores/       # user.ts（Pinia）
├── router/       # index.ts（路由守卫）
├── components/   # AppLayout.vue
├── views/        # LoginPage、RegisterPage、ProfilePage
└── style.css     # Design Tokens + 全局样式
```

### tpl-desktop（wujie 微前端宿主 · Vue 3 SPA）

```
tpl-desktop/src/
├── desktop.js              # Vue 应用入口（插件注册 + 全局挂载）
├── pages/Desktop.vue       # 根组件 — 桌面编排中心
├── components/             # desktop/ viewport/ property/ 三层组件
├── composables/            # useGridStack / useTheme / use*Metas 模块级单例
├── widgets/ apps/ backgrounds/  # import.meta.glob 自动扫描注册
├── themes/                 # 浅色/深色 CSS 变量主题
└── api/auth-service.js     # RSA 加密认证 + mock 降级
```

### tpl-desktop-plugin-demo（wujie 微前端子应用）

```
tpl-desktop-plugin-demo/src/
├── main.js                 # 双模式入口（wujie 沙箱 / 独立调试）
├── App.vue                 # 根组件
└── widgets/ apps/ backgrounds/ components/  # import.meta.glob 零代码注册
```

> 更多子工程源码结构详见各子工程 `README.md` 与 `specs/STRUCTURE.md`。
