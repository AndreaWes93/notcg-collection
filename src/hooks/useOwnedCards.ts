import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'notcg-collection-owned-v1'

type OwnedMap = Record<string, boolean>

function readOwnedMap(): OwnedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OwnedMap) : {}
  } catch {
    return {}
  }
}

// Module-level store shared by every useOwnedCards() instance, so toggling a
// card in one component (e.g. a section on the combined series page) is
// immediately reflected everywhere else (e.g. the page's total progress bar).
let ownedMap: OwnedMap = readOwnedMap()
const listeners = new Set<() => void>()

function setOwnedMap(next: OwnedMap) {
  ownedMap = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ownedMap))
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return ownedMap
}

export function useOwnedCards() {
  const owned = useSyncExternalStore(subscribe, getSnapshot)

  const isOwned = useCallback((cardId: string) => Boolean(owned[cardId]), [owned])

  const toggleOwned = useCallback((cardId: string) => {
    setOwnedMap({ ...ownedMap, [cardId]: !ownedMap[cardId] })
  }, [])

  const setManyOwned = useCallback((cardIds: string[], value: boolean) => {
    const next = { ...ownedMap }
    for (const id of cardIds) next[id] = value
    setOwnedMap(next)
  }, [])

  const countOwned = useCallback(
    (cardIds: string[]) => cardIds.reduce((count, id) => count + (owned[id] ? 1 : 0), 0),
    [owned],
  )

  return { isOwned, toggleOwned, setManyOwned, countOwned }
}
