# vue-manage-system

  <a href="https://github.com/lin-xin/vue-manage-system/releases">
    <img src="https://img.shields.io/github/release/lin-xin/vue-manage-system.svg" alt="GitHub release">
  </a>
   <a href="https://github.com/lin-xin/vue-manage-system/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
  </a>

基于 Vue3 + pinia + Element Plus 的后台管理系统解决方案。[线上演示](https://lin-xin.github.io/example/vue-manage-system/)

> Vue2 版本请看 [tag-V4.2.0](https://github.com/lin-xin/vue-manage-system/tree/V4.2.0)，带后台功能请看 [tsrpc-manage-system](https://github.com/lin-xin/tsrpc-manage-system)

[文档地址](https://lin-xin.github.io/example/vuems-doc/)
[English document](https://github.com/lin-xin/manage-system/blob/master/README_EN.md)

## 赞助商

### 好问

[<img src="https://static.bestqa.net/logo/bestqa_haowen.png" width="220" height="100">](https://www.bestqa.net/home/index.html)

专业问卷服务，一对一客服，按需定制

## 支持作者

请作者喝杯咖啡吧！(微信号：linxin_20)

![微信扫一扫](https://lin-xin.github.io/images/weixin.jpg)

## 前言

该方案作为一套多功能的后台框架模板，适用于绝大部分的后台管理系统开发。基于 Vue3 + pinia + typescript，引用 Element Plus 组件库，方便开发。实现逻辑简单，适合外包项目，快速交付。

## 接口约定

所有后端接口均返回统一格式：

```
{
  "code": 0,
  "message": "success",
  "data": { /* 实际数据 */ }
}
```

其中 `code` 为 `0` 表示成功，`data` 包含具体业务数据。

## 功能

-   [x] Element Plus
-   [x] vite 3
-   [x] pinia
-   [x] typescript
-   [x] 登录/注册
-   [x] Dashboard
-   [x] 表格/表单
-   [x] 图表 :bar_chart:
-   [x] 富文本/markdown 编辑器
-   [x] 图片拖拽/裁剪上传
-   [x] 权限管理
-   [x] 三级菜单
-   [x] 自定义图标
-   [x] 主题切换

## 安装步骤

> 因为使用 vite3，node 版本需要 14.18+

```
git clone https://github.com/lin-xin/vue-manage-system.git      // 把模板下载到本地
cd vue-manage-system    // 进入模板目录
npm install         // 安装项目依赖，等待安装完成之后，安装失败可用 cnpm 或 yarn

// 运行
npm run dev

// 执行构建命令，生成的dist文件夹放在服务器下即可访问
// 开发/测试环境
npm run build:dev
// 生产环境
npm run build:prod
```

## 本地开发 CORS 提示（重要）

浏览器有同源策略，直接从 `http://localhost:*` 调接口 `http://192.168.106.97:8880` 会触发 CORS 预检（OPTIONS），如果后端未允许跨域会在浏览器报 CORS 错误；而 `curl` 不受浏览器同源策略影响因此可用。

为避免本地 CORS：
- `.env.development` 里将 `VITE_API_BASE_URL` 设为相对路径：`/codex-api/`
- `vite.config.ts` 配置了代理：
  - `server.proxy['/codex-api'] -> http://192.168.106.97:8880`
  - 本地请求变为同源请求，Vite 代理再转发到后端，无需 CORS 头

生产/UAT 不受影响，仍使用真实网关域名（见 `.env.uat`、`.env.production`）。

接口路径约定：
- 统一基础前缀通过 `VITE_API_BASE_URL`，例如 UAT：`http://192.168.106.97:8880/codex-api/`
- 模块前缀按后端模块追加：
  - 系统模块：`sys/...`，如登录 `sys/login/password`，权限 `sys/permission/...`
  - 未来可扩展：`notice/...`、`doc/...` 等

## 项目截图

### 首页

![Image text](https://github.com/lin-xin/manage-system/raw/master/screenshots/wms1.png)

### 登录

![Image text](https://github.com/lin-xin/manage-system/raw/master/screenshots/wms3.png)

## 接口前缀与模块路由规则（新增）

- 统一基础前缀：通过环境变量 `VITE_API_BASE_URL` 指向网关，例如：
  - UAT：`http://192.168.106.97:8880/codex-api/`
- 模块前缀：根据后端模块在路径前追加模块名，便于同一网关下路由到不同服务。
  - 系统模块（对应 `src/docs/sys-api.yaml`）统一以 `sys/` 作为路径前缀。
    - 示例：登录接口使用 `sys/login/password`，完整请求为：`${VITE_API_BASE_URL}sys/login/password`
    - 其它如权限接口：`${VITE_API_BASE_URL}sys/permission/...`
- 这样能够同时支持未来的其它模块，比如：
  - 通知模块：`${VITE_API_BASE_URL}notice/...`
  - 文档模块：`${VITE_API_BASE_URL}doc/...`

实现细节：
- `src/utils/request.ts` 会规范化请求 URL，自动去掉开头冗余的 `/`，避免与 `baseURL` 组合产生双斜杠。
- 若已登录，会为所有请求自动添加 `Authorization: Bearer <accessToken>`。

## License

[MIT](https://github.com/lin-xin/vue-manage-system/blob/master/LICENSE)
