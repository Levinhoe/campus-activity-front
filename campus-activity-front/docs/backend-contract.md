# 后端接口契约建议（前后端对齐用）

## 登录 / 注册
- `POST /api/auth/login`  
  - body: `{ account, password }`  
  - response: `{ token: "JWT...", role: "ADMIN"|"STUDENT" }`  
  - 允许返回 `accessToken` 或放在 `data.token`，但必须包含角色字段。
- `POST /api/auth/register`  
  - 学生: `{ account, password, name, studentNo, phone, role: "STUDENT" }`
  - 管理员: `{ account, password, name, phone, role: "ADMIN" }`
- `GET /api/auth/me`  
  - response: `{ name, role, roleCode?, account?, ... }`

## 活动（学生可见，管理员可管理）
- `GET /api/activities` 查询列表（分页 + 关键词 + 状态）
- `GET /api/activities/{id}` 详情
- `POST /api/activities/{id}/register` 报名
- `POST /api/activities/{id}/cancel` 取消报名
- `GET /api/activities/me` 我的报名

## 管理员特有
- `POST /api/admin/activities` 创建
- `PUT /api/admin/activities/{id}` 更新
- `DELETE /api/admin/activities/{id}` 删除
- `GET /api/admin/registrations?status=pending` 待审核报名
- `POST /api/admin/registrations/{id}/approve`
- `POST /api/admin/registrations/{id}/reject`

## 错误返回格式
- 推荐统一：`{ code: 0, data: ..., message: "" }` 成功；失败时 `code != 0` 且 `message` 填写。
  - 现在前端的 axios 拦截器直接返回 `resp.data`，并兼容 `token`/`accessToken`/多层 `data`。

## 给后端 Codex 的提示词（可直接发送）
```
请实现校园活动系统后端接口，符合以下契约：
- 登录 POST /api/auth/login：接受 {account, password}，返回 JSON 含 token(或accessToken) 和 role(ADMIN|STUDENT)。
- 注册 POST /api/auth/register：学生含 studentNo，管理员无需；返回成功/失败。
- GET /api/auth/me：返回当前用户信息含角色字段。
- 学生活动接口：GET /api/activities（分页/筛选），GET /api/activities/{id}，POST /api/activities/{id}/register，POST /api/activities/{id}/cancel，GET /api/activities/me。
- 管理员接口：POST /api/admin/activities，PUT /api/admin/activities/{id}，DELETE /api/admin/activities/{id}，GET /api/admin/registrations?status=pending，POST /api/admin/registrations/{id}/approve，POST /api/admin/registrations/{id}/reject。
- 统一响应：成功 {code:0,data:...} 或直接返回数据；失败 code!=0，填 message。
- 请返回示例 token/role 字段以便前端提取；若用 Bearer，请在 data.token 或 accessToken 中给出。
```
