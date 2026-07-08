import type { CardSet } from '../types'

/** Year (or year span) covered by a group of sets, e.g. "1998" or "1996–2004". */
export function yearRangeLabel(setList: CardSet[]): string | undefined {
  const years = setList.map((set) => set.year).filter((year): year is number => year !== undefined)
  if (years.length === 0) return undefined
  const min = Math.min(...years)
  const max = Math.max(...years)
  return min === max ? `${min}` : `${min}–${max}`
}
