# 项目概述

本项目是一个基于Web的管理系统，作为一个多功能后台框架模板。它旨在快速开发，适用于大多数后台管理系统的实现，特别是需要快速交付的外包项目。该应用通过ArcGIS Web Components集成了地理信息系统（GIS）功能。

## 核心技术

*   **前端框架:** Vue 3
*   **状态管理:** Pinia
*   **UI库:** Element Plus
*   **语言:** TypeScript
*   **构建工具:** Vite 3
*   **地图库:** ArcGIS API for JavaScript (`@arcgis/core`, `@arcgis/map-components`)
*   **HTTP客户端:** Axios
*   **图表:** Echarts, Vue-Echarts
*   **富文本/Markdown编辑器:** MdEditorV3
*   **数字动画:** CountUp.js
*   **图片裁剪:** Vue-Cropper
*   **Excel处理:** Xlsx

## 架构和规范

*   **项目结构:** 遵循标准的Vue CLI-like结构，明确关注点分离（API服务、资产、可重用组件、配置、路由、状态存储、类型定义、工具函数和视图）。
*   **API通信:** 使用Axios进行HTTP请求。API基础URL通过环境变量（`VITE_API_BASE_URL`）为不同的部署环境动态配置。`vite.config.ts`中设置了开发代理以解决CORS问题。后端API预期返回统一的响应格式：`{ code: 0, message: "success", data: { /* 实际数据 */ } }`，其中`code: 0`表示成功。
*   **路由:** 由Vue Router管理，实现单页应用内的导航。
*   **状态管理:** Pinia用于集中式状态管理，按功能逻辑组织（例如，字典、权限、用户数据、地图状态）。
*   **权限控制:** 实现了一个自定义Vue指令（`v-permiss`），根据用户权限管理UI元素的可见性。
*   **国际化:** Element Plus组件配置为中文（`zh-cn`）区域设置。
*   **GIS集成:** 直接使用ArcGIS Web Components，允许在Vue模板中使用以`arcgis-`为前缀的自定义元素。
*   **代码风格:**
    *   **Prettier:** 强制执行一致的代码格式，`semi: false`（无分号），`singleQuote: true`（字符串使用单引号），`printWidth: 100`。
    *   **EditorConfig:** 确保不同IDE之间编辑器设置的一致性，包括`utf-8`字符集，`lf`行尾符，`insert_final_newline = true`，`indent_style = space`和`indent_size = 2`。

## 构建与运行

### 前提条件

*   Node.js版本14.18或更高。

### 安装

在本地设置项目：

```bash
# 克隆仓库 (如果尚未完成)
git clone https://github.com/lin-xin/vue-manage-system.git
cd vue-manage-system

# 使用npm或yarn安装依赖
npm install # 或 yarn install
```

### 开发

启动开发服务器：

*   **默认开发环境:**
    ```bash
    npm run dev
    ```
*   **特定环境:**
    ```bash
    npm run dev:lynn
    npm run dev:uat
    ```

### 构建生产版本

为部署构建应用程序，针对不同环境提供了各种脚本：

*   **默认构建:**
    ```bash
    npm run build
    ```
*   **特定环境:**
    ```bash
    npm run build:lynn
    npm run build:dev
    npm run build:uat
    npm run build:prod
    ```
    构建输出将位于`dist`目录中。

### 运行已构建的应用

构建完成后，您可以在本地预览生产构建版本：

```bash
npm run serve
```

---

**请注意：** 后续交流请使用中文。在编写代码时，注释和文档都应使用中文。