import { shallowMount } from '@vue/test-utils'
import HomePage from '@/pages/index.vue'

describe('HomePage', () => {
  let $route, $router, wrapperOptions

  beforeEach(() => {
    $route = {
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
      stubs: {
        SearchBar: true,
        Logo: true,
        NuxtLink: true,
      },
    }
  })

  it('remains on home page when no query is available', () => {
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).not.toBeCalled()
  })

  it('remains on home page when query is not a string', () => {
    $route.query.q = ['foo', 'bar']
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).not.toBeCalled()
  })

  it('redirects to search page when query is available', () => {
    $route.query.q = 'card:Sydri'
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).toBeCalledTimes(1)
    expect($router.push).toBeCalledWith('/search?q=card:Sydri')
  })

  it('redirects to combo page when query is a number', () => {
    $route.query.q = '435'
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).toBeCalledTimes(1)
    expect($router.push).toBeCalledWith('/combo/435')
  })

  it('redirects to search results page when query is a spoiled', () => {
    $route.query.q = 'spoiled'
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).toBeCalledTimes(1)
    expect($router.push).toBeCalledWith('/search?q=is:spoiled')
  })

  it('redirects to search results page when status param is a spoiled', () => {
    $route.query.q = 'card:Sydri'
    $route.query.status = 'spoiled'
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).toBeCalledTimes(1)
    expect($router.push).toBeCalledWith('/search?q=is:spoiled')
  })

  it('redirects to search results page when query is a banned', () => {
    $route.query.q = 'banned'
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).toBeCalledTimes(1)
    expect($router.push).toBeCalledWith('/search?q=is:banned')
  })

  it('redirects to search results page when status param is a banned', () => {
    $route.query.q = 'card:Sydri'
    $route.query.status = 'banned'
    shallowMount(HomePage, wrapperOptions)

    expect($router.push).toBeCalledTimes(1)
    expect($router.push).toBeCalledWith('/search?q=is:banned')
  })
})
