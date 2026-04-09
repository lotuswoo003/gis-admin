# System服务完整接口文档

本文档包含system-server模块的所有REST API接口。

## 目录

- [1. 用户管理](#1-用户管理)
- [2. 登录认证](#2-登录认证)
- [3. 角色管理](#3-角色管理)
- [4. 权限管理](#4-权限管理)
- [5. 组织管理](#5-组织管理)
- [6. 部门管理](#6-部门管理)
- [7. 字典管理](#7-字典管理)
- [8. 行政区划](#8-行政区划)
- [9. 附件管理](#9-附件管理)
- [10. 消息管理](#10-消息管理)
- [11. 业务项目](#11-业务项目)
- [12. 项目任务](#12-项目任务)
- [13. 项目工单](#13-项目工单)
- [14. 项目人员](#14-项目人员)
- [15. 项目地块](#15-项目地块)
- [16. GIS资源池](#16-gis资源池)
- [17. 工序信息](#17-工序信息)
- [18. 工序单价](#18-工序单价)
- [19. 安全检查](#19-安全检查)
- [20. 保养安全检查](#20-保养安全检查)
- [21. 计划模板](#21-计划模板)
- [22. 短信服务](#22-短信服务)
- [23. 权限包管理](#23-权限包管理)
- [24. 用户组织关系](#24-用户组织关系)
- [25. 用户角色关系](#25-用户角色关系)
- [26. 密码管理](#26-密码管理)

---

## 1. 用户管理

**基础路径**: `/user`

### 1.1 获取用户详情
- **方法**: POST
- **路径**: `/user/get/{id}`
- **参数**: id (路径参数)
- **说明**: 根据ID获取用户详情

### 1.2 查询当前用户基本信息
- **方法**: POST
- **路径**: `/user/v1/select-base`
- **说明**: 获取当前登录用户的基本信息

### 1.3 用户列表
- **方法**: POST
- **路径**: `/user/list`
- **说明**: 获取所有用户列表

### 1.4 分页查询用户
- **方法**: POST
- **路径**: `/user/page`
- **请求体**: UserPageRequest (page, rows, username, nickname, mobile)
- **说明**: 分页查询当前组织下的用户

### 1.5 创建用户
- **方法**: POST
- **路径**: `/user/create`
- **请求体**: UserRequest (user, deptIds, orgIds)
- **说明**: 创建新用户并关联部门和组织

### 1.6 更新用户
- **方法**: POST
- **路径**: `/user/update`
- **请求体**: UserRequest (user, deptIds, orgIds)
- **说明**: 更新用户信息

### 1.7 删除用户
- **方法**: POST
- **路径**: `/user/delete/{id}`
- **参数**: id (路径参数)
- **说明**: 逻辑删除用户

### 1.8 获取当前用户权限
- **方法**: POST
- **路径**: `/user/permissions`
- **说明**: 获取当前用户的权限列表

### 1.9 用户切换组织
- **方法**: POST
- **路径**: `/user/changeOrganization`
- **请求头**: Authorization
- **请求体**: ChangeOrganizationRequest (organizationId)
- **说明**: 切换当前登录组织

### 1.10 修改用户密码
- **方法**: POST
- **路径**: `/user/changePassword/{id}`
- **参数**: id (路径参数)
- **请求体**: ChangePasswordRequest (oldPassword, newPassword)
- **说明**: 修改用户密码

### 1.11 查询当前用户可视边界
- **方法**: POST
- **路径**: `/user/v1/select-boundary`
- **说明**: 查询当前用户可视的地理边界

---

## 2. 登录认证

**基础路径**: `/login`

### 2.1 密码登录
- **方法**: POST
- **路径**: `/login/password`
- **请求体**: LoginPasswordRequest (username, password, organizationId)
- **返回**: Token
- **说明**: 使用用户名/手机号和密码登录

### 2.2 验证码登录
- **方法**: POST
- **路径**: `/login/phone-verify-code`
- **请求体**: LoginPhoneVerifyCodeRequest (phoneNumber, verifyCode, organizationId)
- **返回**: Token
- **说明**: 使用手机号和验证码登录

### 2.3 退出登录
- **方法**: POST
- **路径**: `/login/logout`
- **请求头**: Authorization
- **说明**: 退出当前登录

---

## 3. 角色管理

**基础路径**: `/roles`

### 3.1 获取角色详情
- **方法**: POST
- **路径**: `/roles/get/{id}`
- **参数**: id (路径参数)

### 3.2 角色列表
- **方法**: POST
- **路径**: `/roles/list`

### 3.3 创建角色
- **方法**: POST
- **路径**: `/roles/create`
- **请求体**: RoleCreateRequest (name, description, type, orgId)

### 3.4 创建角色并分配权限
- **方法**: POST
- **路径**: `/roles/v1/insert`
- **请求体**: RoleCreateRequest (含permissionIds)

### 3.5 更新角色
- **方法**: POST
- **路径**: `/roles/update`
- **请求体**: RoleUpdateRequest

### 3.6 更新角色并分配权限
- **方法**: POST
- **路径**: `/roles/v1/update`
- **请求体**: RoleUpdateRequest (含permissionIds)

### 3.7 分页查询角色
- **方法**: POST
- **路径**: `/roles/page`
- **请求体**: RolePageRequest (name, page, rows)

### 3.8 分页查询角色下的用户
- **方法**: POST
- **路径**: `/roles/pageUserById`
- **请求体**: RoleUserPageRequest (roleId, name, phoneNumber, page, rows)

### 3.9 添加角色成员
- **方法**: POST
- **路径**: `/roles/member/add`
- **请求体**: RoleMemberRequest (roleId, userId)

### 3.10 移除角色成员
- **方法**: POST
- **路径**: `/roles/member/delete`
- **请求体**: RoleMemberRequest (roleId, userId)

### 3.11 删除角色
- **方法**: POST
- **路径**: `/roles/delete/{id}`
- **参数**: id (路径参数)

### 3.12 获取角色权限
- **方法**: POST
- **路径**: `/roles/permission/get/{roleId}`
- **参数**: roleId (路径参数)
- **返回**: 权限ID列表

### 3.13 更新角色权限
- **方法**: POST
- **路径**: `/roles/permission/update/{roleId}`
- **参数**: roleId (路径参数)
- **请求体**: RolePermissionUpdateRequest (permissionIds)

---

## 4. 权限管理

**基础路径**: `/permission`

### 4.1 获取权限详情
- **方法**: POST
- **路径**: `/permission/get/{id}`
- **参数**: id (路径参数)

### 4.2 权限列表
- **方法**: POST
- **路径**: `/permission/list`

### 4.3 分页查询权限
- **方法**: POST
- **路径**: `/permission/page`
- **请求体**: PermissionPageRequest (name, page, rows)

### 4.4 创建权限
- **方法**: POST
- **路径**: `/permission/create`
- **请求体**: PermissionCreateRequest

### 4.5 更新权限
- **方法**: POST
- **路径**: `/permission/update`
- **请求体**: PermissionUpdateRequest

### 4.6 删除权限
- **方法**: POST
- **路径**: `/permission/delete/{id}`
- **参数**: id (路径参数)

### 4.7 查询子权限
- **方法**: POST
- **路径**: `/permission/children`
- **请求体**: PermissionChildrenRequest (parentId, type)

### 4.8 查询权限路径
- **方法**: POST
- **路径**: `/permission/treePath`
- **请求体**: PermissionTreePathRequest (treePath)

### 4.9 权限树
- **方法**: POST
- **路径**: `/permission/tree`
- **请求体**: PermissionTreeRequest (type)

### 4.10 按组织查询权限树
- **方法**: GET
- **路径**: `/permission/treeByOrg`
- **说明**: 查询当前组织的权限树

---

## 5. 组织管理

**基础路径**: `/organization`

### 5.1 获取组织详情
- **方法**: GET
- **路径**: `/organization/get/{id}`
- **参数**: id (路径参数)

### 5.2 保存组织
- **方法**: POST
- **路径**: `/organization/save`
- **请求体**: OrganizationCreateRequest

### 5.3 更新组织
- **方法**: POST
- **路径**: `/organization/update`
- **请求体**: Organization

### 5.4 删除组织
- **方法**: POST
- **路径**: `/organization/delete`
- **请求参数**: id

### 5.5 分页查询组织
- **方法**: POST
- **路径**: `/organization/page`
- **请求体**: OrgPageRequest (name, page, rows)

### 5.6 绑定目标组织
- **方法**: POST
- **路径**: `/organization/bindTargets`
- **请求体**: OrganizationRelationBindRequest (sourceOrgId, targetOrgIds)
- **说明**: 绑定源组织与目标组织列表

### 5.7 查询目标组织列表
- **方法**: GET
- **路径**: `/organization/targetOrgs`
- **请求参数**: sourceOrgId
- **说明**: 查询源组织的目标组织列表

---

## 6. 部门管理

**基础路径**: `/department`

### 6.1 获取部门详情
- **方法**: GET
- **路径**: `/department/{id}`
- **参数**: id (路径参数)

### 6.2 部门树
- **方法**: POST
- **路径**: `/department/v1/select-tree`
- **说明**: 查询当前组织下的部门树

### 6.3 创建部门
- **方法**: POST
- **路径**: `/department/v1/insert`
- **请求体**: Department

### 6.4 更新部门
- **方法**: POST
- **路径**: `/department/v1/update`
- **请求体**: Department

### 6.5 删除部门
- **方法**: POST
- **路径**: `/department/v1/delete`
- **请求体**: id (String)

### 6.6 批量更新用户部门关系
- **方法**: POST
- **路径**: `/department/v1/updateUserDepartment`
- **请求体**: List<UserDepartmentUpdateRequest>

---

## 7. 字典管理

**基础路径**: `/dict`

### 7.1 获取字典
- **方法**: GET
- **路径**: `/dict/{id}`
- **参数**: id (路径参数)
- **说明**: 获取字典类型及其数据列表

### 7.2 字典列表
- **方法**: GET
- **路径**: `/dict`
- **说明**: 获取所有字典类型及数据

### 7.3 创建字典
- **方法**: POST
- **路径**: `/dict`
- **请求体**: DictType (含dataList)

### 7.4 更新字典
- **方法**: PUT
- **路径**: `/dict/{id}`
- **参数**: id (路径参数)
- **请求体**: DictType (含dataList)

### 7.5 删除字典
- **方法**: DELETE
- **路径**: `/dict/{id}`
- **参数**: id (路径参数)

---

## 8. 行政区划

**基础路径**: `/postalCode`

### 8.1 查询行政区划
- **方法**: POST
- **路径**: `/postalCode/select`
- **请求体**: PostalCodeRequest (id, level, name, displayName)
- **说明**: 支持多条件查询行政区划

---

## 9. 附件管理

**基础路径**: `/attach`

### 9.1 上传附件
- **方法**: POST
- **路径**: `/attach/upload`
- **请求**: Multipart (file)
- **返回**: 附件ID

### 9.2 获取附件
- **方法**: POST
- **路径**: `/attach/get/{id}`
- **参数**: id (路径参数)

### 9.3 附件列表
- **方法**: POST
- **路径**: `/attach/list`

### 9.4 删除附件
- **方法**: POST
- **路径**: `/attach/delete/{id}`
- **参数**: id (路径参数)

---

## 10. 消息管理

**基础路径**: `/message`

### 10.1 发送邀请
- **方法**: POST
- **路径**: `/message/invite`
- **请求体**: InviteUserRequest

### 10.2 接受邀请
- **方法**: POST
- **路径**: `/message/invite/accept`
- **请求体**: MessageInviteActionRequest (messageId)

### 10.3 拒绝邀请
- **方法**: POST
- **路径**: `/message/invite/reject`
- **请求体**: MessageInviteActionRequest (messageId)

### 10.4 分页查询消息
- **方法**: POST
- **路径**: `/message/page`
- **请求体**: MessagePageRequest (page, rows, status, type)

### 10.5 分页查询当前用户消息
- **方法**: POST
- **路径**: `/message/pageCurrentUser`
- **请求体**: MessagePageRequest

### 10.6 更新消息状态
- **方法**: POST
- **路径**: `/message/v1/update`
- **请求体**: MessageStatusUpdateRequest (id, status)

---

## 11. 业务项目

**基础路径**: `/business-projects`

### 11.1 获取项目
- **方法**: POST
- **路径**: `/business-projects/getProject`
- **请求参数**: id

### 11.2 项目列表
- **方法**: POST
- **路径**: `/business-projects/listProject`
- **请求参数**: order (可选, asc/desc)
- **说明**: 按当前组织筛选的项目列表

### 11.3 创建项目
- **方法**: POST
- **路径**: `/business-projects/createProject`
- **请求体**: BusinessProjectDTO
- **关键字段**:
  - `partyAOrganizationId`: 甲方组织 ID，只能选择政府类型组织
  - `partyBOrganizationId`: 乙方组织 ID，只能选择企业类型组织
  - `startDate` / `endDate`: 项目开始、结束日期
  - `centerPoint`: 项目中心点，可为空

### 11.4 更新项目
- **方法**: POST
- **路径**: `/business-projects/updateProject`
- **请求体**: BusinessProjectDTO
- **关键字段**:
  - `id`: 项目 ID
  - `partyAOrganizationId`: 甲方组织 ID，只能选择政府类型组织
  - `partyBOrganizationId`: 乙方组织 ID，只能选择企业类型组织
  - `startDate` / `endDate`: 项目开始、结束日期
  - `centerPoint`: 项目中心点，可为空

### 11.5 项目委派
- **方法**: POST
- **路径**: `/business-projects/delegate`
- **请求体**: BusinessProjectDelegateRequest (projectId, organizationId)
- **说明**: 委派项目给乙方组织

### 11.6 删除项目
- **方法**: POST
- **路径**: `/business-projects/deleteProject`
- **请求参数**: id

---

## 12. 项目任务

**基础路径**: `/business-project-tasks`

### 12.1 创建任务
- **方法**: POST
- **路径**: `/business-project-tasks/create`
- **请求体**: BusinessProjectTaskCreateRequest

### 12.2 更新任务
- **方法**: POST
- **路径**: `/business-project-tasks/update`
- **请求体**: BusinessProjectTaskUpdateRequest

### 12.3 按项目查询任务列表
- **方法**: POST
- **路径**: `/business-project-tasks/listByProjectId`
- **请求体**: BusinessProjectTaskQueryRequest (projectId)

### 12.4 获取任务详情
- **方法**: POST
- **路径**: `/business-project-tasks/detail/{id}`
- **参数**: id (路径参数)

### 12.5 导入计划
- **方法**: POST
- **路径**: `/business-project-tasks/v1/importPlan`
- **请求体**: PlanImportDTO

---

## 13. 项目工单

**基础路径**: `/business-project-workorders`

### 13.1 创建工单
- **方法**: POST
- **路径**: `/business-project-workorders/create`
- **请求体**: BusinessProjectWorkorderCreateRequest

### 13.2 更新工单
- **方法**: POST
- **路径**: `/business-project-workorders/update`
- **请求体**: BusinessProjectWorkorderUpdateRequest

### 13.3 删除工单
- **方法**: POST
- **路径**: `/business-project-workorders/delete`
- **请求参数**: id

### 13.4 工单详情
- **方法**: POST
- **路径**: `/business-project-workorders/detail`
- **请求参数**: id

### 13.5 分页查询工单
- **方法**: POST
- **路径**: `/business-project-workorders/page`
- **请求体**: BusinessProjectWorkorderPageRequest (projectId, taskId, status, page, rows)

---

## 14. 项目人员

**基础路径**: `/business-project-staff`

### 14.1 创建项目人员
- **方法**: POST
- **路径**: `/business-project-staff/create`

### 14.2 查询项目人员
- **方法**: POST
- **路径**: `/business-project-staff/list`

### 14.3 删除项目人员
- **方法**: POST
- **路径**: `/business-project-staff/delete/{id}`

---

## 15. 项目地块

**基础路径**: `/business-project-plane`

### 15.1 创建地块
- **方法**: POST
- **路径**: `/business-project-plane/create`

### 15.2 查询地块列表
- **方法**: POST
- **路径**: `/business-project-plane/list`

### 15.3 删除地块
- **方法**: POST
- **路径**: `/business-project-plane/delete/{id}`

---

## 16. GIS资源池

**基础路径**: `/resourcePool`

### 16.1 获取资源池详情
- **方法**: POST
- **路径**: `/resourcePool/get/{id}`

### 16.2 资源池列表
- **方法**: POST
- **路径**: `/resourcePool/list`

### 16.3 创建资源池
- **方法**: POST
- **路径**: `/resourcePool/create`
- **请求体**: ResourcePoolCreateRequest (name, organizationId, polygon, level)

### 16.4 更新资源池
- **方法**: POST
- **路径**: `/resourcePool/update`
- **请求体**: ResourcePoolUpdateRequest

### 16.5 删除资源池
- **方法**: POST
- **路径**: `/resourcePool/delete/{id}`

### 16.6 分页查询资源池
- **方法**: POST
- **路径**: `/resourcePool/page`
- **请求体**: ResourcePoolPageRequest (name, organizationId, page, rows)

### 16.7 导入SHP文件
- **方法**: POST
- **路径**: `/resourcePool/importShp/{organizationId}`
- **参数**: organizationId (路径参数)
- **请求**: Multipart (file)
- **说明**: 上传SHP压缩包，解析后写入资源池

### 16.8 同步资源池地块
- **方法**: POST
- **路径**: `/resourcePool/sync`
- **请求体**: GisResouecePoolSyncRequest
- **说明**: 将部分地块同步给甲方

---

## 17. 工序信息

**基础路径**: `/processInfo`

### 17.1 获取工序信息
- **方法**: POST
- **路径**: `/processInfo/get/{id}`

### 17.2 工序列表
- **方法**: POST
- **路径**: `/processInfo/list`

### 17.3 创建工序
- **方法**: POST
- **路径**: `/processInfo/create`
- **请求体**: ProcessInfo

### 17.4 更新工序
- **方法**: POST
- **路径**: `/processInfo/update`
- **请求体**: ProcessInfo

### 17.5 删除工序
- **方法**: POST
- **路径**: `/processInfo/delete/{id}`

### 17.6 分页查询工序
- **方法**: POST
- **路径**: `/processInfo/page`
- **请求体**: ProcessInfoPageRequest (type, question, organizationId, page, rows)

### 17.7 下载导入模板
- **方法**: GET
- **路径**: `/processInfo/downloadTemplate`
- **说明**: 下载工序信息Excel导入模板

### 17.8 Excel导入工序
- **方法**: POST
- **路径**: `/processInfo/upload/import`
- **请求**: Multipart (file)
- **说明**: 批量导入工序信息

---

## 18. 工序单价

**基础路径**: `/processUnitPrice`

### 18.1 获取单价
- **方法**: POST
- **路径**: `/processUnitPrice/get/{id}`

### 18.2 单价列表
- **方法**: POST
- **路径**: `/processUnitPrice/list`

### 18.3 创建单价
- **方法**: POST
- **路径**: `/processUnitPrice/create`

### 18.4 更新单价
- **方法**: POST
- **路径**: `/processUnitPrice/update`

### 18.5 删除单价
- **方法**: POST
- **路径**: `/processUnitPrice/delete/{id}`

### 18.6 分页查询单价
- **方法**: POST
- **路径**: `/processUnitPrice/page`

---

## 19. 安全检查

**基础路径**: `/securityCheck`

### 19.1 获取安全检查
- **方法**: POST
- **路径**: `/securityCheck/get/{id}`

### 19.2 安全检查列表
- **方法**: POST
- **路径**: `/securityCheck/list`

### 19.3 创建安全检查
- **方法**: POST
- **路径**: `/securityCheck/create`
- **请求体**: SecurityCheck

### 19.4 更新安全检查
- **方法**: POST
- **路径**: `/securityCheck/update`
- **请求体**: SecurityCheck

### 19.5 删除安全检查
- **方法**: POST
- **路径**: `/securityCheck/delete/{id}`

### 19.6 分页查询安全检查
- **方法**: POST
- **路径**: `/securityCheck/page`
- **请求体**: SecurityCheckPageRequest (code, name, mode, parentId, page, rows)

---

## 20. 保养安全检查

**基础路径**: `/securityCheck`

### 20.1 获取保养安全检查
- **方法**: POST
- **路径**: `/securityCheck/get/{id}`

### 20.2 保养安全检查列表
- **方法**: POST
- **路径**: `/securityCheck/list`

### 20.3 创建保养安全检查
- **方法**: POST
- **路径**: `/securityCheck/create`
- **请求体**: ConserveSecurityCheck

### 20.4 更新保养安全检查
- **方法**: POST
- **路径**: `/securityCheck/update`
- **请求体**: ConserveSecurityCheck

### 20.5 删除保养安全检查
- **方法**: POST
- **路径**: `/securityCheck/delete/{id}`

### 20.6 分页查询保养安全检查
- **方法**: POST
- **路径**: `/securityCheck/page`
- **请求体**: ConserveSecurityCheckPageRequest (code, name, mode, parentId, page, rows)

---

## 21. 计划模板

**基础路径**: `/planTemplate`

### 21.1 获取模板
- **方法**: POST
- **路径**: `/planTemplate/get/{id}`

### 21.2 模板列表
- **方法**: POST
- **路径**: `/planTemplate/list`

### 21.3 创建模板
- **方法**: POST
- **路径**: `/planTemplate/create`

### 21.4 更新模板
- **方法**: POST
- **路径**: `/planTemplate/update`

### 21.5 删除模板
- **方法**: POST
- **路径**: `/planTemplate/delete/{id}`

---

## 22. 短信服务

**基础路径**: `/sms`

### 22.1 发送验证码
- **方法**: POST
- **路径**: `/sms/sendVerifyCode`
- **请求参数**: phoneNumber
- **说明**: 发送登录验证码到手机

---

## 23. 权限包管理

**基础路径**: `/permissionPackage`

### 23.1 获取权限包
- **方法**: POST
- **路径**: `/permissionPackage/get/{id}`

### 23.2 权限包列表
- **方法**: POST
- **路径**: `/permissionPackage/list`

### 23.3 创建权限包
- **方法**: POST
- **路径**: `/permissionPackage/create`
- **请求体**: PermissionPackageCreateRequest

### 23.4 更新权限包
- **方法**: POST
- **路径**: `/permissionPackage/update`
- **请求体**: PermissionPackageUpdateRequest

### 23.5 删除权限包
- **方法**: POST
- **路径**: `/permissionPackage/delete/{id}`

### 23.6 绑定权限到权限包
- **方法**: POST
- **路径**: `/permissionPackage/bindPermissions`
- **请求体**: PermissionPackageBindPermissionsRequest (packageId, permissionIds)

### 23.7 绑定权限包到组织
- **方法**: POST
- **路径**: `/permissionPackage/bindOrganization`
- **请求体**: OrganizationPackageBindRequest

### 23.8 绑定权限包到组织类型
- **方法**: POST
- **路径**: `/permissionPackage/bindOrganizationType`
- **请求体**: OrganizationTypePackageBindRequest

---

## 24. 用户组织关系

**基础路径**: `/userOrganization`

### 24.1 获取用户组织列表
- **方法**: POST
- **路径**: `/userOrganization/list`

### 24.2 绑定用户与组织
- **方法**: POST
- **路径**: `/userOrganization/bind`

### 24.3 解绑用户与组织
- **方法**: POST
- **路径**: `/userOrganization/unbind`

---

## 25. 用户角色关系

**基础路径**: `/userRole`

### 25.1 更新用户角色
- **方法**: POST
- **路径**: `/userRole/update`
- **请求体**: UserRoleUpdateRequest (userId, roleIds)

---

## 26. 密码管理

**基础路径**: `/password`

### 26.1 检查是否需要修改密码
- **方法**: POST
- **路径**: `/password/needChange`
- **返回**: NeedChangePasswordResponse (needChange)

---

## 通用说明

### 响应格式

```json
{
  "code": 200,
  "data": {},
  "message": "success"
}
```

### 分页参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Integer | 是 | 页码，从1开始 |
| rows | Integer | 是 | 每页数量 |

### 分页响应

```json
{
  "total": 100,
  "records": []
}
```

### 认证方式

大部分接口需要在请求头中携带认证令牌：

```
Authorization: Bearer <token>
```

### 时间格式

所有时间字段使用ISO 8601格式：`2024-01-01T00:00:00Z`

### 逻辑删除

系统采用逻辑删除机制，删除操作设置`deleted_at`字段而不是物理删除数据。

---

**文档版本**: 1.0
**更新日期**: 2024-10-10
**维护团队**: System Server开发组
