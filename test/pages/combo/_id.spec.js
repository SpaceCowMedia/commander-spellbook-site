import { shallowMount } from '@vue/test-utils'
import ComboPage from '@/pages/combo/_id.vue'
import spellbookApi from 'commander-spellbook'

jest.mock('commander-spellbook')

describe('ComboPage', () => {
  let options, $route

  beforeEach(() => {
    $route = {
      params: {
        id: '13',
      },
    }
    options = {
      mocks: {
        $route,
      },
      stubs: {
        CardHeader: true,
        ComboList: true,
        ColorIdentity: true,
        ComboSidebarLinks: true,
        ComboResults: true,
        SearchBar: true,
      },
    }
  })

  it('starts in loaded false state', () => {
    const wrapper = shallowMount(ComboPage, options)

    expect(wrapper.vm.loaded).toBe(false)
  })

  it('creates a card header component', async () => {
    const CardHeaderStub = {
      template: '<div></div>',
      props: {
        cardsArt: {
          type: Array,
          default() {
            return []
          },
        },
      },
    }
    options.stubs.CardHeader = CardHeaderStub
    const wrapper = shallowMount(ComboPage, options)

    await wrapper.setData({
      cards: [
        {
          name: 'Card 1',
          artUrl: 'https://example.com/art-1',
          oracleImageUrl: 'https://example.com/card-1',
        },
        {
          name: 'Card 2',
          artUrl: 'https://example.com/art-2',
          oracleImageUrl: 'https://example.com/card-2',
        },
      ],
    })

    expect(wrapper.findComponent(CardHeaderStub).props('cardsArt')).toEqual([
      'https://example.com/art-1',
      'https://example.com/art-2',
    ])
  })

  it('creates a combo list of the data', async () => {
    const ComboListStub = {
      template: '<div></div>',
      props: {
        iterations: {
          type: Array,
          default() {
            return []
          },
        },
      },
    }
    options.stubs.ComboList = ComboListStub
    const wrapper = shallowMount(ComboPage, options)

    await wrapper.setData({
      prerequisites: ['pre 1', 'pre 2'],
      steps: ['step 1', 'step 2'],
      results: ['result 1', 'result 2'],
      cards: [
        {
          name: 'Card 1',
          artUrl: 'https://example.com/art-1',
          oracleImageUrl: 'https://example.com/card-1',
        },
        {
          name: 'Card 2',
          artUrl: 'https://example.com/art-2',
          oracleImageUrl: 'https://example.com/card-2',
        },
      ],
    })

    const lists = wrapper.findAllComponents(ComboListStub)

    expect(lists.at(0).props('iterations')).toEqual(['Card 1', 'Card 2'])
    expect(lists.at(1).props('iterations')).toEqual(['pre 1', 'pre 2'])
    expect(lists.at(2).props('iterations')).toEqual(['step 1', 'step 2'])
    expect(lists.at(3).props('iterations')).toEqual(['result 1', 'result 2'])
  })

  it('adds a ColorIdentity component', async () => {
    const ColorIdentityStub = {
      template: '<div></div>',
      props: {
        colors: {
          type: Array,
          default() {
            return []
          },
        },
      },
    }
    options.stubs.ColorIdentity = ColorIdentityStub
    const wrapper = shallowMount(ComboPage, options)

    await wrapper.setData({
      colorIdentity: ['w', 'u'],
    })

    expect(wrapper.findComponent(ColorIdentityStub).props('colors')).toEqual([
      'w',
      'u',
    ])
  })

  describe('loadCombo', () => {
    beforeEach(() => {
      spellbookApi.search.mockResolvedValue([])
    })

    it('looks up combo and loads data from it', async () => {
      const imageSpy = jest.fn().mockReturnValue('https://example.com/card')

      spellbookApi.search.mockResolvedValue([
        {
          commanderSpellbookId: '13',
          prerequisites: ['1', '2', '3'],
          steps: ['1', '2', '3'],
          results: ['1', '2', '3'],
          colorIdentity: {
            colors: ['w', 'b', 'r'],
          },
          cards: [
            {
              name: 'card 1',
              getScryfallImageUrl: imageSpy,
            },
            {
              name: 'card 2',
              getScryfallImageUrl: imageSpy,
            },
          ],
        },
      ])

      const wrapper = shallowMount(ComboPage, options)

      await wrapper.vm.loadCombo()

      expect(spellbookApi.search).toBeCalledTimes(1)
      expect(spellbookApi.search).toBeCalledWith('id:13')

      expect(wrapper.vm.loaded).toBe(true)
      expect(wrapper.vm.title).toBe('Combo Number 13')
      expect(wrapper.vm.prerequisites).toEqual(['1', '2', '3'])
      expect(wrapper.vm.steps).toEqual(['1', '2', '3'])
      expect(wrapper.vm.results).toEqual(['1', '2', '3'])
      expect(wrapper.vm.results).toEqual(['1', '2', '3'])
      expect(wrapper.vm.cards).toEqual([
        {
          name: 'card 1',
          artUrl: 'https://example.com/card',
          oracleImageUrl: 'https://example.com/card',
        },
        {
          name: 'card 2',
          artUrl: 'https://example.com/card',
          oracleImageUrl: 'https://example.com/card',
        },
      ])

      expect(imageSpy).toBeCalledTimes(4)
      expect(imageSpy).toBeCalledWith()
      expect(imageSpy).toBeCalledWith('art_crop')
    })

    it('does not load data from combo when no combos is found for id', async () => {
      spellbookApi.search.mockResolvedValue([])

      const wrapper = shallowMount(ComboPage, options)

      await wrapper.vm.loadCombo()

      expect(spellbookApi.search).toBeCalledTimes(1)
      expect(spellbookApi.search).toBeCalledWith('id:13')

      expect(wrapper.vm.loaded).toBe(false)
      expect(wrapper.vm.title).toBe('Looking up Combo')
      expect(wrapper.vm.prerequisites).toEqual([])
      expect(wrapper.vm.steps).toEqual([])
      expect(wrapper.vm.results).toEqual([])
      expect(wrapper.vm.results).toEqual([])
      expect(wrapper.vm.cards).toEqual([])
    })
  })
})
