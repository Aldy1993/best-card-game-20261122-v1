// Ashfall Pact — the duel's rules and state, with no drawing and no browser.
// Two spark-smiths at 30 life. Mana grows 1 per turn to 10, you draw one
// card each turn, minions fight on the board, spells strike a target. The
// first smith to 0 life loses. Element advantage (Flame > Gale > Stone >
// Tide > Flame) adds +2 damage against a weaker element.
import { START_LIFE, MAX_MANA, MAX_HAND, MAX_BOARD, OPENING_HAND, hasAdvantage } from './config.js';
import { buildDeck } from './cards.js';

export function createGame(random) {
  const game = {
    screen: 'title',
    turn: 1,
    phase: 'player',
    player: null,
    foe: null,
    log: [],
    selected: null,
    spellTarget: null,
    winner: null,
    turnsTaken: 0,
    message: '',
  };
  startGame(game, random);
  return game;
}

function makeSide(random) {
  return {
    life: START_LIFE,
    mana: 0,
    maxMana: 0,
    deck: buildDeck(random),
    hand: [],
    board: [],
    fatigue: 0,
  };
}

export function startGame(game, random) {
  game.screen = 'play';
  game.turn = 1;
  game.phase = 'player';
  game.player = makeSide(random);
  game.foe = makeSide(random);
  game.log = ['The pact is sealed. Ember Smith, you go first.'];
  game.selected = null;
  game.spellTarget = null;
  game.winner = null;
  game.turnsTaken = 0;
  game.message = '';
  for (let i = 0; i < OPENING_HAND; i += 1) {
    drawCard(game, 'player');
    drawCard(game, 'foe');
  }
  beginTurn(game, 'player');
}

export function drawCard(game, who) {
  const side = game[who];
  if (side.deck.length === 0) {
    side.fatigue += 1;
    side.life -= side.fatigue;
    log(game, `${who === 'player' ? 'You' : 'Cinder Witch'} take ${side.fatigue} fatigue damage (empty deck).`);
    checkEnd(game);
    return null;
  }
  const card = side.deck.pop();
  if (side.hand.length >= MAX_HAND) {
    log(game, `${who === 'player' ? 'Your' : 'Her'} hand is full — ${card.name} burns away.`);
    return null;
  }
  side.hand.push(card);
  return card;
}

export function beginTurn(game, who) {
  const side = game[who];
  game.phase = who;
  side.maxMana = Math.min(MAX_MANA, who === 'player' ? game.turn : game.turn);
  side.mana = side.maxMana;
  for (const m of side.board) m.canAttack = true;
  drawCard(game, who);
  if (who === 'player') game.turnsTaken += 1;
}

export function endPlayerTurn(game) {
  if (game.screen !== 'play' || game.phase !== 'player') return false;
  game.selected = null;
  game.spellTarget = null;
  log(game, 'You end your turn.');
  return true;
}

export function startFoeTurn(game) {
  game.phase = 'ai';
  beginTurn(game, 'foe');
}

export function startPlayerTurn(game) {
  game.turn += 1;
  beginTurn(game, 'player');
}

function log(game, text) {
  game.log.push(text);
  if (game.log.length > 5) game.log.shift();
}

function checkEnd(game) {
  if (game.player.life <= 0 && game.foe.life <= 0) {
    game.winner = 'draw';
    game.screen = 'loss';
    log(game, 'Both smiths fall. The pact ends in ash.');
  } else if (game.foe.life <= 0) {
    game.winner = 'player';
    game.screen = 'win';
    log(game, 'The Cinder Witch falls. The pact is yours!');
  } else if (game.player.life <= 0) {
    game.winner = 'foe';
    game.screen = 'loss';
    log(game, 'Your embers fade. The Cinder Witch takes the pact.');
  }
}

function sideName(who) {
  return who === 'player' ? 'You' : 'Cinder Witch';
}

export function canPlayCard(game, who, handIndex) {
  const side = game[who];
  const card = side.hand[handIndex];
  if (!card) return false;
  if (card.cost > side.mana) return false;
  if (card.kind === 'minion' && side.board.length >= MAX_BOARD) return false;
  return true;
}

