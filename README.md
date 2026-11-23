# Ashfall Pact

A duel card game for the make.fun best-card-game bounty. You are the
Ember Smith; the Cinder Witch holds the pact. Take her 30 life before
she takes yours.

## How it plays

- **30 life each.** Mana grows 1 per turn, to 10. Draw a card each turn.
- **Four elements:** Flame > Gale > Stone > Tide > Flame. Attacking a
  weaker element deals +2 damage — spells too.
- **Minions** (16 kinds) fight on the board, up to 7 a side. A minion
  just summoned cannot attack until your next turn.
- **Spells** (8 kinds): direct damage, board clears, healing, card draw.
- **Click** a card to play it. Click one of your ready minions, then an
  enemy minion or the Witch herself, to attack. **End Turn** (or Enter)
  passes to the Witch, who plays greedily: biggest card first, spells at
  the best target, minions at the face unless a clean kill is on board.
- **Esc** cancels a selection. **M** mutes the synthesized sound.

## How to run

```sh
node serve.ts
# open http://localhost:8080
```

Static files only: `game/index.html` plus ES modules under `game/src/`.
No network requests, no external assets — all art is drawn on canvas
and all sound is synthesized with WebAudio.

## Screenshots

`shots.json` lists the four staged shots
(`?shot=title|table|win|loss&seed=1`).
