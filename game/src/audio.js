// Ashfall Pact — all sound is synthesized with WebAudio. No audio files.
export function createAudio() {
  let ctx = null;
  let muted = false;
  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ac.currentTime + when);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + when + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(ac.currentTime + when);
      osc.stop(ac.currentTime + when + dur);
    } catch {
      // Sound is garnish: never let it break the game.
    }
  }
  return {
    toggleMute() {
      muted = !muted;
      return muted;
    },
    click() { tone(660, 0.06, 'sine', 0.08); },
    playCard() { tone(520, 0.09, 'triangle', 0.12); tone(780, 0.09, 'triangle', 0.1, 0.07); },
    attack() { tone(180, 0.12, 'sawtooth', 0.12); tone(120, 0.14, 'sawtooth', 0.1, 0.05); },
    damage() { tone(140, 0.2, 'square', 0.1); },
    heal() { tone(880, 0.12, 'sine', 0.09); tone(1170, 0.16, 'sine', 0.08, 0.09); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.13)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.11, i * 0.15)); },
  };
}
