import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sets, collectionLogos, collectionKind } from '../data/sets'
import { useOwnedCards } from '../hooks/useOwnedCards'
import { Gauge } from '../components/Gauge'
import { SignalDot, channelColorForId } from '../components/SignalDot'
import { yearRangeLabel } from '../lib/yearRange'
import { getOrderedCollectionChildren, sortByYear } from '../lib/collectionOrder'
import type { ChildEntry } from '../lib/collectionOrder'
import type { CardSet } from '../types'

const SECTION_LABELS: Record<'cards' | 'stickers', string> = {
  cards: 'Cards',
  stickers: 'Stickers',
}

type IndexEntry =
  | { type: 'set'; set: CardSet }
  | { type: 'collection'; collectionId: string; collectionName: string; children: ChildEntry[] }

function buildIndexEntries(allSets: CardSet[]): IndexEntry[] {
  const entries: IndexEntry[] = []
  const seenCollections = new Set<string>()

  for (const set of allSets) {
    if (!set.collectionId) {
      entries.push({ type: 'set', set })
      continue
    }
    if (seenCollections.has(set.collectionId)) continue
    seenCollections.add(set.collectionId)

    entries.push({
      type: 'collection',
      collectionId: set.collectionId,
      collectionName: set.collectionName ?? set.collectionId,
      children: getOrderedCollectionChildren(set.collectionId),
    })
  }

  return entries
}

function totalsFor(setList: CardSet[], countOwned: (cardIds: string[]) => number) {
  const totalCards = setList.reduce((sum, set) => sum + set.cards.length, 0)
  const totalOwned = setList.reduce((sum, set) => sum + countOwned(set.cards.map((card) => card.id)), 0)
  return { totalCards, totalOwned }
}

function flattenSets(children: ChildEntry[]): CardSet[] {
  return children.flatMap((child) => (child.type === 'set' ? [child.set] : child.sets))
}

function earliestYear(entry: IndexEntry): number {
  const setList = entry.type === 'set' ? [entry.set] : flattenSets(entry.children)
  const years = setList.map((set) => set.year).filter((year): year is number => year !== undefined)
  return years.length > 0 ? Math.min(...years) : Infinity
}

type RowContentProps = {
  channelId: string
  name: string
  year?: number | string
  description?: string
  current: number
  total: number
  logoUrl?: string
}

function RowContent({ channelId, name, year, description, current, total, logoUrl }: RowContentProps) {
  return (
    <>
      <div className="panel-id">
        <SignalDot color={channelColorForId(channelId)} />
        <span className="panel-id-name">{name}</span>
        {logoUrl && <img src={logoUrl} alt="" className="panel-logo" loading="lazy" referrerPolicy="no-referrer" />}
      </div>
      <div className="panel-body">
        <div className="panel-heading">
          {year && <span className="panel-year">{year}</span>}
          {description && <p className="panel-description">{description}</p>}
        </div>
        <Gauge current={current} total={total} />
      </div>
    </>
  )
}

type SetRowProps = {
  set: CardSet
  countOwned: (cardIds: string[]) => number
}

function SetRow({ set, countOwned }: SetRowProps) {
  const cardIds = set.cards.map((card) => card.id)
  const owned = countOwned(cardIds)
  const linkTo = set.seriesId ? `/series/${set.seriesId}#${set.id}` : `/sets/${set.id}`

  return (
    <Link to={linkTo} className="panel-row">
      <RowContent
        channelId={set.id}
        name={set.name}
        year={set.year}
        description={set.description}
        current={owned}
        total={set.cards.length}
      />
    </Link>
  )
}

type GroupRowProps = {
  id: string
  name: string
  year?: string
  description?: string
  current: number
  total: number
  isExpanded: boolean
  onToggle: () => void
  logoUrl?: string
}

