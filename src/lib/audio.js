// Alarmas generadas con Web Audio API: sin archivos de audio, funciona offline.
// El AudioContext debe crearse/reanudarse en un gesto del usuario (política de
// autoplay en móviles), por eso unlockAudio() se llama desde el botón Iniciar.

let ctx = null

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
}

function beep(freq, when, dur = 0.22, volume = 0.35) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, when)
  gain.gain.linearRampToValueAtTime(volume, when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(when)
  osc.stop(when + dur + 0.05)
}

/**
 * Suena la alarma según la sesión que terminó.
 * 'focus' → campanadas ascendentes (¡a descansar!); descansos → tonos suaves (a estudiar).
 */
export function playAlarm(endedMode) {
  unlockAudio()
  if (!ctx) return
  const t = ctx.currentTime + 0.05
  if (endedMode === 'focus') {
    const notes = [659.25, 783.99, 1046.5] // E5 G5 C6
    for (let rep = 0; rep < 3; rep++) {
      notes.forEach((f, i) => beep(f, t + rep * 0.9 + i * 0.18, 0.3))
    }
  } else {
    const notes = [1046.5, 783.99] // C6 G5
    for (let rep = 0; rep < 2; rep++) {
      notes.forEach((f, i) => beep(f, t + rep * 0.7 + i * 0.22, 0.35))
    }
  }
}
