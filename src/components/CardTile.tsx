import { useEffect, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import type { CardGroup } from '../lib/groupCards'

type CardTileProps = {
  group: CardGroup
  isOwned: (cardId: string) => boolean
  onToggle: (cardId: string) => void
}

type VariantColor = 'red' | 'green' | 'neutral'

type PreviewFrame = {
  url: string
  label: string
}

const PREVIEW_INTERVAL_MS = 1800

function stickerTilt(id: string): number {
  const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (hash % 9) - 4
}

function variantColorClass(variant?: string): VariantColor {
  const normalized = variant?.trim().toLowerCase() ?? ''
  if (normalized.startsWith('red')) return 'red'
  if (normalized.startsWith('green')) return 'green'
  return 'neutral'
}

function buildPreviewFrames(group: CardGroup): PreviewFrame[] {
  const frames: PreviewFrame[] = []
  for (const card of group.cards) {
    if (card.imageUrl) {
      frames.push({ url: card.imageUrl, label: card.variant ?? 'Front' })
    }
  }
  if (group.backImageUrl) {
    frames.push({ url: group.backImageUrl, label: 'Back' })
  }
  return frames
}

export function CardTile({ group, isOwned, onToggle }: CardTileProps) {
  const ownedCards = group.cards.filter((card) => isOwned(card.id))
  const fullyOwned = ownedCards.length === group.cards.length
  const hasVariants = group.cards.length > 1
  const partialColor =
    hasVariants && !fullyOwned && ownedCards.length > 0 ? variantColorClass(ownedCards[0].variant) : null

  const previewFrames = buildPreviewFrames(group)
  const canPreview = previewFrames.length > 1
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(intervalRef.current), [])

  function startPreview() {
    if (!canPreview) return
    setPreviewIndex(0)
    intervalRef.current = window.setInterval(() => {
      setPreviewIndex((prev) => ((prev ?? 0) + 1) % previewFrames.length)
    }, PREVIEW_INTERVAL_MS)
  }

  function stopPreview() {
    window.clearInterval(intervalRef.current)
    setPreviewIndex(null)
  }

  const activeFrame = previewIndex !== null ? previewFrames[previewIndex] : null
  const displayImageUrl = activeFrame?.url ?? group.imageUrl

  const [isLandscape, setIsLandscape] = useState(false)
  useEffect(() => setIsLandscape(false), [displayImageUrl])

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget
    // Scans are rarely pixel-perfect square, so require a real margin before
    // treating an image as landscape - otherwise near-square photos (off by a
    // few px from compression/cropping) get needlessly letterboxed instead of
    // filling the tile like every other card.
    if (img.naturalWidth > img.naturalHeight * 1.15) setIsLandscape(true)
  }

  const sticker = fullyOwned && (
    <span
      className="card-tile-sticker"
      style={{ transform: `rotate(${stickerTilt(group.key)}deg)` }}
      aria-hidden="true"
    >
      &#10003;
    </span>
  )

  const pocket = (
    <div
      className={[
        'card-tile-pocket',
        partialColor && `card-tile-pocket-partial-${partialColor}`,
        isLandscape && 'card-tile-pocket-landscape',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {displayImageUrl && (
        <img
          src={displayImageUrl}
          alt={group.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
        />
      )}
      {!displayImageUrl && (
        <div className="card-tile-placeholder-plate" aria-hidden="true">
          <span className="card-tile-placeholder-number">{group.number}</span>
          <span className="card-tile-placeholder-label">No signal</span>
        </div>
      )}
      <span className="card-tile-corner card-tile-corner-tl" aria-hidden="true" />
      <span className="card-tile-corner card-tile-corner-tr" aria-hidden="true" />
      <span className="card-tile-corner card-tile-corner-bl" aria-hidden="true" />
      <span className="card-tile-corner card-tile-corner-br" aria-hidden="true" />
      {activeFrame && <span className="card-tile-preview-label">{activeFrame.label}</span>}
    </div>
  )

  const info = (
    <div className="card-tile-info">
      <span className="card-tile-number">#{group.number}</span>
      <span className="card-tile-name">{group.name}</span>
    </div>
  )

  if (!hasVariants) {
    const card = group.cards[0]
    return (
      <label
        className={`card-tile ${fullyOwned ? 'card-tile-owned' : ''}`}
        onMouseEnter={startPreview}
        onMouseLeave={stopPreview}
      >
        <input
          type="checkbox"
          className="card-tile-checkbox"
          checked={fullyOwned}
          onChange={() => onToggle(card.id)}
        />
        {sticker}
        {pocket}
        {info}
      </label>
    )
  }

  return (
    <div
      className={`card-tile ${fullyOwned ? 'card-tile-owned' : ''}`}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      {sticker}
      {pocket}
      {info}
      <div className="variant-chip-row">
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
