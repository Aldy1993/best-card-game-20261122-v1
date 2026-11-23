// Ashfall Pact — everything painted on one canvas: title, table, hands,
// boards, life and mana, the log, win and loss. All art is drawn here;
// no images are loaded. Layout is shared with input through computeLayout.
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, ELEMENT_COLOR, ELEMENT_DARK, ELEMENT_GLYPH,
  ELEMENT_NAME, BEATS, PLAYER_NAME, FOE_NAME, MAX_BOARD,
} from './config.js';

const CARD_W = 112;
const CARD_H = 152;
const MINI_W = 104;
const MINI_H = 112;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function handLayout(count, y, w, h, liftIndex, lift) {
  const gap = 8;
  const total = count * w + (count - 1) * gap;
  let x = (CANVAS_WIDTH - total) / 2;
  const rects = [];
  for (let i = 0; i < count; i += 1) {
    const raised = i === liftIndex ? lift : 0;
    rects.push({ x, y: y - raised, w, h });
    x += w + gap;
  }
  return rects;
}

function boardLayout(count, y, w, h) {
  const gap = 10;
  const total = count * w + (count - 1) * gap;
  let x = (CANVAS_WIDTH - total) / 2;
  const rects = [];
  for (let i = 0; i < count; i += 1) {
    rects.push({ x, y, w, h });
    x += w + gap;
  }
  return rects;
}

