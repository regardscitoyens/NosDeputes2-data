export type DateRange = {
  start_date: Date
  end_date: Date
}

export type NumericalDateRange = {
  start_date: number
  end_date: number
}

function numerical(r: DateRange): NumericalDateRange {
  return {
    start_date: r.start_date.getTime(),
    end_date: r.end_date.getTime(),
  }
}

// Return true is at least some point in time is within both ranges
export function areRangesOverlapping(a: DateRange, b: DateRange) {
  if (a.start_date < b.start_date) {
    return !(a.end_date < b.start_date)
  } else {
    return !(b.end_date < a.start_date)
  }
}

export function getDateRangeInsideRatio(
  inner: DateRange,
  outer: DateRange,
): number {
  return getDateRangeNumericalInsideRatio(numerical(inner), numerical(outer))
}

// if the date range 'inner' is completely within the date range 'outer', returns 1
// if the date range 'inner' is completely outside of the date range 'outer', returns 0
// if the date range 'inner' is mostly within 'outer', but there's just a few days outside of it, returns a ratio like 0.85
export function getDateRangeNumericalInsideRatio(
  inner: NumericalDateRange,
  outer: NumericalDateRange,
): number {
  const lastStart = Math.max(inner.start_date, outer.start_date)
  const firstEnd = Math.min(inner.end_date, outer.end_date)
  const timeWithin = positive(firstEnd - lastStart)

  if (timeWithin === 0) {
    return 0
  }

  const innerTotalTime = positive(inner.end_date - inner.start_date)

  // const startOutside = positive(outer.start_date - inner.start_date)
  // const endOutside = positive(inner.end_date - outer.end_date)
  // const timeOutside = startOutside + endOutside

  return timeWithin / innerTotalTime
}

function positive(n: number) {
  return n < 0 ? 0 : n
}
