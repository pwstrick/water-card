## Purpose

定义单卡鉴赏和卡片对比共用的图片加载状态、有限自动重试、手动恢复和缓存规避行为，确保网络波动不会直接造成永久空白。

## Requirements

### Requirement: 显示明确的图片加载状态

系统 MUST 区分 loading、ready 和 error 状态，并在图片尚未就绪时显示与使用场景匹配的加载提示。

#### Scenario: 首次加载图片

- **WHEN** 新图片开始加载
- **THEN** 对应卡片区域显示加载指示器
- **AND** 不显示手动重试按钮

#### Scenario: 图片加载成功

- **WHEN** 图片或纹理加载完成
- **THEN** 系统隐藏加载和错误遮罩并显示卡面

### Requirement: 使用有限退避自动重试

系统 MUST 在图片加载失败后最多自动重试两次，第一次等待 1 秒，第二次等待 2 秒。

#### Scenario: 首次加载失败

- **WHEN** 图片进入 error 状态且尚未自动重试
- **THEN** 系统显示“正在重试”状态
- **AND** 在 1 秒后发起第一次自动重试

#### Scenario: 第一次自动重试失败

- **WHEN** 图片再次进入 error 状态且已经自动重试一次
- **THEN** 系统在 2 秒后发起第二次自动重试

#### Scenario: 自动重试耗尽

- **WHEN** 两次自动重试均失败
- **THEN** 系统停止自动调度
- **AND** 显示带“重新加载”按钮的错误状态

### Requirement: 使用 cache-busting 重试地址

系统 MUST 在每次重试时向原图片地址追加递增的 `retry` 查询参数，同时保留原有查询参数和 hash。

#### Scenario: 原地址没有查询参数

- **WHEN** `/assets/standard/1.webp` 进行第 2 次重试
- **THEN** 重试地址为 `/assets/standard/1.webp?retry=2`

#### Scenario: 原地址包含查询参数和 hash

- **WHEN** `/image.webp?v=1#front` 进行第 3 次重试
- **THEN** 重试地址为 `/image.webp?v=1&retry=3#front`

### Requirement: 支持用户手动重试

系统 MUST 在自动重试耗尽后允许用户手动发起新的加载尝试，并停止后续自动重试计时。

#### Scenario: 用户点击重新加载

- **WHEN** 最终错误状态显示且用户点击“重新加载”
- **THEN** 系统立即增加尝试次数并使用新的 cache-busting 地址加载
- **AND** 不再创建自动重试计时器

### Requirement: 图片源变化时重置重试状态

系统 MUST 在基础图片源发生变化时清零尝试次数和自动重试次数，不得让新卡片继承旧卡片的失败状态。

#### Scenario: 失败后切换人物

- **WHEN** 当前图片加载失败后用户切换到另一张图片源
- **THEN** 新图片从首次加载状态开始
- **AND** 新图片仍拥有完整的两次自动重试机会

### Requirement: 清理待执行重试

系统 MUST 在图片状态恢复、图片源变化或组件卸载时清理不再适用的自动重试计时器。

#### Scenario: 等待重试期间组件卸载

- **WHEN** 自动重试计时器尚未触发且对应组件卸载
- **THEN** 系统取消该计时器
- **AND** 不在卸载后更新组件状态

