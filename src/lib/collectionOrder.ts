import { sets } from '../data/sets'
import type { CardSet } from '../types'

export type ChildEntry =
  | { type: 'set'; set: CardSet }
  | { type: 'series'; seriesId: string; seriesName: string; seriesDescription?: string; sets: CardSet[] }

export type NavTarget = { to: string; label: string }

// Splits a set name like "ADV Retsuden Part 2" or "Hyper Sticker Collection 3"
// into a series prefix ("ADV Retsuden Part") and part number (2), so same-year
// entries from the same series can be sub-ordered by release order. A 4-digit
// suffix (e.g. "Waza 1998") is a year, not a part number, and is ignored.
function seriesPart(name: string): { prefix: string; num: number } | null {
  const match = name.match(/^(.*\S)\s+(\d{1,2})$/)
  if (!match) return null
  return { prefix: match[1], num: Number(match[2]) }
}

export function sortByYear<T>(items: T[], yearOf: (item: T) => number, nameOf?: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const yearDiff = yearOf(a) - yearOf(b)
    if (yearDiff !== 0 || !nameOf) return yearDiff

    const aPart = seriesPart(nameOf(a))
    const bPart = seriesPart(nameOf(b))
    if (aPart && bPart && aPart.prefix === bPart.prefix) return aPart.num - bPart.num
    return 0
  })
}

export function earliestYearOfSets(setList: CardSet[]): number {
  const years = setList.map((set) => set.year).filter((year): year is number => year !== undefined)
  return years.length > 0 ? Math.min(...years) : Infinity
}

export function earliestYearOfChild(child: ChildEntry): number {
  return earliestYearOfSets(child.type === 'set' ? [child.set] : child.sets)
}

export function nameOfChild(child: ChildEntry): string {
  return child.type === 'set' ? child.set.name : child.seriesName
}

/** All sets in one collection, grouped into standalone sets / series and ordered the same way as the index page. */
export function getOrderedCollectionChildren(collectionId: string): ChildEntry[] {
  const children: ChildEntry[] = []
  const seriesIndex = new Map<string, number>()

  for (const set of sets) {
    if (set.collectionId !== collectionId) continue

    if (!set.seriesId) {
      children.push({ type: 'set', set })
      continue
    }

    const existingIndex = seriesIndex.get(set.seriesId)
    if (existingIndex === undefined) {
      seriesIndex.set(set.seriesId, children.length)
      children.push({
        type: 'series',
        seriesId: set.seriesId,
        seriesName: set.seriesName ?? set.seriesId,
        seriesDescription: set.seriesDescription,
        sets: [set],
      })
    } else {
      const entry = children[existingIndex]
      if (entry.type === 'series') entry.sets.push(set)
    }
  }

  return sortByYear(children, earliestYearOfChild, nameOfChild)
}

function toNavTarget(child: ChildEntry): NavTarget {
  if (child.type === 'set') return { to: `/sets/${child.set.id}`, label: child.set.name }
  return { to: `/series/${child.seriesId}`, label: child.seriesName }
}

/** Previous/next links to sibling sets (or series) within the same collection, in index order. */
export function getSiblingNav(setId: string): { prev?: NavTarget; next?: NavTarget } {
  const set = sets.find((s) => s.id === setId)
  if (!set?.collectionId) return {}

  const children = getOrderedCollectionChildren(set.collectionId)
  const index = children.findIndex((child) =>
    child.type === 'set' ? child.set.id === setId : child.sets.some((s) => s.id === setId),
  )
  if (index === -1) return {}

  return {
    prev: index > 0 ? toNavTarget(children[index - 1]) : undefined,
    next: index < children.length - 1 ? toNavTarget(children[index + 1]) : undefined,
  }
}
