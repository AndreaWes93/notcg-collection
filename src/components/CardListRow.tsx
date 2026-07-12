import type { CardGroup } from '../lib/groupCards'

type CardListRowProps = {
  group: CardGroup
  isOwned: (cardId: string) => boolean
  onToggle: (cardId: string) => void
}

type VariantColor = 'red' | 'green' | 'neutral'

function variantColorClass(variant?: string): VariantColor {
  const normalized = variant?.trim().toLowerCase() ?? ''
  if (normalized.startsWith('red')) return 'red'
  if (normalized.startsWith('green')) return 'green'
  return 'neutral'
}

export function CardListRow({ group, isOwned, onToggle }: CardListRowProps) {
  const ownedCards = group.cards.filter((card) => isOwned(card.id))
  const fullyOwned = ownedCards.length === group.cards.length
  const hasVariants = group.cards.length > 1

  const thumb = (
    <div className="card-list-thumb">
      {group.imageUrl ? (
        <img src={group.imageUrl} alt={group.name} loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span className="card-list-thumb-number">{group.number}</span>
      )}
    </div>
  )

  const details = (
    <div className="card-list-details">
      <span className="card-list-number">#{group.number}</span>
      <span className="card-list-name">{group.name}</span>
      {group.notes && <span className="card-list-notes">{group.notes}</span>}
    </div>
  )

  if (!hasVariants) {
    const card = group.cards[0]
    return (
      <label className={`card-list-row ${fullyOwned ? 'card-list-row-owned' : ''}`}>
        <input
          type="checkbox"
          className="card-tile-checkbox"
          checked={fullyOwned}
          onChange={() => onToggle(card.id)}
        />
        {thumb}
        {details}
        <span className="card-list-check" aria-hidden="true">
          {fullyOwned ? '✓' : ''}
        </span>
      </label>
    )
  }

  return (
    <div className={`card-list-row ${fullyOwned ? 'card-list-row-owned' : ''}`}>
      {thumb}
      {details}
      <div className="card-list-variant-row">
        {group.cards.map((card) => {
          const color = variantColorClass(card.variant)
          return (
            <label key={card.id} className={`variant-chip variant-chip-${color}`}>
              <input type="checkbox" checked={isOwned(card.id)} onChange={() => onToggle(card.id)} />
              <span className="variant-chip-label" title={card.variant}>
                {card.variant ? card.variant.charAt(0).toUpperCase() : '?'}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
