import { shallowMount, RouterLinkStub } from '@vue/test-utils'
import ComboResults from '@/components/search/ComboResults.vue'

describe('ComboResults', () => {
  let options

  beforeEach(() => {
    options = {
      stubs: {
        NuxtLink: RouterLinkStub,
        ColorIdentity: true,
        CardTooltip: true,
      },
      propsData: {
        results: [
          {
            names: ['a', 'b', 'c'],
            id: '1',
            results: ['result 1', 'result 2'],
            colors: ['w', 'b', 'r'],
          },
          {
            names: ['d', 'e', 'f', 'g'],
            id: '2',
            results: ['result 3', 'result 4'],
            colors: ['g', 'u'],
          },
          {
            names: ['h', 'i'],
            id: '3',
            results: ['result 5', 'result 6'],
            colors: ['c'],
          },
        ],
      },
    }
  })

  test('creates a link for each combo result', () => {
    const wrapper = shallowMount(ComboResults, options)

    const links = wrapper.findAllComponents(RouterLinkStub)

    expect(links.length).toBe(3)
    expect(links.at(0).props('to')).toBe('/combo/1')
    expect(links.at(1).props('to')).toBe('/combo/2')
    expect(links.at(2).props('to')).toBe('/combo/3')
  })

  test('creates a card tooltip for each name', () => {
    const CardTooltipStub = {
      template: '<div><slot /></div>',
    }
    options.stubs.CardTooltip = CardTooltipStub
    const wrapper = shallowMount(ComboResults, options)

    const links = wrapper.findAllComponents(RouterLinkStub)
    const firstCardTooltips = links.at(0).findAllComponents(CardTooltipStub)
    const secondCardTooltips = links.at(1).findAllComponents(CardTooltipStub)
    const thirdCardTooltips = links.at(2).findAllComponents(CardTooltipStub)

    expect(firstCardTooltips.length).toBe(3)
    expect(firstCardTooltips.at(0).find('.card-name').element.textContent).toBe(
      'a'
    )
    expect(firstCardTooltips.at(1).find('.card-name').element.textContent).toBe(
      'b'
    )
    expect(firstCardTooltips.at(2).find('.card-name').element.textContent).toBe(
      'c'
    )
    expect(secondCardTooltips.length).toBe(4)
    expect(
      secondCardTooltips.at(0).find('.card-name').element.textContent
    ).toBe('d')
    expect(
      secondCardTooltips.at(1).find('.card-name').element.textContent
    ).toBe('e')
    expect(
      secondCardTooltips.at(2).find('.card-name').element.textContent
    ).toBe('f')
    expect(
      secondCardTooltips.at(3).find('.card-name').element.textContent
    ).toBe('g')
    expect(thirdCardTooltips.length).toBe(2)
    expect(thirdCardTooltips.at(0).find('.card-name').element.textContent).toBe(
      'h'
    )
    expect(thirdCardTooltips.at(1).find('.card-name').element.textContent).toBe(
      'i'
    )
  })

  test('prints results for each combo', () => {
    const wrapper = shallowMount(ComboResults, options)

    const links = wrapper.findAllComponents(RouterLinkStub)

    expect(links.at(0).findAll('.result').at(0).element.textContent).toContain(
      'result 1'
    )
    expect(links.at(0).findAll('.result').at(1).element.textContent).toContain(
      'result 2'
    )
    expect(links.at(1).findAll('.result').at(0).element.textContent).toContain(
      'result 3'
    )
    expect(links.at(1).findAll('.result').at(1).element.textContent).toContain(
      'result 4'
    )
    expect(links.at(2).findAll('.result').at(0).element.textContent).toContain(
      'result 5'
    )
    expect(links.at(2).findAll('.result').at(1).element.textContent).toContain(
      'result 6'
    )
  })

  test('prints the color identity', () => {
    const CIStub = {
      template: '<div></div>',
      props: {
        colors: {
          type: Array,
          default: [],
        },
      },
    }
    options.stubs.ColorIdentity = CIStub
    const wrapper = shallowMount(ComboResults, options)

    const links = wrapper.findAllComponents(RouterLinkStub)

    expect(links.at(0).findComponent(CIStub).props('colors')).toEqual([
      'w',
      'b',
      'r',
    ])
    expect(links.at(1).findComponent(CIStub).props('colors')).toEqual([
      'g',
      'u',
    ])
    expect(links.at(2).findComponent(CIStub).props('colors')).toEqual(['c'])
  })
})
