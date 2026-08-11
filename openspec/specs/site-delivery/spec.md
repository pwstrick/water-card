## Purpose

定义站点启动体验、导航、背景音乐、构建基础路径和持续部署流程，确保同一套前端代码可在 GitHub Pages 与 EdgeOne 根域名环境运行。

## Requirements

### Requirement: 在 React 启动前显示静态加载界面

系统 MUST 在应用脚本加载期间显示包含站点名称的静态加载层，并在 React 应用成功挂载后的下一动画帧移除该加载层。

#### Scenario: 页面脚本仍在加载

- **WHEN** 浏览器已解析 HTML 但 React 尚未挂载
- **THEN** 页面显示“水浒卡鉴赏室”加载状态

#### Scenario: React 应用完成挂载

- **WHEN** 根应用 effect 执行
- **THEN** 系统在下一动画帧移除静态加载层

### Requirement: 提供站内锚点导航

系统 MUST 在桌面端页头提供鉴赏区和对比区锚点导航，并在移动布局中隐藏中间导航以保留页头空间。

#### Scenario: 点击对比导航

- **WHEN** 桌面用户点击“对比”
- **THEN** 浏览器导航到 `#comparison` 区域

#### Scenario: 移动设备显示页头

- **WHEN** 页面采用移动布局
- **THEN** 页头保留站点标识和音乐按钮
- **AND** 隐藏中间锚点导航

### Requirement: 由用户控制背景音乐

系统 MUST 默认不预加载或自动播放背景音乐，并通过用户操作在循环播放和暂停之间切换。

#### Scenario: 用户首次开启音乐

- **WHEN** 用户点击背景音乐按钮
- **THEN** 系统请求播放基于应用基础路径的 `song.mp3`
- **AND** 音频成功播放后按钮显示播放中状态

#### Scenario: 用户关闭音乐

- **WHEN** 音乐正在播放且用户再次点击按钮
- **THEN** 系统暂停音频并更新按钮状态

#### Scenario: 浏览器拒绝播放

- **WHEN** `audio.play()` Promise 被拒绝
- **THEN** 系统保持非播放状态
- **AND** 按钮提示音乐播放失败并允许用户重试

### Requirement: 根据部署目标选择基础路径

系统 MUST 在 `DEPLOY_TARGET=edgeone` 时使用 `/` 作为 Vite base，否则使用 `/water-card/`。

#### Scenario: 构建 EdgeOne 版本

- **WHEN** 构建环境设置 `DEPLOY_TARGET=edgeone`
- **THEN** 产物中的应用与素材地址以站点根路径为基础

#### Scenario: 构建 GitHub Pages 版本

- **WHEN** 构建环境未设置 EdgeOne 部署目标
- **THEN** Vite 使用 `/water-card/` 作为基础路径

### Requirement: 在 main 分支持续部署 GitHub Pages

系统 MUST 在代码推送到 `main` 分支或手动触发工作流时，使用 Node.js 24 安装依赖、运行测试和生产构建，成功后发布 `dist` 到 GitHub Pages。

#### Scenario: main 分支构建成功

- **WHEN** GitHub Actions 完成 `npm ci`、`npm run test` 和 `npm run build`
- **THEN** 工作流上传 `dist` 产物并部署到 GitHub Pages

#### Scenario: 测试或构建失败

- **WHEN** 测试或生产构建步骤返回失败
- **THEN** 工作流不得执行 Pages 部署

### Requirement: 使用固定本地服务端口

系统 MUST 默认在端口 5175 启动 Vite 开发服务器，并在端口 4175 启动生产预览，且端口被占用时不得自动切换到其他端口。

#### Scenario: 开发端口被占用

- **WHEN** 用户运行开发服务器且端口 5175 已被占用
- **THEN** Vite 启动失败并报告端口冲突

#### Scenario: 启动生产预览

- **WHEN** 用户运行预览命令且端口可用
- **THEN** 预览服务监听 `0.0.0.0:4175`

