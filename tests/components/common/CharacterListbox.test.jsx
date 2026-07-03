import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CharacterListbox from '../../../src/components/common/CharacterListbox'

const cards = [
  { id: '001', nickname: '豹子头', name: '林冲' },
  { id: '002', nickname: '花和尚', name: '鲁智深' },
  { id: '003', nickname: '行者', name: '武松' },
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
  it('打开后聚焦当前人物，并可用方向键和回车选择', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderListbox()
    const trigger = screen.getByRole('button', { name: '选择水浒人物' })

    await user.click(trigger)
    const options = screen.getAllByRole('option')
    await waitFor(() => expect(options[1]).toHaveFocus())

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
    await waitFor(() => expect(screen.getAllByRole('option')[1]).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('方向键会跳过禁用人物', async () => {
    const user = userEvent.setup()
    renderListbox({ currentCard: cards[0], isDisabled: (card) => card.id === '002' })

    await user.click(screen.getByRole('button', { name: '选择水浒人物' }))
    const options = screen.getAllByRole('option')
    await waitFor(() => expect(options[0]).toHaveFocus())
    await user.keyboard('{ArrowDown}')

    expect(options[2]).toHaveFocus()
  })
})
