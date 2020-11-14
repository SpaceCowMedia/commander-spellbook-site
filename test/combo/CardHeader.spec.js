import { mount } from '@vue/test-utils'
import CardHeader from '@/components/combo/CardHeader.vue'

jest.mock('scryfall-client')

describe('CardHeader', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(CardHeader)
    expect(wrapper.vm).toBeTruthy()
  })

  test('sets card images', () => {
    const wrapper = mount(CardHeader, {
      propsData: {
        cards: [
          {
            cardImageUrl: 'https://example.com/art1.png',
          },
          {
            cardImageUrl: 'https://example.com/art2.png',
          },
          {
            cardImageUrl: 'https://example.com/art3.png',
          },
        ],
      },
    })

    const imgs = wrapper.findAll('.card-image')

    expect(imgs.at(0).element.src).toBe('https://example.com/art1.png')
    expect(imgs.at(1).element.src).toBe('https://example.com/art2.png')
    expect(imgs.at(2).element.src).toBe('https://example.com/art3.png')
  })
})
