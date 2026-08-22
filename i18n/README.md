# i18n 语料总目录

「tpl-workspace」全产品线多语言语料的**单一事实源**。所有前端文案、数据字典 label、反馈消息都在此维护，由脚本同步到各子工程。

## 目录结构

```
i18n/
├── README.md                       # 本文件
├── common/                         # 跨端共享语料（common/app/ui/dict/message 前缀键）
│   ├── zh-CN.json                  #   简体中文（事实源）
│   ├── en-US.json                  #   英文
│   └── zh-TW.json                  #   繁体中文（台湾）
├── app/                            # 用户端专属语料（auth/profile/业务名 前缀键）
│   ├── zh-CN.json
│   ├── en-US.json
│   └── zh-TW.json
└── scripts/
    ├── sync-i18n.mjs               # 生成各子工程原生格式
    ├── verify-i18n.mjs             # 三语言一致性/缺译/占位符校验
    └── split-from-docs.mjs         # 一次性：从 docs/004-多语言国际化支持.json 拆分
```

## key 命名规范

统一命名空间、扁平点号 key，跨端合并。归类规则：

| 前缀 | 含义 | 示例 |
|------|------|------|
| `message.*` | 信息反馈 | `message.registerSuccess` |
| `message.error.*` | 错误/失败/校验反馈 | `message.error.loginFailed` |
| `auth.register.*` | 用户注册 UI | `auth.register.title` |
| `auth.login.*` | 用户登录 UI | `auth.login.tab.sms` |
| `auth.wechat.*` | 微信登录 | `auth.wechat.login` |
| `auth.profile.*` | 个人中心 | `auth.profile.editInfo` |
| `app.*` | 系统介绍（品牌/标语） | `app.name`、`app.slogan` |
| `ui.*` | 布局/导航/菜单 | `ui.nav.back` |
| `common.*` | 公共功能 | `common.cancel` |
| `<业务英文名>.*` | 业务功能 | `profile.title` |


## 同步流程

```bash
# 1. 校验（三语言 key 一致、无缺译、占位符一致）
node i18n/scripts/verify-i18n.mjs

# 2. 生成各端原生格式
node i18n/scripts/sync-i18n.mjs
```

`sync-i18n.mjs` 生成目标：

| 子工程 | 生成物 | 说明 |
|--------|--------|------|
| tpl-app-web | `src/lang/{zh-CN,en-US,zh-TW}.ts` + `index.ts` | vue-i18n 扁平对象 |
| tpl-app-android | `app/src/main/res/values{,-en,-zh-rTW}/strings.xml` | key `.`→`_` |
| tpl-app-harmony | `resources/{zh_CN,en_US,zh_TW}/element/string.json` | key `.`→`_` |
| tpl-app-mini | `miniprogram/i18n/{zh-CN,en-US,zh-TW}.ts` | 扁平对象 |

> 生成物标记为「Auto-generated」，请勿手动编辑，语料变更后重新运行 sync 即可。

## 待办

- en-US / zh-TW 为**机器翻译初稿**，需人工校对后替换。
- 后续引入 tpl-manage / tpl-manage-ui 时，新增 `i18n/manage/` 域并扩展 sync 生成目标。