// Rects the mouse can hit, in the same coordinates the renderer paints.
export function computeLayout(game) {
  const p = game.player;
  const f = game.foe;
  const hover = game.hoverHand === undefined ? -1 : game.hoverHand;
  const layout = {
    hand: p ? handLayout(p.hand.length, 492, CARD_W, CARD_H, hover, 18) : [],
    playerBoard: p ? boardLayout(Math.max(p.board.length, 1), 356, MINI_W, MINI_H) : [],
    foeBoard: f ? boardLayout(Math.max(f.board.length, 1), 148, MINI_W, MINI_H) : [],
    foeFace: { x: 52, y: 8, w: 220, h: 52 },
    playerFace: { x: 52, y: 660, w: 220, h: 52 },
    endTurn: { x: 1060, y: 292, w: 168, h: 48 },
    titleButton: { x: 490, y: 480, w: 300, h: 64 },
    deck: { x: 1150, y: 660, w: 90, h: 52 },
  };
  return layout;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function background() {
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#1a0f0a');
    g.addColorStop(0.5, '#241812');
    g.addColorStop(1, '#160d08');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Ember glow dots, fixed places so screenshots are stable.
    ctx.fillStyle = 'rgba(226, 88, 34, 0.20)';
    const dots = [[90, 120], [1180, 90], [640, 60], [220, 700], [1080, 690], [40, 380], [1240, 380]];
    for (const [x, y] of dots) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function manaCrystals(x, y, mana, maxMana) {
    for (let i = 0; i < 10; i += 1) {
      ctx.beginPath();
      ctx.arc(x + i * 18, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = i < mana ? '#4fc3f7' : '#233038';
      ctx.fill();
      ctx.strokeStyle = '#0d4d6b';
      ctx.stroke();
    }
    ctx.fillStyle = '#cfe8f5';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${mana}/${maxMana}`, x + 188, y + 5);
  }

  function lifeHearts(x, y, life) {
    ctx.fillStyle = '#ff5a5a';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`♥ ${life}`, x, y);
  }

  function drawCardBack(x, y, w, h) {
    rr(ctx, x, y, w, h, 8);
    ctx.fillStyle = '#3a2418';
    ctx.fill();
    ctx.strokeStyle = '#8a6a45';
    ctx.lineWidth = 2;
    ctx.stroke();
    rr(ctx, x + 6, y + 6, w - 12, h - 12, 5);
    ctx.strokeStyle = '#e25822';
    ctx.stroke();
    ctx.fillStyle = '#e25822';
    ctx.font = `bold ${Math.floor(h / 3)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✦', x + w / 2, y + h / 2 + 8);
  }

  function drawCard(card, x, y, w, h, opts = {}) {
    const col = ELEMENT_COLOR[card.element];
    const dark = ELEMENT_DARK[card.element];
    rr(ctx, x, y, w, h, 9);
    ctx.fillStyle = '#f5ead6';
    ctx.fill();
    ctx.lineWidth = opts.glow ? 4 : 2;
    ctx.strokeStyle = opts.glow || '#5a4632';
    ctx.stroke();
    // Element banner.
    ctx.fillStyle = dark;
    ctx.fillRect(x + 2, y + 2, w - 4, 26);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(ELEMENT_NAME[card.element], x + 30, y + 20);
    ctx.fillStyle = col;
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(ELEMENT_GLYPH[card.element], x + 18, y + 21);
    // Cost gem.
    ctx.beginPath();
    ctx.arc(x + w - 16, y + 15, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#2b6cb0';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillText(String(card.cost), x + w - 16, y + 20);
    // Art glyph.
    ctx.fillStyle = col;
    ctx.font = `bold ${Math.floor(h * 0.34)}px Georgia, serif`;
    ctx.fillText(ELEMENT_GLYPH[card.element], x + w / 2, y + h * 0.52);
    // Name.
    ctx.fillStyle = '#2b2118';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText(card.name, x + w / 2, y + h - 34);
    if (card.kind === 'minion') {
      ctx.font = 'bold 15px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#b02a2a';
      ctx.fillText(`⚔ ${card.attack}`, x + 8, y + h - 10);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#1d6b3c';
      ctx.fillText(`♥ ${card.health}`, x + w - 8, y + h - 10);
      ctx.textAlign = 'center';
    } else {
      ctx.fillStyle = '#4a3a28';
      ctx.font = '11px Georgia, serif';
      wrapText(card.text, x + w / 2, y + h - 12, w - 14, 13);
    }
    if (opts.dim) {
      ctx.fillStyle = 'rgba(20, 12, 8, 0.55)';
      rr(ctx, x, y, w, h, 9);
      ctx.fill();
    }
    if (opts.tired) {
      ctx.fillStyle = 'rgba(20, 12, 8, 0.35)';
      rr(ctx, x, y, w, h, 9);
      ctx.fill();
    }
  }

  function wrapText(text, cx, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
    const startY = y - (lines.length - 1) * lineH;
    for (let i = 0; i < lines.length; i += 1) ctx.fillText(lines[i], cx, startY + i * lineH);
  }

  function drawMinion(m, x, y, w, h, opts = {}) {
    drawCard(m, x, y, w, h, opts);
    if (m.canAttack && opts.ready) {
      ctx.strokeStyle = '#7dff8a';
      ctx.lineWidth = 3;
      rr(ctx, x - 2, y - 2, w + 4, h + 4, 10);
      ctx.stroke();
    }
  }

  function drawFace(side, rect, name, isFoe) {
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = isFoe ? '#3d1420' : '#14260f';
    ctx.fill();
    ctx.strokeStyle = isFoe ? '#e25822' : '#7dff8a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, rect.x + 12, rect.y + 22);
    lifeHearts(rect.x + 12, rect.y + 44, side.life);
  }

  function drawLog(lines) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    rr(ctx, 52, 292, 640, 110, 8);
    ctx.fill();
    ctx.fillStyle = '#e8dcc8';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'left';
    lines.forEach((line, i) => ctx.fillText(line, 64, 314 + i * 19));
  }

  function drawLegend() {
    ctx.fillStyle = '#cbb98f';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Flame > Gale > Stone > Tide > Flame: advantage deals +2 damage', CANVAS_WIDTH / 2, 668);
  }

  function drawButton(rect, label, enabled) {
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = enabled ? '#e25822' : '#4a3a32';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 6);
  }

  function drawTable(game) {
    const layout = computeLayout(game);
    const p = game.player;
    const f = game.foe;
    // Foe face + mana + hand backs.
    drawFace(f, layout.foeFace, FOE_NAME, true);
    manaCrystals(300, 34, f.mana, f.maxMana);
    ctx.fillStyle = '#cbb98f';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Deck: ${f.deck.length}`, 1080, 34);
    const foeBacks = handLayout(f.hand.length, 66, 46, 64, -1, 0);
    foeBacks.forEach((r) => drawCardBack(r.x, r.y, r.w, r.h));
    // Foe board.
    f.board.forEach((m, i) => {
      const r = layout.foeBoard[i];
      if (r) drawMinion(m, r.x, r.y, r.w, r.h, { glow: game.spellTarget && game.phase === 'player' ? '#ff5a5a' : null });
    });
    if (f.board.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = 'italic 15px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('— no minions —', CANVAS_WIDTH / 2, 205);
    }
    // Middle: log + end turn.
    drawLog(game.log.slice(-5));
    drawButton(layout.endTurn, game.phase === 'player' ? 'END TURN' : 'WITCH…', game.phase === 'player');
    // Player board.
    p.board.forEach((m, i) => {
      const r = layout.playerBoard[i];
      if (!r) return;
      const selected = game.selected && game.selected.type === 'board' && game.selected.index === i;
      drawMinion(m, r.x, r.y, r.w, r.h, {
        glow: selected ? '#ffd24a' : null,
        ready: m.canAttack && game.phase === 'player',
        tired: !m.canAttack,
      });
    });
    if (p.board.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = 'italic 15px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('— no minions —', CANVAS_WIDTH / 2, 415);
    }
    // Player hand.
    p.hand.forEach((card, i) => {
      const r = layout.hand[i];
      if (!r) return;
      const playable = game.phase === 'player' && card.cost <= p.mana &&
        !(card.kind === 'minion' && p.board.length >= MAX_BOARD);
      const selected = game.selected && game.selected.type === 'hand' && game.selected.index === i;
      drawCard(card, r.x, r.y, r.w, r.h, {
        glow: selected ? '#ffd24a' : playable ? '#7dff8a' : null,
        dim: !playable,
      });
    });
    // Player face + mana + deck.
    drawFace(p, layout.playerFace, PLAYER_NAME, false);
    manaCrystals(300, 686, p.mana, p.maxMana);
    ctx.fillStyle = '#cbb98f';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Deck: ${p.deck.length}`, 1150, 686);
    drawLegend();
    if (game.phase === 'ai') {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ffd24a';
      ctx.font = 'bold 34px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('The Cinder Witch takes her turn…', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
    if (game.spellTarget) {
      ctx.fillStyle = '#ffd24a';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose a target: an enemy minion, or the Witch herself', CANVAS_WIDTH / 2, 276);
    } else if (game.selected && game.selected.type === 'board') {
      ctx.fillStyle = '#7dff8a';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose a target: an enemy minion, or the Witch herself', CANVAS_WIDTH / 2, 276);
    }
    ctx.textAlign = 'left';
  }

  function drawTitle() {
    ctx.fillStyle = '#ffd24a';
    ctx.font = 'bold 84px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASHFALL PACT', CANVAS_WIDTH / 2, 190);
    ctx.fillStyle = '#e25822';
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText('A duel of sparks, wind, stone and tide', CANVAS_WIDTH / 2, 232);
    ctx.fillStyle = '#e8dcc8';
    ctx.font = '17px Georgia, serif';
    ctx.fillText('You are the Ember Smith. The Cinder Witch holds the pact —', CANVAS_WIDTH / 2, 300);
    ctx.fillText('take her 30 life before she takes yours.', CANVAS_WIDTH / 2, 326);
    ctx.fillText('Mana grows 1 each turn, to 10. Draw a card each turn.', CANVAS_WIDTH / 2, 360);
    ctx.fillText('Flame > Gale > Stone > Tide > Flame: advantage deals +2 damage.', CANVAS_WIDTH / 2, 386);
    ctx.fillText('Click a card to play it. Click your minion, then a target, to attack.', CANVAS_WIDTH / 2, 412);
    drawButton(computeLayout({ player: null, foe: null }).titleButton, 'BEGIN THE DUEL', true);
    ctx.fillStyle = '#cbb98f';
    ctx.font = '14px Georgia, serif';
    ctx.fillText('Click or press Enter — mouse and keyboard', CANVAS_WIDTH / 2, 580);
  }

  function drawEnd(game) {
    drawTable(game);
    ctx.fillStyle = game.screen === 'win' ? 'rgba(20, 60, 20, 0.82)' : 'rgba(60, 10, 10, 0.82)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = game.screen === 'win' ? '#ffd24a' : '#ff5a5a';
    ctx.font = 'bold 72px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.screen === 'win' ? 'VICTORY' : 'DEFEAT', CANVAS_WIDTH / 2, 300);
    ctx.fillStyle = '#fff';
    ctx.font = '24px Georgia, serif';
    ctx.fillText(
      game.screen === 'win'
        ? `The Cinder Witch falls. The pact is yours — ${game.turnsTaken} turns, ${game.player.life} life to spare.`
        : 'Your embers fade. The Cinder Witch takes the pact.',
      CANVAS_WIDTH / 2, 350,
    );
    ctx.fillStyle = '#e8dcc8';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Press Enter to play again', CANVAS_WIDTH / 2, 410);
  }

  function draw(game) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    background();
    if (game.screen === 'title') drawTitle();
    else if (game.screen === 'play') drawTable(game);
    else drawEnd(game);
  }

  return { draw };
}
