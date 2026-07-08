import type { CardItem } from '../types'

export type CardGroup = {
  key: string
  number: string
  name: string
  imageUrl?: string
  backImageUrl?: string
  cards: CardItem[]
}

export function groupCards(cards: CardItem[]): CardGroup[] {
  const groups = new Map<string, CardGroup>()
  const order: string[] = []

  for (const card of cards) {
    const key = card.group ?? card.id
    let group = groups.get(key)
    if (!group) {
      group = { key, number: card.number, name: card.name, imageUrl: card.imageUrl, cards: [] }
      groups.set(key, group)
      order.push(key)
    }
    if (!group.imageUrl && card.imageUrl) {
      group.imageUrl = card.imageUrl
    }
    if (!group.backImageUrl && card.backImageUrl) {
      group.backImageUrl = card.backImageUrl
    }
    group.cards.push(card)
  }

  return order.map((groupKey) => groups.get(groupKey)!)
}
