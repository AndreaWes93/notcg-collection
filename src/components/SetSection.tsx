import { useMemo, useState } from 'react'
import { useOwnedCards } from '../hooks/useOwnedCards'
import { Gauge } from './Gauge'
import { CardTile } from './CardTile'
import { SignalDot, channelColorForId } from './SignalDot'
import { groupCards } from '../lib/groupCards'
import type { CardItem, CardSet } from '../types'

type Filter = 'all' | 'owned' | 'missing'

// Manufacturers whose physical stickers are square, so their tiles should use a 1:1 pocket instead of the default 3:4 one.
const SQUARE_COLLECTIONS = ['amada-stickers', 'ensky-stickers', 'meiji-stickers', 'topsun-stickers']

type SetSectionProps = {
  set: CardSet
}

function partitionBySection(cards: CardItem[]) {
  const bySection = new Map<string, CardItem[]>()
  const order: string[] = []
  for (const card of cards) {
    const key = card.section ?? ''
    if (!bySection.has(key)) {
      bySection.set(key, [])
      order.push(key)
    }
    bySection.get(key)!.push(card)
  }
  return order.map((key) => ({ key, cards: bySection.get(key)! }))
}

export function SetSection({ set }: SetSectionProps) {
  const { isOwned, toggleOwned, setManyOwned, countOwned } = useOwnedCards()
  const [filter, setFilter] = useState<Filter>('all')

  const sections = useMemo(() => partitionBySection(set.cards), [set])
  const showSectionLabels = sections.length > 1

  const visibleSections = useMemo(
    () =>
      sections.map((section) => {
        const groups = groupCards(section.cards)
        const visibleGroups =
          filter === 'owned'
            ? groups.filter((group) => group.cards.some((card) => isOwned(card.id)))
            : filter === 'missing'
              ? groups.filter((group) => group.cards.every((card) => !isOwned(card.id)))
              : groups
        return { ...section, visibleGroups }
      }),
    [sections, filter, isOwned],
  )

  const cardIds = set.cards.map((card) => card.id)
  const owned = countOwned(cardIds)
  const allOwned = owned === cardIds.length
  const square = set.square ?? (set.collectionId !== undefined && SQUARE_COLLECTIONS.includes(set.collectionId))

  function toggleAllOwned() {
    setManyOwned(cardIds, !allOwned)
  }

  return (
    <section id={set.id} className="set-section">
      <div className="binder-page-header">
        <h2>
          <SignalDot color={channelColorForId(set.id)} />
          <span className="panel-header-name">{set.name}</span>
        </h2>
        {set.description && <p className="set-detail-description">{set.description}</p>}
        {set.referenceImages && set.referenceImages.length > 0 && (
          <div className="reference-row">
            {set.referenceImages.map((ref) => (
              <div key={ref.label} className="reference-item">
                <img src={ref.imageUrl} alt={ref.label} loading="lazy" referrerPolicy="no-referrer" />
                <span className="reference-label">{ref.label}</span>
              </div>
            ))}
          </div>
        )}
        <Gauge current={owned} total={set.cards.length} />
      </div>

      <div className="filter-bar">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={filter === 'owned' ? 'active' : ''} onClick={() => setFilter('owned')}>
          Logged
        </button>
        <button className={filter === 'missing' ? 'active' : ''} onClick={() => setFilter('missing')}>
          Missing
        </button>
        <button className="mark-complete-btn" onClick={toggleAllOwned}>
          {allOwned ? 'Clear set' : 'Mark set complete'}
        </button>
      </div>

      {visibleSections.map((section) => (
        <div key={section.key} className="set-subsection">
          {showSectionLabels && section.key && <h3 className="set-subsection-heading">{section.key}</h3>}
          <div className="card-grid">
            {section.visibleGroups.map((group) => (
              <CardTile key={group.key} group={group} isOwned={isOwned} onToggle={toggleOwned} square={square} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
