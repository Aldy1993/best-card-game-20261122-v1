// Ashfall Pact — shared constants: canvas, elements, rules.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const START_LIFE = 30;
export const MAX_MANA = 10;
export const MAX_HAND = 10;
export const MAX_BOARD = 7;
export const OPENING_HAND = 3;
export const DECK_SIZE = 30;

// Element advantage cycle: flame beats gale, gale beats stone,
// stone beats tide, tide beats flame. Advantage adds +2 damage.
export const ELEMENTS = ['flame', 'gale', 'stone', 'tide'];
export const BEATS = { flame: 'gale', gale: 'stone', stone: 'tide', tide: 'flame' };
export const ELEMENT_COLOR = {
  flame: '#e25822',
  gale: '#4fc3f7',
  stone: '#b0a18a',
  tide: '#26a69a',
};
export const ELEMENT_DARK = {
  flame: '#7a2a08',
  gale: '#0d4d6b',
  stone: '#4d4438',
  tide: '#074f47',
};
export const ELEMENT_GLYPH = { flame: 'F', gale: 'G', stone: 'S', tide: 'T' };
export const ELEMENT_NAME = { flame: 'Flame', gale: 'Gale', stone: 'Stone', tide: 'Tide' };

export const PLAYER_NAME = 'Ember Smith';
export const FOE_NAME = 'Cinder Witch';

export function hasAdvantage(attackerElement, defenderElement) {
  return BEATS[attackerElement] === defenderElement;
}
