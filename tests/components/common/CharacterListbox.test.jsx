import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CharacterListbox from '../../../src/components/common/CharacterListbox'

const cards = [
  { id: '001', nickname: '豹子头', name: '林冲', romanizedName: 'LIN CHONG' },
  { id: '002', nickname: '花和尚', name: '鲁智深', romanizedName: 'LU ZHISHEN' },
  { id: '003', nickname: '行者', name: '武松', romanizedName: 'WU SONG' },
]

function renderListbox(props = {}) {
  const onSelect = vi.fn()
  render(
    <CharacterListbox
      cards={cards}
      currentCard={cards[1]}
      selectedIds={[cards[1].id]}
      onSelect={onSelect}
      {...props}
    />,
  )
  return { onSelect }
}

describe('CharacterListbox keyboard interaction', () => {
  afterEach(() => {
    document.documentElement.classList.remove('mobile-device')
  })

  it('打开后聚焦搜索框，并可用方向键和回车选择', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderListbox()
    const trigger = screen.getByRole('button', { name: '选择水浒人物' })

    await user.click(trigger)
    await waitFor(() => expect(screen.getByRole('searchbox', { name: '搜索人物' })).toHaveFocus())

    const options = screen.getAllByRole('option')
    await user.keyboard('{ArrowDown}')
    expect(options[1]).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(options[2]).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith(cards[2])
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('Esc 关闭列表并将焦点返回触发按钮', async () => {
    const user = userEvent.setup()
    renderListbox()
    const trigger = screen.getByRole('button', { name: '选择水浒人物' })

    await user.click(trigger)
    await waitFor(() => expect(screen.getByRole('searchbox', { name: '搜索人物' })).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('方向键会跳过禁用人物', async () => {
    const user = userEvent.setup()
    renderListbox({ currentCard: cards[0], isDisabled: (card) => card.id === '002' })

    await user.click(screen.getByRole('button', { name: '选择水浒人物' }))
    await waitFor(() => expect(screen.getByRole('searchbox', { name: '搜索人物' })).toHaveFocus())
    const options = screen.getAllByRole('option')
    await user.keyboard('{ArrowDown}')
    expect(options[0]).toHaveFocus()
    await user.keyboard('{ArrowDown}')

    expect(options[2]).toHaveFocus()
  })

  it('可以按中文或拼音搜索人物', async () => {
    const user = userEvent.setup()
    renderListbox()

    await user.click(screen.getByRole('button', { name: '选择水浒人物' }))
    const search = screen.getByRole('searchbox', { name: '搜索人物' })

    await user.type(search, 'wusong')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: /武松/ })).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, '豹子头')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: /林冲/ })).toBeInTheDocument()
  })

  it('关闭后会清空搜索条件，重开恢复完整列表', async () => {
    const user = userEvent.setup()
    renderListbox()
    const trigger = screen.getByRole('button', { name: '选择水浒人物' })

    await user.click(trigger)
    await user.type(screen.getByRole('searchbox', { name: '搜索人物' }), '不存在')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(screen.getAllByRole('option')).toHaveLength(cards.length)
  })

  it('移动端打开后不会自动聚焦搜索框', async () => {
    document.documentElement.classList.add('mobile-device')
    const user = userEvent.setup()
    renderListbox()
    const trigger = screen.getByRole('button', { name: '选择水浒人物' })

    await user.click(trigger)

    const search = screen.getByRole('searchbox', { name: '搜索人物' })
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    expect(search).not.toHaveFocus()
    expect(trigger).toHaveFocus()
  })
})
