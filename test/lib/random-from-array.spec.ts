import getRandomItemFromArray from '@/components/lib/random-from-array'

describe('getRandomItemFromArray', () => {
  it('returns a random item from the array', () => {
    const array = [1, 2, 3, 4]

    jest.spyOn(Math, 'random')

    const item = getRandomItemFromArray<number>(array)

    expect(Math.random).toBeCalledTimes(1)
    expect(array).toContain(item)
  })
})
