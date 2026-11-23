// Ashfall Pact — the card pool and the 30-card deck.
// Every card is original: Ember Smiths and the Cinder Witch duel with
// sparks, wind, stone and tide. Minions fight on the board; spells hit
// a target, the whole enemy board, or heal their caster.
import { shuffle } from './random.js';

export const CARD_DEFS = [
  { id: 'ember-imp', name: 'Ember Imp', element: 'flame', cost: 1, kind: 'minion', attack: 2, health: 1 },
  { id: 'cinder-wolf', name: 'Cinder Wolf', element: 'flame', cost: 2, kind: 'minion', attack: 3, health: 2 },
  { id: 'flame-knight', name: 'Flame Knight', element: 'flame', cost: 3, kind: 'minion', attack: 4, health: 3 },
  { id: 'phoenix-chick', name: 'Phoenix Chick', element: 'flame', cost: 4, kind: 'minion', attack: 5, health: 4 },
  { id: 'gale-sprite', name: 'Gale Sprite', element: 'gale', cost: 1, kind: 'minion', attack: 1, health: 2 },
  { id: 'storm-crow', name: 'Storm Crow', element: 'gale', cost: 2, kind: 'minion', attack: 2, health: 3 },
  { id: 'wind-dancer', name: 'Wind Dancer', element: 'gale', cost: 3, kind: 'minion', attack: 3, health: 4 },
  { id: 'tempest-roc', name: 'Tempest Roc', element: 'gale', cost: 5, kind: 'minion', attack: 6, health: 5 },
  { id: 'pebble-golem', name: 'Pebble Golem', element: 'stone', cost: 1, kind: 'minion', attack: 1, health: 3 },
  { id: 'stone-turtle', name: 'Stone Turtle', element: 'stone', cost: 2, kind: 'minion', attack: 2, health: 4 },
  { id: 'granite-giant', name: 'Granite Giant', element: 'stone', cost: 4, kind: 'minion', attack: 4, health: 6 },
  { id: 'mountain-king', name: 'Mountain King', element: 'stone', cost: 6, kind: 'minion', attack: 7, health: 7 },
  { id: 'tide-wisp', name: 'Tide Wisp', element: 'tide', cost: 1, kind: 'minion', attack: 2, health: 2 },
  { id: 'coral-serpent', name: 'Coral Serpent', element: 'tide', cost: 2, kind: 'minion', attack: 3, health: 3 },
  { id: 'wave-caller', name: 'Wave Caller', element: 'tide', cost: 3, kind: 'minion', attack: 3, health: 5 },
  { id: 'deep-leviathan', name: 'Deep Leviathan', element: 'tide', cost: 5, kind: 'minion', attack: 5, health: 6 },
  { id: 'fireball', name: 'Fireball', element: 'flame', cost: 2, kind: 'spell', text: 'Deal 3 damage', damage: 3, target: 'any' },
  { id: 'inferno', name: 'Inferno', element: 'flame', cost: 5, kind: 'spell', text: 'Deal 6 damage', damage: 6, target: 'any' },
  { id: 'gust', name: 'Gust', element: 'gale', cost: 1, kind: 'spell', text: 'Deal 1 damage, draw a card', damage: 1, target: 'any', draw: 1 },
  { id: 'cyclone', name: 'Cyclone', element: 'gale', cost: 3, kind: 'spell', text: 'Deal 2 to all enemy minions', damage: 2, target: 'all-enemy' },
  { id: 'mend-stone', name: 'Mend Stone', element: 'stone', cost: 2, kind: 'spell', text: 'Restore 6 life', heal: 6, target: 'self' },
  { id: 'quake', name: 'Quake', element: 'stone', cost: 4, kind: 'spell', text: 'Deal 3 to all enemy minions', damage: 3, target: 'all-enemy' },
  { id: 'healing-tide', name: 'Healing Tide', element: 'tide', cost: 2, kind: 'spell', text: 'Restore 5 life, draw a card', heal: 5, target: 'self', draw: 1 },
  { id: 'tidal-wave', name: 'Tidal Wave', element: 'tide', cost: 4, kind: 'spell', text: 'Deal 4 damage', damage: 4, target: 'any' },
];

const BY_ID = new Map(CARD_DEFS.map((d) => [d.id, d]));

export function cardDef(id) {
  return BY_ID.get(id);
}

export function makeCard(id, uid) {
  const def = BY_ID.get(id);
  return { uid, ...def };
}

// Two copies of the cheap workhorses, one of the heavy finishers: 30 cards.
const DECK_LIST = [
  'ember-imp', 'ember-imp', 'cinder-wolf', 'cinder-wolf', 'flame-knight', 'flame-knight',
  'gale-sprite', 'gale-sprite', 'storm-crow', 'storm-crow', 'wind-dancer', 'wind-dancer',
  'pebble-golem', 'pebble-golem', 'stone-turtle', 'stone-turtle',
  'tide-wisp', 'tide-wisp', 'coral-serpent', 'coral-serpent',
  'fireball', 'fireball', 'gust', 'gust', 'mend-stone', 'mend-stone',
  'healing-tide', 'healing-tide', 'tempest-roc', 'granite-giant',
];

export function buildDeck(random) {
  const ids = shuffle(DECK_LIST.slice(), random);
  return ids.map((id, i) => makeCard(id, `c${i}`));
}
