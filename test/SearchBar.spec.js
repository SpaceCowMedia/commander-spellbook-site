import { mount } from '@vue/test-utils'
import SearchBar from '@/components/SearchBar.vue'
import spellbookApi from 'commander-spellbook'

jest.mock('commander-spellbook')

describe('SearchBar', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(SearchBar)
    expect(wrapper.vm).toBeTruthy()
  })

  test('can set an classes on the input', () => {
    const wrapper = mount(SearchBar, {
      propsData: {
        inputClass: 'custom class names',
      },
    })

    expect(wrapper.find('.main-search-input').classes()).toContain('custom')
    expect(wrapper.find('.main-search-input').classes()).toContain('class')
    expect(wrapper.find('.main-search-input').classes()).toContain('names')
  })

  describe('lookupNumberOfCombos', () => {
    test('sets numberOfCombos to the number of combos found in spellbook api', async () => {
      const wrapper = mount(SearchBar)

      spellbookApi.search.mockResolvedValue([{}])

      expect(
        wrapper.find('.main-search-input').element.getAttribute('placeholder')
      ).toBe('Search x combos')

      await wrapper.vm.lookupNumberOfCombos()

      expect(
        wrapper.find('.main-search-input').element.getAttribute('placeholder')
      ).toBe('Search 1 combos')
    })
  })
})
