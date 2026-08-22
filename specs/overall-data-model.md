# tpl-workspace 数据模型

> 项目：tpl-workspace（多端业务应用框架 · 父工程）
> 版本：v1.0
> 日期：2026-08-22
> 详细设计：docs/数据模型设计.md

---

## 一、数据库设计规范

### 1.1 命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| RuoYi 标准表 | `sys_*`（不改） | `sys_user`、`sys_dict_data` |
| 业务表 | `tpl_<名称>` | `tpl_user_profile` |
| 业务视图 | `tpl_<名称>_view` | `tpl_user_view` |
| 字段 | 全小写 + 下划线 | `user_id`、`phone_number` |
| 索引 | `idx_<表>_<字段>` | `idx_user_profile_user_id` |
| 唯一索引 | `uk_<表>_<字段>` | `uk_user_profile_user_id` |

### 1.2 基础字段约定

所有 `tpl_*` 业务表必须包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT | 主键（独立业务表） |
| `create_time` | DATETIME | 创建时间 |
| `update_time` | DATETIME | 更新时间 |
| `del_flag` | CHAR(1) | 软删除（`0` 正常 / `2` 删除） |

### 1.3 数据类型约定

| 场景 | 类型 |
|------|------|
| 主键/外键 | BIGINT |
| 枚举值 | VARCHAR(20) |
| 长文本（Markdown） | TEXT |
| 数组/标签/灵活字段 | JSONB |
| 图片/文件路径 | VARCHAR(500) |
| 计数器 | INT / BIGINT |
| 布尔/标志位 | CHAR(1) |

---

## 二、RuoYi 标准表（零修改）

| 表 | 用途 |
|----|------|
| `sys_user` | 用户基础表 |
| `sys_social` | 第三方账号绑定 |
| `sys_client` | 客户端授权配置 |
| `sys_config` | 系统配置键值表 |
| `sys_dict_type` / `sys_dict_data` | 数据字典 |
| `sys_role` / `sys_menu` / `sys_dept` / `sys_post` | RBAC 权限体系 |

---

## 三、业务表清单

### 3.1 核心业务表

| 表名 | 用途 | 读写方 |
|------|------|--------|
| `tpl_user_profile` | 用户扩展信息 | tpl-app-api 写 / 双端读 |
| `tpl_user_view` | 用户信息视图（sys_user + profile） | 双端读 |

### 3.2 实体 ER 关系

```
sys_user (RuoYi) ────1:1────▶ tpl_user_profile

sys_social ──N:1──▶ sys_user
```

---

## 四、关键实体定义

### 4.1 tpl_user_profile（用户扩展）

| 字段 | 类型 | 说明 |
|------|------|------|
| profile_id | BIGINT PK | 主键 |
| user_id | BIGINT UNIQUE FK | → sys_user.user_id |
| birth_date | DATE | 出生日期（选填） |

---

## 五、数据库脚本

| 脚本 | 用途 |
|------|------|
| `sql/001-init-sys.sql` | tpl_manage 库建表 + 种子数据（RuoYi 表 + 业务表） |
| `sql/002-init-tpl.sql` | tpl_app 库建表 |
| `deploy/sql/01-init-db.sh` | Docker 初始化（按依赖顺序加载 RVP 系统表） |

> 完整 DDL 见 docs/数据模型设计.md 与 sql/ 目录脚本。
