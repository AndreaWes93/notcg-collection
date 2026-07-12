import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'notcg-view-mode-v1'

export type ViewMode = 'grid' | 'list'

function readViewMode(): ViewMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

// Module-level store shared by every useViewMode() instance, mirroring useOwnedCards,
// so the choice is a single global preference kept in sync across all open set pages.
let viewMode: ViewMode = readViewMode()
const listeners = new Set<() => void>()

function setViewMode(next: ViewMode) {
  viewMode = next
  localStorage.setItem(STORAGE_KEY, next)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return viewMode
}

export function useViewMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot)
  const setMode = useCallback((next: ViewMode) => setViewMode(next), [])
  return { mode, setMode }
}
