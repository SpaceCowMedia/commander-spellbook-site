import { shallowMount, RouterLinkStub } from '@vue/test-utils'
import ComboResults from '@/components/search/ComboResults.vue'

describe('ComboResults', () => {
  test('creates a link for each combo result', () => {
    const wrapper = shallowMount(ComboResults, {
      stubs: {
        NuxtLink: RouterLinkStub,
      },
      propsData: {
        results: [
          {
            names: 'a, b, c',
            id: '1',
          },
          {
            names: 'd, e, f',
            id: '2',
          },
          {
            names: 'g, h, i',
            id: '3',
          },
        ],
      },
    })

    const links = wrapper.findAllComponents(RouterLinkStub)

    expect(links.length).toBe(3)
  })
})