// Plays a minion, or a spell that needs no target. Targeted spells go
// through castSpell instead. Returns true when the card left the hand.
export function playCard(game, who, handIndex) {
  const side = game[who];
  const card = side.hand[handIndex];
  if (!card || !canPlayCard(game, who, handIndex)) return false;
  if (card.kind === 'spell' && (card.target === 'any')) return false;
  side.mana -= card.cost;
  side.hand.splice(handIndex, 1);
  if (card.kind === 'minion') {
    side.board.push({ ...card, health: card.health, maxHealth: card.health, canAttack: false });
    log(game, `${sideName(who)} summon${who === 'player' ? '' : 's'} ${card.name} (${card.attack}/${card.health}).`);
  } else {
    resolveSpell(game, who, card, null);
  }
  checkEnd(game);
  return true;
}

// target: { kind: 'face', who } | { kind: 'minion', who, index } | null
export function castSpell(game, who, handIndex, target) {
  const side = game[who];
  const card = side.hand[handIndex];
  if (!card || card.kind !== 'spell' || !canPlayCard(game, who, handIndex)) return false;
  if (card.target === 'any' && !target) return false;
  if (card.target === 'any' && target.kind === 'minion') {
    const foeSide = game[target.who];
    if (!foeSide.board[target.index]) return false;
  }
  side.mana -= card.cost;
  side.hand.splice(handIndex, 1);
  resolveSpell(game, who, card, target);
  checkEnd(game);
  return true;
}

function damageBonus(attackerElement, defenderElement) {
  return defenderElement && hasAdvantage(attackerElement, defenderElement) ? 2 : 0;
}

function resolveSpell(game, who, card, target) {
  const me = game[who];
  const foe = game[who === 'player' ? 'foe' : 'player'];
  if (card.target === 'self') {
    if (card.heal) {
      me.life = Math.min(START_LIFE, me.life + card.heal);
      log(game, `${sideName(who)} restore${who === 'player' ? '' : 's'} ${card.heal} life with ${card.name}.`);
    }
    if (card.draw) drawCard(game, who);
    return;
  }
  if (card.target === 'all-enemy') {
    const dead = [];
    for (const m of foe.board) {
      m.health -= card.damage;
      if (m.health <= 0) dead.push(m.name);
    }
    foe.board = foe.board.filter((m) => m.health > 0);
    log(game, `${card.name} hits every enemy minion for ${card.damage}${dead.length ? ` — ${dead.join(', ')} shatter${dead.length > 1 ? '' : 's'}` : ''}.`);
    return;
  }
  // target 'any'
  if (target.kind === 'face') {
    const victim = game[target.who];
    victim.life -= card.damage;
    log(game, `${card.name} strikes ${target.who === 'player' ? 'you' : 'the Cinder Witch'} for ${card.damage}.`);
    if (card.draw) drawCard(game, who);
    return;
  }
  const victim = game[target.who].board[target.index];
  const bonus = damageBonus(card.element, victim.element);
  victim.health -= card.damage + bonus;
  log(game, `${card.name} hits ${victim.name} for ${card.damage + bonus}${bonus ? ' (element advantage!)' : ''}.`);
  if (victim.health <= 0) {
    game[target.who].board.splice(target.index, 1);
    log(game, `${victim.name} shatters.`);
  }
  if (card.draw) drawCard(game, who);
}

export function canAttackWith(game, who, boardIndex) {
  const side = game[who];
  const m = side.board[boardIndex];
  return !!m && m.canAttack && game.phase === (who === 'player' ? 'player' : 'ai');
}

export function attack(game, who, boardIndex, target) {
  const side = game[who];
  const foe = game[who === 'player' ? 'foe' : 'player'];
  const attacker = side.board[boardIndex];
  if (!attacker || !attacker.canAttack) return false;
  attacker.canAttack = false;
  if (target.kind === 'face') {
    foe.life -= attacker.attack;
    log(game, `${attacker.name} strikes ${who === 'player' ? 'the Cinder Witch' : 'you'} for ${attacker.attack}.`);
    checkEnd(game);
    return true;
  }
  const defender = foe.board[target.index];
  if (!defender) return false;
  const bonus = damageBonus(attacker.element, defender.element);
  const back = damageBonus(defender.element, attacker.element);
  defender.health -= attacker.attack + bonus;
  attacker.health -= defender.attack + back;
  log(game, `${attacker.name} hits ${defender.name} for ${attacker.attack + bonus}${bonus ? ' (advantage!)' : ''}; ${defender.name} hits back for ${defender.attack + back}${back ? ' (advantage!)' : ''}.`);
  if (defender.health <= 0) {
    foe.board.splice(target.index, 1);
    log(game, `${defender.name} shatters.`);
  }
  if (attacker.health <= 0) {
    side.board.splice(boardIndex, 1);
    log(game, `${attacker.name} shatters.`);
  }
  checkEnd(game);
  return true;
}
