import { shallowMount } from '@vue/test-utils'
import getRandomItemFromArray from '@/components/lib/random-from-array'
import NotFoundErrorComponent from '@/components/errors/not-found.vue'
import ErrorBaseComponent from '@/components/errors/error-base.vue'

import { mocked } from 'ts-jest/utils'
jest.mock('@/components/lib/random-from-array')

describe('NotFoundErrorComponent', () => {
  it('sets a random background class', () => {
    mocked(getRandomItemFromArray).mockReturnValue([
      'mock-class',
      'mock message',
    ])

    const wrapper = shallowMount(NotFoundErrorComponent)
    expect(wrapper.vm.$data.notFoundClass).toBe('mock-class')
    expect(wrapper.vm.$data.notFoundMessage).toBe('mock message')
  })

  it('creates an Error Base Component', () => {
    const wrapper = shallowMount(NotFoundErrorComponent)
    const baseError = wrapper.findComponent(ErrorBaseComponent)

    expect(baseError).toBeTruthy()
    expect(baseError.props('mainMessage')).toBe('Page Not Found')
  })
})
