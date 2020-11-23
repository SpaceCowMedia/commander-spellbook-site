import { shallowMount } from '@vue/test-utils'
import SearchPage from '@/pages/search.vue'
import spellbookApi from 'commander-spellbook'

jest.mock('commander-spellbook')

describe('SearchPage', () => {
  let $route, wrapperOptions

  beforeEach(() => {
    $route = {
      query: {},
    }
    wrapperOptions = {
      mocks: {
        $route,
      },
      stubs: {
        SearchBar: true,
        ComboResults: true,
        NoCombosFound: true,
        LoadingCombos: true,
      },
    }
  })

  it('starts in a loading state', () => {
    const LoadingCombosStub = {
      template: '<div></div>',
    }
    const NoCombosStub = {
      template: '<div></div>',
    }
    wrapperOptions.stubs.LoadingCombos = LoadingCombosStub
    wrapperOptions.stubs.NoCombosFound = NoCombosStub
    const wrapper = shallowMount(SearchPage, wrapperOptions)

    expect(wrapper.vm.loaded).toBe(false)

    expect(wrapper.findComponent(LoadingCombosStub).exists()).toBeTruthy()
    expect(wrapper.findComponent(NoCombosStub).exists()).toBeFalsy()
  })

  it('shows no combos found when page has loaded but no results are available', async () => {
    const LoadingCombosStub = {
      template: '<div></div>',
    }
    const NoCombosStub = {
      template: '<div></div>',
    }
    wrapperOptions.stubs.LoadingCombos = LoadingCombosStub
    wrapperOptions.stubs.NoCombosFound = NoCombosStub
    const wrapper = shallowMount(SearchPage, wrapperOptions)

    expect(wrapper.vm.loaded).toBe(false)
    await wrapper.setData({
      loaded: true,
    })

    expect(wrapper.findComponent(LoadingCombosStub).exists()).toBeFalsy()
    expect(wrapper.findComponent(NoCombosStub).exists()).toBeTruthy()
  })

  it('shows combo results when page has loaded and results are available', async () => {
    const NoCombosStub = {
      template: '<div></div>',
    }
    const ComboResultsStub = {
      props: {
        results: {
          type: Array,
        },
      },
      template: '<div></div>',
    }
    wrapperOptions.stubs.NoCombosFound = NoCombosStub
    wrapperOptions.stubs.ComboResults = ComboResultsStub
    const wrapper = shallowMount(SearchPage, wrapperOptions)

    await wrapper.setData({
      loaded: true,
      results: [
        {
          names: 'a, b, c',
          id: '1',
        },
        {
          names: 'd, e, f',
          id: '2',
        },
      ],
    })

    expect(wrapper.findComponent(NoCombosStub).exists()).toBeFalsy()

    const comboResultsNode = wrapper.findComponent(ComboResultsStub)

    expect(comboResultsNode.exists()).toBeTruthy()
    expect(comboResultsNode.props('results')).toEqual([
      {
        names: 'a, b, c',
        id: '1',
      },
      {
        names: 'd, e, f',
        id: '2',
      },
    ])
  })

  it('updates search when search bar emits new-query event', async () => {
    const SearchBarStub = {
      template: '<div></div>',
    }
    wrapperOptions.stubs.SearchBar = SearchBarStub
    const wrapper = shallowMount(SearchPage, wrapperOptions)

    spellbookApi.search.mockResolvedValue([])

    await wrapper.findComponent(SearchBarStub).vm.$emit('new-query', 'query')

    expect(spellbookApi.search).toBeCalledTimes(1)
    expect(spellbookApi.search).toBeCalledWith('query')
  })

  describe('parseSearchQuery', () => {
    it('sets loaded to true if no query is available', async () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions)

      expect(wrapper.vm.loaded).toBe(false)

      await wrapper.vm.parseSearchQuery()

      expect(wrapper.vm.loaded).toBe(true)
    })

    it('noops if no query is available', async () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions)
      jest.spyOn(wrapper.vm, 'updateSearchResults')

      await wrapper.vm.parseSearchQuery()

      expect(wrapper.vm.updateSearchResults).not.toBeCalled()
    })

    it('noops if query is not a string', async () => {
      $route.query.q = ['foo', 'bar']

      const wrapper = shallowMount(SearchPage, wrapperOptions)
      jest.spyOn(wrapper.vm, 'updateSearchResults')

      await wrapper.vm.parseSearchQuery()

      expect(wrapper.vm.updateSearchResults).not.toBeCalled()
    })

    it('looks up combos with query', async () => {
      $route.query.q = 'card:Sydri'

      const wrapper = shallowMount(SearchPage, wrapperOptions)
      jest.spyOn(wrapper.vm, 'updateSearchResults').mockResolvedValue()

      spellbookApi.search.mockResolvedValue([])

      await wrapper.vm.parseSearchQuery()

      expect(wrapper.vm.updateSearchResults).toBeCalledTimes(1)
      expect(wrapper.vm.updateSearchResults).toBeCalledWith('card:Sydri')
    })

    it('sets loaded to true when done populating results', async () => {
      $route.query.q = 'card:Sydri'

      const wrapper = shallowMount(SearchPage, wrapperOptions)
      jest.spyOn(wrapper.vm, 'updateSearchResults').mockResolvedValue()

      expect(wrapper.vm.loaded).toBe(false)

      await wrapper.vm.parseSearchQuery()

      expect(wrapper.vm.loaded).toBe(true)
    })
  })

  describe('updateSearchResults', () => {
    beforeEach(() => {
      spellbookApi.search.mockResolvedValue([])
    })

    it('populates results with cmobos from lookup', async () => {
      const wrapper = shallowMount(SearchPage, wrapperOptions)

      spellbookApi.search.mockResolvedValue([
        {
          cards: ['a', 'b', 'c'],
          colorIdentity: ['r', 'b'],
          commanderSpellbookId: '1',
        },
        {
          cards: ['d', 'e', 'f'],
          colorIdentity: ['w', 'b'],
          commanderSpellbookId: '2',
        },
      ])

      await wrapper.vm.updateSearchResults('query')
      expect(spellbookApi.search).toBeCalledWith('query')

      expect(wrapper.vm.results).toEqual([
        {
          names: 'a, b, c',
          id: '1',
        },
        {
          names: 'd, e, f',
          id: '2',
        },
      ])
    })
  })
})
