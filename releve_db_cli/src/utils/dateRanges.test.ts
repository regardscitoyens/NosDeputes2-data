import { describe, expect, test } from '@jest/globals'
import { getDateRangeInsideRatio, NumericalDateRange } from './dateRanges'

function sum(a: number, b: number) {
  return a + b
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

describe('getDateRangeInsideRatio', () => {
  const outer = {
    start_date: 100,
    end_date: 200,
  }

  function getRatio(inner: NumericalDateRange) {
    return getDateRangeInsideRatio(inner, outer)
  }

  test('inner is strictly within', () => {
    expect(getRatio({ start_date: 120, end_date: 150 })).toBe(1)
  })

  test('outer is strictly before', () => {
    expect(getRatio({ start_date: 50, end_date: 80 })).toBe(0)
  })

  test('outer is strictly after', () => {
    expect(getRatio({ start_date: 250, end_date: 280 })).toBe(0)
  })

  test('inner is mostly outside', () => {
    expect(getRatio({ start_date: 60, end_date: 110 })).toBe(0.2)
  })

  test('inner is mostly within', () => {
    expect(getRatio({ start_date: 160, end_date: 210 })).toBe(0.8)
  })
})
