## Purpose

定义桌面、手机、触摸平板和 UC 浏览器桌面模式下的设备识别、布局切换、触控可用性和减弱动画基础行为。

## Requirements

### Requirement: 综合识别移动设备

系统 MUST 综合用户代理、触摸能力、主指针类型和设备短边判断移动设备，而不得仅用是否支持触摸作为唯一依据。

#### Scenario: 移动浏览器用户代理

- **WHEN** 用户代理匹配 Android、iPhone、iPad、iPod、Mobile 或 UC 移动标识
- **THEN** 系统使用移动设备布局

#### Scenario: 手机尺寸屏幕

- **WHEN** 设备屏幕短边不超过 768 像素
- **THEN** 系统使用移动设备布局

#### Scenario: 触摸优先平板

- **WHEN** 设备支持触摸、主指针为 coarse 且短边不超过 1024 像素
- **THEN** 系统使用移动设备布局

#### Scenario: 大屏触控笔记本

- **WHEN** 设备支持触摸但具有精细主指针且屏幕短边大于移动限制
- **THEN** 系统不得仅因触摸能力强制使用移动布局

### Requirement: 兼容 UC 桌面模式

系统 MUST 在 UC 浏览器改写移动用户代理的桌面模式下，使用触摸能力和设备短边补充识别移动布局。

#### Scenario: UC 桌面模式触摸设备

- **WHEN** 用户代理包含 UC 标识、设备支持触摸且短边不超过 1024 像素
- **THEN** 系统使用移动设备布局

### Requirement: 在启动时标记移动能力

系统 MUST 在 React 应用挂载前检测设备，并在移动设备上为文档根元素添加 `mobile-device` 类。

#### Scenario: 移动设备启动应用

- **WHEN** 页面脚本确认当前环境为移动设备
- **THEN** `<html>` 元素在首个 React 组件渲染前具有 `mobile-device` 类

### Requirement: 按设备能力调整鉴赏布局

系统 MUST 在桌面端将人物选择器放在详情侧栏，并在移动设备上将其放在 3D 鉴赏区顶部。

#### Scenario: 桌面布局

- **WHEN** 页面处于桌面布局
- **THEN** 详情侧栏显示人物选择器
- **AND** 鉴赏区顶部的移动选择器隐藏

#### Scenario: 移动布局

- **WHEN** 文档根元素具有 `mobile-device` 类
- **THEN** 鉴赏区顶部显示人物选择器
- **AND** 详情侧栏中的桌面人物选择器隐藏

### Requirement: 允许触摸页面滚动和卡片操作共存

系统 MUST 为 Three.js 画布保留直接指针手势，并为对比卡片保留纵向页面滚动能力。

#### Scenario: 操作 Three.js 卡片

- **WHEN** 用户在单卡画布上进行单指或双指手势
- **THEN** 手势由卡片旋转、缩放和平移逻辑处理

#### Scenario: 在对比卡片上纵向滑动

- **WHEN** 用户未满足长按拖拽条件而在对比卡片上纵向滑动
- **THEN** 浏览器仍可滚动页面

### Requirement: 提供旧版 UC 布局兜底

系统 MUST 使用传统 transform 居中方式处理需要水平居中的工具栏和导航，避免依赖旧版 UC 内核不支持的独立 `translate` 属性。

#### Scenario: 旧版 UC 渲染居中元素

- **WHEN** 浏览器不支持独立 CSS `translate` 属性
- **THEN** 使用 `transform: translateX(-50%)` 保持元素水平居中

### Requirement: 提供基础减弱动画处理

系统 MUST 在用户启用 `prefers-reduced-motion: reduce` 时关闭页面平滑滚动和首屏加载条动画。

#### Scenario: 用户偏好减弱动画

- **WHEN** 媒体查询 `prefers-reduced-motion: reduce` 匹配
- **THEN** 页面滚动行为改为非平滑
- **AND** 首屏加载条停止动画

