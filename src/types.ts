export type CardItem = {
  id: string
  setId: string
  number: string
  name: string
  imageUrl?: string
  /** Back-of-card image, shown during the hover preview cycle. */
  backImageUrl?: string
  notes?: string
  /** Groups variants of the same card together (e.g. red/green versions) so they can be tracked independently but shown as one slot. */
  group?: string
  /** Label for this variant within its group, e.g. "Red" or "Green". */
  variant?: string
  /** Splits a set's cards into separate labeled sub-grids on the same page (e.g. a smaller "Prism" subset within a main set), without making it a standalone set. */
  section?: string
}

export type CardSet = {
  id: string
  name: string
  year?: number
  description?: string
  /** Groups sibling sets together on the index page under one label with a combined progress bar. */
  seriesId?: string
  seriesName?: string
  /** Optional description shown on the series' own group header, not on each individual set. */
  seriesDescription?: string
  /** Groups sets (and series) under a top-level umbrella on the index page, e.g. a publisher's whole card line. */
  collectionId?: string
  collectionName?: string
  /** Reference images shown once at the top of the set page (e.g. shared card backs, or holo/foil variant examples), instead of per-card. */
  referenceImages?: { label: string; imageUrl: string }[]
  cards: CardItem[]
}
