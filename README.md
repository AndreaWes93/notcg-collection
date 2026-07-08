# Pokémon No-TCG Collection

Web app for tracking your collection of Pokémon cards from "No TCG" sets (promotional, non-playable, collectible lines outside the classic trading card game).

## Development

```bash
npm install
npm run dev
```

## Adding a new set

Edit `src/data/sets.ts` and add an object to the end of the `sets` array:

```ts
{
  id: 'unique-set-id',
  name: 'Set name',
  year: 2023,
  description: 'Short set description',
  cards: [
    { id: 'unique-set-id-01', setId: 'unique-set-id', number: '01', name: 'Card name', imageUrl: 'https://...' },
    // ...
  ],
}
```

That's it: the set list and each set's checklist update automatically. The "owned/missing" state of each card is saved in the browser's `localStorage`.
