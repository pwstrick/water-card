export const getListboxNavigationIndex = ({
  key,
  startIndex,
  itemCount,
  findEnabledIndex,
  includeStart = false,
}) => {
  if (itemCount <= 0) return -1

  // 这里只把按键翻译成索引策略；禁用项和循环规则由调用方的查找函数负责。
  if (key === 'ArrowDown') return findEnabledIndex(startIndex, 1, includeStart)
  if (key === 'ArrowUp') return findEnabledIndex(startIndex, -1, includeStart)
  if (key === 'Home') return findEnabledIndex(0, 1, true)
  if (key === 'End') return findEnabledIndex(itemCount - 1, -1, true)

  return -1
}
