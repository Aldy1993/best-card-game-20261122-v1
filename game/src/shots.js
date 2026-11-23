// Ashfall Pact — staged scenes for screenshots: ?shot=title|table|win|loss
// (with &seed=N). Each stages a fixed, readable state and paints it, so a
// screenshot is a real render of the game's own code.
import { createGame } from './state.js';
import { makeCard } from './cards.js';

function minion(id, uid, canAttack = true) {
  const c = makeCard(id, uid);
  return { ...c, health: c.health, maxHealth: c.health, canAttack };
}

function stageTable(game) {
  game.screen = 'play';
  game.phase = 'player';
  game.turn = 6;
  game.player.life = 24;
  game.player.mana = 6;
  game.player.maxMana = 6;
  game.player.deck = Array.from({ length: 18 }, (_, i) => makeCard('ember-imp', `d${i}`));
  game.player.hand = [
    makeCard('fireball', 'h1'), makeCard('flame-knight', 'h2'), makeCard('storm-crow', 'h3'),
    makeCard('mend-stone', 'h4'), makeCard('tempest-roc', 'h5'),
  ];
  game.player.board = [
    minion('cinder-wolf', 'b1'), minion('stone-turtle', 'b2'), minion('coral-serpent', 'b3', false),
  ];
  game.foe.life = 18;
  game.foe.mana = 6;
  game.foe.maxMana = 6;
  game.foe.deck = Array.from({ length: 20 }, (_, i) => makeCard('gale-sprite', `e${i}`));
  game.foe.hand = [makeCard('ember-imp', 'f1'), makeCard('gust', 'f2'), makeCard('pebble-golem', 'f3'), makeCard('quake', 'f4')];
  game.foe.board = [minion('wind-dancer', 'g1'), minion('granite-giant', 'g2', false)];
  game.log = [
    'Cinder Wolf strikes the Cinder Witch for 3.',
    'The Cinder Witch summons Wind Dancer (3/4).',
    'You summon Coral Serpent (3/3).',
    'Flame Knight is ready in your hand.',
  ];
  game.selected = { type: 'hand', index: 1 };
  game.spellTarget = null;
}

export function stageShot(name, random) {
  const game = createGame(random);
  if (name === 'title') {
    game.screen = 'title';
  } else if (name === 'table') {
    stageTable(game);
  } else if (name === 'win') {
    stageTable(game);
    game.foe.life = 0;
    game.screen = 'win';
    game.winner = 'player';
    game.turnsTaken = 9;
    game.player.life = 12;
  } else if (name === 'loss') {
    stageTable(game);
    game.player.life = 0;
    game.screen = 'loss';
    game.winner = 'foe';
  } else {
    game.screen = 'title';
  }
  return game;
}
