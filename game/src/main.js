// Ashfall Pact — boot and the one loop: input every frame, the renderer
// paints what is there. Screens: title, play, win, loss.
// ?seed=N fixes the shuffle. ?shot=title|table|win|loss (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { createRandom } from './random.js';
import { createGame, startGame, canPlayCard, playCard, castSpell, attack, endPlayerTurn, startFoeTurn, startPlayerTurn } from './state.js';
import { aiTakeTurn } from './ai.js';
import { createRenderer, computeLayout } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const renderer = createRenderer(canvas);
const audio = createAudio();

function inside(x, y, r) {
  return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

let game;
let prevScreen = 'title';

function freshGame() {
  game = createGame(createRandom(Math.floor(Math.random() * 4294967296)));
  prevScreen = game.screen;
}

function runShot(name) {
  game = stageShot(name, createRandom(seed));
  prevScreen = game.screen;
  let painted = 0;
  function paint() {
    renderer.draw(game);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function endTurn() {
  if (!endPlayerTurn(game)) return;
  audio.click();
  window.setTimeout(() => {
    if (game.screen !== 'play') return;
    startFoeTurn(game);
    aiTakeTurn(game);
    if (game.screen === 'play') startPlayerTurn(game);
  }, 900);
}

function onClick(x, y) {
  if (game.screen === 'title') {
    audio.click();
    startGame(game, createRandom(Math.floor(Math.random() * 4294967296)));
    return;
  }
  if (game.screen === 'win' || game.screen === 'loss') {
    audio.click();
    freshGame();
    return;
  }
  if (game.screen !== 'play' || game.phase !== 'player') return;
  const layout = computeLayout(game);
  const p = game.player;
  const f = game.foe;

  if (inside(x, y, layout.endTurn)) {
    endTurn();
    return;
  }

  // A spell is waiting for its target.
  if (game.spellTarget) {
    const handIndex = game.spellTarget.index;
    for (let i = 0; i < f.board.length; i += 1) {
      if (inside(x, y, layout.foeBoard[i])) {
        if (castSpell(game, 'player', handIndex, { kind: 'minion', who: 'foe', index: i })) audio.playCard();
        game.spellTarget = null;
        game.selected = null;
        return;
      }
    }
    if (inside(x, y, layout.foeFace)) {
      if (castSpell(game, 'player', handIndex, { kind: 'face', who: 'foe' })) audio.playCard();
      game.spellTarget = null;
      game.selected = null;
      return;
    }
    game.spellTarget = null;
    game.selected = null;
    return;
  }

  // A minion is waiting for its target.
  if (game.selected && game.selected.type === 'board') {
    const bi = game.selected.index;
    for (let i = 0; i < f.board.length; i += 1) {
      if (inside(x, y, layout.foeBoard[i])) {
        if (attack(game, 'player', bi, { kind: 'minion', who: 'foe', index: i })) audio.attack();
        game.selected = null;
        return;
      }
    }
    if (inside(x, y, layout.foeFace)) {
      if (attack(game, 'player', bi, { kind: 'face', who: 'foe' })) audio.attack();
      game.selected = null;
      return;
    }
    for (let i = 0; i < p.board.length; i += 1) {
      if (inside(x, y, layout.playerBoard[i])) {
        game.selected = p.board[i].canAttack ? { type: 'board', index: i } : null;
        return;
      }
    }
    game.selected = null;
    return;
  }

  // A card in hand.
  for (let i = 0; i < p.hand.length; i += 1) {
    if (!inside(x, y, layout.hand[i])) continue;
    const card = p.hand[i];
    if (!canPlayCard(game, 'player', i)) return;
    if (card.kind === 'minion') {
      if (playCard(game, 'player', i)) audio.playCard();
    } else if (card.target === 'any') {
      game.selected = { type: 'hand', index: i };
      game.spellTarget = { index: i };
      audio.click();
    } else {
      if (playCard(game, 'player', i)) {
        if (card.heal) audio.heal();
        else audio.playCard();
      }
    }
    return;
  }

  // One of your minions, ready to attack.
  for (let i = 0; i < p.board.length; i += 1) {
    if (inside(x, y, layout.playerBoard[i]) && p.board[i].canAttack) {
      game.selected = { type: 'board', index: i };
      audio.click();
      return;
    }
  }
}

function onHover(x, y) {
  if (!game || game.screen !== 'play' || !game.player) {
    if (game) game.hoverHand = -1;
    return;
  }
  const layout = computeLayout(game);
  game.hoverHand = -1;
  for (let i = 0; i < layout.hand.length; i += 1) {
    if (inside(x, y, layout.hand[i])) game.hoverHand = i;
  }
}

function onConfirm() {
  if (game.screen === 'title') {
    audio.click();
    startGame(game, createRandom(Math.floor(Math.random() * 4294967296)));
  } else if (game.screen === 'win' || game.screen === 'loss') {
    audio.click();
    freshGame();
  } else if (game.screen === 'play' && game.phase === 'player') {
    endTurn();
  }
}

function onCancel() {
  if (game) {
    game.selected = null;
    game.spellTarget = null;
  }
}

if (shot) {
  runShot(shot);
} else {
  freshGame();
  createInput(canvas, {
    onClick,
    onHover,
    onConfirm,
    onCancel,
    onMute: () => audio.toggleMute(),
  });
  (function loop() {
    if (game.screen === 'win' && prevScreen !== 'win') audio.win();
    if (game.screen === 'loss' && prevScreen !== 'loss') audio.lose();
    prevScreen = game.screen;
    renderer.draw(game);
    requestAnimationFrame(loop);
  })();
}
