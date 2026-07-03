# 水浒卡鉴赏室

一个用于展示小浣熊水浒卡的响应式网站，提供卡片正反面鉴赏、基于 Three.js 的 3D 旋转与缩放、多版本卡片对比等功能，并支持 PC 端键盘操作及移动端触控交互。

项目功能由自己设计页面，借助 AI 生成代码，累计投入约 15 小时、历经 5 轮 AI 用量周期，完成了素材搜集、开发调试、组件化重构、性能与交互体验优化、单元测试与线上部署等环节。

在线体验：[https://pwstrick.github.io/water-card/](https://pwstrick.github.io/water-card/)

<img src="demo/qrcode.png" alt="水浒卡鉴赏室二维码" width="200" height="200">

## 页面预览

### PC 端

<a href="demo/water-pc.png" target="_blank">
  <img src="demo/water-pc.png" alt="PC 端页面" width="600">
</a>


### 移动端

<a href="demo/water-mobile.png" target="_blank">
  <img src="demo/water-mobile.png" alt="移动端页面" width="260">
</a>

## 功能

- 收录普卡、奖闪等不同卡组及 108 位好汉资料
- 支持拖动旋转、缩放和正反面切换的 3D 卡片预览
- 支持卡片预览图下载
- 最多选择 6 张卡片进行正反面对比和拖动排序
- 支持人物快速检索、键盘操作和移动端浏览
- 提供《好汉歌》背景音乐开关

## 技术栈

- React 19
- Vite 8
- Tailwind CSS 4
- Three.js
- dnd-kit
- Vitest + Testing Library

## 本地开发

建议使用 Node.js 24，最低版本要求为 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:5175`。

其他常用命令：

```bash
npm test          # 运行单元测试
npm run build     # 构建生产版本
npm run preview   # 预览构建结果
```

## 项目结构

```text
public/assets/               卡片图片资源
src/components/card-viewer/  Three.js 卡片预览
src/components/comparison/   多卡对比区域
src/components/common/       通用交互组件
src/config/                  卡图裁切和操作提示配置
src/data/                    好汉资料及卡组配置
tests/                       单元测试
```

## 卡片数据

人物基础资料维护在 `src/data/heroes.js`，卡组在 `src/data/collections.js` 中统一注册。每张卡图包含正反两面，具体裁切范围由 `src/config/cardImageLayouts.js` 配置。

新增完整卡组时，建议先将图片转换为质量 80～85 的 WebP，再按人物顺序以 `1.webp`～`108.webp` 命名并放入 `public/assets/<卡组目录>/`，然后创建对应的数据模块并注册到 `collections`。如果卡图的正反面尺寸或留白与现有卡组不同，还需要增加独立的裁切配置。

## 部署

### GitHub Pages

推送到 `main` 分支后，GitHub Actions 会依次完成测试、构建、产物上传和 Pages 部署。GitHub Pages 使用 `/water-card/` 作为资源基础路径。

### EdgeOne Pages

EdgeOne 使用相同代码构建，建议配置如下：

- Node.js：24
- 安装命令：`npm ci`
- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量：`DEPLOY_TARGET=edgeone`

设置 `DEPLOY_TARGET=edgeone` 后，Vite 会使用 `/` 作为资源基础路径，使网站可以直接部署在独立域名根目录。
