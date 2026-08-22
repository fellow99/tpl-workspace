# 短信平台 API 对接 技术方案

> 本文件为跨工程聚合技术方案，记录「tpl-workspace」短信平台对接模块的技术设计。
> 模块：202-sms-integration
> 对应规格：[spec.md](./spec.md)
> 更新日期：2026-08-14
> 状态：实现中

---

## 1. 技术上下文

### 1.1 跨子工程落地

| 子工程 | 角色 | 实现状态 |
|--------|------|---------|
| tpl-app-api | 短信发送功能封装（SmsService） | ✅ 实现中 |
| （业务消费方） | 注册/登录/找回密码调用 SmsService | ⬜ 后续接入 |

### 1.2 技术选型

| 维度 | 选型 | 理由 |
|------|------|------|
| HTTP 客户端 | Hutool `HttpRequest`（hutool-all 5.8.47 已依赖） | 与现有代码风格一致（StrUtil/RandomUtil），无需新增依赖 |
| 配置绑定 | Spring Boot `@ConfigurationProperties(prefix="sms")` | 类型安全，遵循原则六「配置管理」 |
| JSON 解析 | Hutool `JSONUtil` | 与 HTTP 客户端同源，避免引入额外解析依赖 |

---

## 2. 宪法合规

- ✅ 原则 6「配置管理」：短信配置通过 `sms.*` 集中配置
- ✅ 原则 9「安全基线」：模板编码仅存服务端配置，不下发客户端
- ✅ 原则 4「模块编号对齐」：202 编号全端一致

---

## 3. 核心接口

### 3.1 Spug Push 短信接口

| 方法 | 路径 | 用途 |
|------|------|------|
| POST | `https://push.spug.cc/sms/<TEMPLATE_CODE>` | 发送短信验证码 |

### 3.2 请求体

```json
{
  "to": "13800000000",
  "code": "153146"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| to | string | 是 | 接收手机号；多个号码用英文逗号分隔，单次最多 5 个 |
| code | string | 是 | 4-6 位数字或字母验证码 |
| number | string | 否 | 选择带有效时长的模板时必填，表示有效分钟数 |

### 3.3 响应体

```json
{
  "code": 200,
  "msg": "请求成功",
  "request_id": "N6KQ8m2W4xY7p9aB"
}
```

---

## 4. 实现策略

### 4.1 发送流程

```
调用方 → SmsService.sendVerificationCode(phone, code)
  → 校验 phone（^1\d{10}$） / code（^[0-9a-zA-Z]{4,6}$）
  → POST {base-url}/sms/{template-code}
  → 解析 {code, msg, request_id} → SmsSendResult
```

### 4.2 配置（application.yml）

```yaml
sms:
  base-url: https://push.spug.cc
  template-code: ${SMS_TEMPLATE_CODE:5nI_gjqEQV-dxQWrW5aIMg}
  connect-timeout: 5000
  read-timeout: 10000
```

### 4.3 验证码缓存与消费

```
sendCode(phone)
  → Redis GET sms_code:{phone}
     ├─ 命中（未过期）→ 不重新生成、不发送，返回成功
     └─ 未命中 → 生成 6 位数字验证码 → Redis SET（TTL 10 分钟）→ 发送短信

verifyCode(phone, code)
  → Redis GET sms_code:{phone}
     ├─ 一致 → DEL 缓存 → return true
     └─ 不一致/不存在 → return false
```

| 存储项 | Key | TTL |
|--------|-----|-----|
| 手机号-验证码 | `sms_code:{phone}` | 10 分钟 |

---

## 5. 文件清单

| 位置 | 文件 |
|------|------|
| tpl-app-api | `config/SmsProperties.java`、`service/SmsService.java`、`model/dto/SmsSendResult.java` |
| tpl-app-api | `src/main/resources/application.yml`（新增 `sms` 配置段） |

---

## 6. 关联子工程规格

| 文档 | 路径 |
|------|------|
| 用户认证模块 | [../002-user-auth/spec.md](../002-user-auth/spec.md) |
| 子工程落地实现 | [../../tpl-app-api/specs/202-sms-integration/plan.md](../../tpl-app-api/specs/202-sms-integration/plan.md) |
