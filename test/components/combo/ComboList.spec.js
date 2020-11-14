import { mount } from '@vue/test-utils'
import ComboList from '@/components/combo/ComboList.vue'
import TextWithMagicSymbol from '@/components/TextWithMagicSymbol.vue'

describe('ComboList', () => {
  test('creates a list of combo items', () => {
    const wrapper = mount(ComboList, {
      propsData: {
        title: 'My Title',
        iterations: ['Step 1', 'Step 2', 'Step 3'],
      },
    })

    expect(wrapper.find('.combo-list-title').element.textContent).toBe(
      'My Title'
    )

    const items = wrapper.findAllComponents(TextWithMagicSymbol)

    expect(items.length).toBe(3)
    expect(items.at(0).props('text')).toBe('Step 1')
    expect(items.at(1).props('text')).toBe('Step 2')
    expect(items.at(2).props('text')).toBe('Step 3')
  })

  test('can set list to be numbered', () => {
    const wrapperWithoutNumbers = mount(ComboList, {
      propsData: {
        title: 'My Title',
        iterations: ['Step 1', 'Step 2', 'Step 3'],
      },
    })
    const wrapperWithNumbers = mount(ComboList, {
      propsData: {
        title: 'My Title',
        showNumbers: true,
        iterations: ['Step 1', 'Step 2', 'Step 3'],
      },
    })

    expect(wrapperWithoutNumbers.find('ol').classes()).not.toContain(
      'list-decimal'
    )
    expect(wrapperWithNumbers.find('ol').classes()).toContain('list-decimal')
  })
})
