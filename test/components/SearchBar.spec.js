import { mount } from '@vue/test-utils'
import SearchBar from '@/components/SearchBar.vue'
import spellbookApi from 'commander-spellbook'

jest.mock('commander-spellbook')

describe('SearchBar', () => {
  let $route, $router, wrapperOptions

  beforeEach(() => {
    $route = {
      path: '',
      query: {},
    }
    $router = {
      push: jest.fn(),
    }
    wrapperOptions = {
      mocks: {
        $route,
        $router,
      },
    }
  })

  test('can set an classes on the input', () => {
    wrapperOptions.propsData = {
      inputClass: 'custom class names',
    }
    const wrapper = mount(SearchBar, wrapperOptions)

    expect(wrapper.find('.main-search-input').classes()).toContain('custom')
    expect(wrapper.find('.main-search-input').classes()).toContain('class')
    expect(wrapper.find('.main-search-input').classes()).toContain('names')
  })

  test('sets query from the query param if available', () => {
    $route.query.q = 'card:sydri'
    const wrapper = mount(SearchBar, wrapperOptions)

    expect(wrapper.vm.query).toBe('card:sydri')
  })

  test('does not set query if it is not a string', () => {
    $route.query.q = ['card:sydri']
    const wrapper = mount(SearchBar, wrapperOptions)

    expect(wrapper.vm.query).toBe('')
  })

  test('it triggers onEnter when enter key is pressed', async () => {
    const wrapper = mount(SearchBar, wrapperOptions)

    jest.spyOn(wrapper.vm, 'onEnter')

    await wrapper.find('input').trigger('keydown.enter')

    expect(wrapper.vm.onEnter).toBeCalledTimes(1)
  })

  describe('lookupNumberOfCombos', () => {
    test('sets numberOfCombos to the number of combos found in spellbook api', async () => {
      const wrapper = mount(SearchBar, wrapperOptions)

      spellbookApi.search.mockResolvedValue([{}])

      expect(
        wrapper.find('.main-search-input').element.getAttribute('placeholder')
      ).toBe('Search .... combos')

      await wrapper.vm.lookupNumberOfCombos()

      expect(
        wrapper.find('.main-search-input').element.getAttribute('placeholder')
      ).toBe('Search 1 combos')
    })
  })

  describe('onEnter', () => {
    test('noops when there is no query', () => {
      const wrapper = mount(SearchBar, wrapperOptions)

      wrapper.vm.onEnter()

      expect($router.push).not.toBeCalled()
    })

    test('noops when the query is made up of blank spaces', async () => {
      const wrapper = mount(SearchBar, wrapperOptions)

      await wrapper.setData({ query: '      ' })

      wrapper.vm.onEnter()

      expect($router.push).not.toBeCalled()
    })

    test('redirects to /search with query', async () => {
      const wrapper = mount(SearchBar, wrapperOptions)

      await wrapper.setData({ query: 'card:Rashmi' })

      wrapper.vm.onEnter()

      expect($router.push).toBeCalledTimes(1)
      expect($router.push).toBeCalledWith('/search?q=card:Rashmi')
    })

    test('dispatches event when on the search path', async () => {
      $route.path = '/search'

      const wrapper = mount(SearchBar, wrapperOptions)
      jest.spyOn(wrapper.vm, '$emit')

      await wrapper.setData({ query: 'card:Rashmi' })

      wrapper.vm.onEnter()

      expect($router.push).not.toBeCalled()
      expect(wrapper.vm.$emit).toBeCalledTimes(1)
      expect(wrapper.vm.$emit).toBeCalledWith('new-query', 'card:Rashmi')
    })
  })
})
