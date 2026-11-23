// Ashfall Pact — the Cinder Witch plays greedily: the biggest card she
// can afford first, spells at the best target she sees, minions at the
// face unless a clean kill is on the board.
import { canPlayCard, playCard, castSpell, attack } from './state.js';
import { hasAdvantage as adv } from './config.js';

function spellDamageVs(card, target) {
  if (!target) return card.damage;
  return card.damage + (target.element && adv(card.element, target.element) ? 2 : 0);
}

function bestDamageTarget(game, card) {
  const enemy = game.player.board;
  let best = null;
  for (let i = 0; i < enemy.length; i += 1) {
    const m = enemy[i];
    const dmg = spellDamageVs(card, m);
    if (dmg >= m.health && (!best || m.attack > enemy[best].attack)) best = i;
  }
  return best;
}

export function aiTakeTurn(game) {
  const foe = game.foe;
  // Play cards: biggest affordable first, until nothing useful remains.
  for (;;) {
    let played = false;
    const order = foe.hand
      .map((c, i) => ({ c, i }))
      .filter(({ c, i }) => canPlayCard(game, 'foe', i))
      .sort((a, b) => b.c.cost - a.c.cost || b.c.attack - a.c.attack);
    for (const { c, i } of order) {
      if (c.kind === 'minion') {
        if (playCard(game, 'foe', i)) { played = true; break; }
      } else if (c.target === 'all-enemy') {
        const worth = game.player.board.length >= 2 ||
          game.player.board.some((m) => m.health <= c.damage);
        if (worth && playCard(game, 'foe', i)) { played = true; break; }
      } else if (c.target === 'self') {
        if ((foe.life <= 22 || c.draw) && playCard(game, 'foe', i)) { played = true; break; }
      } else {
        // Targeted damage: lethal on the face, else a clean kill, else face.
        if (c.damage >= game.player.life) {
          if (castSpell(game, 'foe', i, { kind: 'face', who: 'player' })) { played = true; break; }
        }
        const kill = bestDamageTarget(game, c);
        if (kill !== null) {
          if (castSpell(game, 'foe', i, { kind: 'minion', who: 'player', index: kill })) { played = true; break; }
        }
        if (game.player.board.length === 0) {
          if (castSpell(game, 'foe', i, { kind: 'face', who: 'player' })) { played = true; break; }
        }
      }
    }
    if (!played) break;
    if (game.screen !== 'play') return;
  }
  if (game.screen !== 'play') return;
  // Attack: every ready minion, lethal first, then clean kills, else face.
  const attackers = foe.board.filter((m) => m.canAttack);
  for (const m of attackers) {
    if (game.screen !== 'play') return;
    const idx = foe.board.indexOf(m);
    if (idx === -1 || !m.canAttack) continue;
    if (m.attack >= game.player.life) {
      attack(game, 'foe', idx, { kind: 'face', who: 'player' });
      continue;
    }
    let kill = -1;
    for (let i = 0; i < game.player.board.length; i += 1) {
      const d = game.player.board[i];
      const dmg = m.attack + (adv(m.element, d.element) ? 2 : 0);
      const back = d.attack + (adv(d.element, m.element) ? 2 : 0);
      if (dmg >= d.health && back < m.health && (kill === -1 || d.attack > game.player.board[kill].attack)) kill = i;
    }
    if (kill !== -1) attack(game, 'foe', idx, { kind: 'minion', who: 'player', index: kill });
    else attack(game, 'foe', idx, { kind: 'face', who: 'player' });
  }
}