function GroupRow({ id, name, year, description, current, total, isExpanded, onToggle, logoUrl }: GroupRowProps) {
  return (
    <button
      type="button"
      className={`panel-row panel-row-toggle ${isExpanded ? 'panel-row-toggle-expanded' : ''}`}
      onClick={onToggle}
      aria-expanded={isExpanded}
    >
      <RowContent
        channelId={id}
        name={name}
        year={year}
        description={description}
        current={current}
        total={total}
        logoUrl={logoUrl}
      />
      <span className={`panel-chevron ${isExpanded ? 'panel-chevron-open' : ''}`} aria-hidden="true">
        &#9662;
      </span>
    </button>
  )
}

export function SetsListPage() {
  const { countOwned } = useOwnedCards()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (sets.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M8 8 L20 8 M8 8 L8 20" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M56 8 L44 8 M56 8 L56 20" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M8 56 L20 56 M8 56 L8 44" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M56 56 L44 56 M56 56 L56 44" stroke="currentColor" strokeWidth="3" fill="none" />
          <circle cx="32" cy="32" r="3" fill="currentColor" />
        </svg>
        <h2>No data logged</h2>
        <p>
          &gt; Add a set in <code>src/data/sets.ts</code> to start logging cards
        </p>
      </div>
    )
  }

  const entries = buildIndexEntries(sets)

  function toggle(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function kindOf(entry: IndexEntry): 'cards' | 'stickers' {
    const id = entry.type === 'collection' ? entry.collectionId : entry.set.collectionId
    return (id ? collectionKind[id] : undefined) ?? 'cards'
  }

  function renderEntry(entry: IndexEntry) {
    if (entry.type === 'set') {
      return <SetRow key={entry.set.id} set={entry.set} countOwned={countOwned} />
    }

    const collectionSets = flattenSets(entry.children)
    const { totalCards, totalOwned } = totalsFor(collectionSets, countOwned)
    const isExpanded = Boolean(expanded[entry.collectionId])

    return (
      <div key={entry.collectionId} className="panel-group">
        <GroupRow
          id={entry.collectionId}
          name={entry.collectionName}
          year={yearRangeLabel(collectionSets)}
          current={totalOwned}
          total={totalCards}
          isExpanded={isExpanded}
          onToggle={() => toggle(entry.collectionId)}
          logoUrl={collectionLogos[entry.collectionId]}
        />
        {isExpanded && (
          <div className="panel-nest">
            {entry.children.map((child) => {
              if (child.type === 'set') {
                return <SetRow key={child.set.id} set={child.set} countOwned={countOwned} />
              }

              const seriesTotals = totalsFor(child.sets, countOwned)
              const seriesExpanded = Boolean(expanded[child.seriesId])
              const seriesSets = sortByYear(
                child.sets,
                (set) => set.year ?? Infinity,
                (set) => set.name,
              )

              return (
                <div key={child.seriesId} className="panel-group">
                  <GroupRow
                    id={child.seriesId}
                    name={child.seriesName}
                    year={yearRangeLabel(child.sets)}
                    description={child.seriesDescription}
                    current={seriesTotals.totalOwned}
                    total={seriesTotals.totalCards}
                    isExpanded={seriesExpanded}
                    onToggle={() => toggle(child.seriesId)}
                  />
                  {seriesExpanded && (
                    <div className="panel-nest">
                      {seriesSets.map((set) => (
                        <SetRow key={set.id} set={set} countOwned={countOwned} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const sections: Array<'cards' | 'stickers'> = ['cards', 'stickers']

  return (
    <div className="binder-sections">
      {sections.map((kind) => {
        const kindEntries = entries
          .filter((entry) => kindOf(entry) === kind)
          .sort((a, b) => earliestYear(a) - earliestYear(b))
        if (kindEntries.length === 0) return null

        return (
          <section key={kind} className="binder-section">
            <h2 className="binder-section-title">{SECTION_LABELS[kind]}</h2>
            <div className="binder-index">{kindEntries.map(renderEntry)}</div>
          </section>
        )
      })}
    </div>
  )
}
