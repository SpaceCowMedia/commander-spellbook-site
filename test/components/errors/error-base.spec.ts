import { shallowMount } from '@vue/test-utils'
import ErrorBaseComponent from '@/components/errors/error-base.vue'

describe('ErrorBaseComponent', () => {
  it('focuses on exit link upon mounting', () => {
    jest.spyOn(HTMLElement.prototype, 'focus')

    const wrapper = shallowMount(ErrorBaseComponent, {
      propsData: {
        mainMessage: 'Main',
        subMessage: 'Sub',
        containerClass: 'class-name',
      },
      stubs: {
        NuxtLink: true,
      },
    })

    // @ts-ignore
    expect(wrapper.vm.$refs.homeLink.$el.focus).toBeCalledTimes(1)
  })
})
