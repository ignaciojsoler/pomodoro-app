// Estado global del pomodoro con runas de Svelte 5.
// El fin de sesión se calcula contra un timestamp (endsAt), no decrementando un
// contador, para que siga siendo correcto si el navegador suspende la pestaña.

const SETTINGS_KEY = 'pomodoro.settings.v1'
const SESSION_KEY = 'pomodoro.session.v1'

export const DEFAULT_SETTINGS = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakEvery: 4,
  sound: true,
  vibrate: true,
  keepAwake: true
}

export const MODES = {
  focus: { label: 'Enfoque', color: 'var(--focus)' },
  shortBreak: { label: 'Descanso corto', color: 'var(--break)' },
  longBreak: { label: 'Descanso largo', color: 'var(--long-break)' }
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback }
  } catch {
    return { ...fallback }
  }
}

function today() {
  return new Date().toDateString()
}

class PomodoroTimer {
  settings = $state(load(SETTINGS_KEY, DEFAULT_SETTINGS))
  mode = $state('focus')
  status = $state('idle') // idle | running | paused
  remainingMs = $state(0)
  completed = $state(0) // pomodoros completados hoy

  /** Callback que dispara la UI al terminar una sesión: (modoTerminado) => void */
  onFinish = null

  #endsAt = 0
  #interval = null
  #wakeLock = null

  constructor() {
    this.#restore()
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.status === 'running') {
        this.#tick()
        this.#requestWakeLock()
      }
    })
  }

  durationMs(mode = this.mode) {
    const min = {
      focus: this.settings.focusMin,
      shortBreak: this.settings.shortBreakMin,
      longBreak: this.settings.longBreakMin
    }[mode]
    return Math.max(1, min) * 60_000
  }

  get totalMs() {
    return this.durationMs()
  }

  start() {
    if (this.status === 'running') return
    if (this.status === 'idle') this.remainingMs = this.durationMs()
    this.#endsAt = Date.now() + this.remainingMs
    this.status = 'running'
    this.#startInterval()
    this.#requestWakeLock()
    this.#persist()
  }

  pause() {
    if (this.status !== 'running') return
    this.remainingMs = Math.max(0, this.#endsAt - Date.now())
    this.status = 'paused'
    this.#stopInterval()
    this.#releaseWakeLock()
    this.#persist()
  }

  reset() {
    this.status = 'idle'
    this.remainingMs = this.durationMs()
    this.#stopInterval()
    this.#releaseWakeLock()
    this.#persist()
  }

  /** Salta a la siguiente sesión sin contar el pomodoro ni sonar la alarma */
  skip() {
    this.#advance(false)
  }

  resetCompleted() {
    this.completed = 0
    this.#persist()
  }

  /** Reaplica la duración actual cuando cambian los ajustes y el timer está idle */
  settingsChanged() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
    } catch {}
    if (this.status === 'idle') this.remainingMs = this.durationMs()
  }

  #startInterval() {
    this.#stopInterval()
    this.#interval = setInterval(() => this.#tick(), 250)
    this.#tick()
  }

  #stopInterval() {
    if (this.#interval) {
      clearInterval(this.#interval)
      this.#interval = null
    }
  }

  #tick() {
    if (this.status !== 'running') return
    this.remainingMs = Math.max(0, this.#endsAt - Date.now())
    if (this.remainingMs <= 0) this.#advance(true)
  }

  #advance(finished) {
    const ended = this.mode
    this.#stopInterval()
    if (ended === 'focus' && finished) this.completed += 1
    if (ended === 'focus') {
      const every = Math.max(1, this.settings.longBreakEvery)
      this.mode = finished && this.completed % every === 0 ? 'longBreak' : 'shortBreak'
    } else {
      this.mode = 'focus'
    }
    this.status = 'idle'
    this.remainingMs = this.durationMs()
    this.#releaseWakeLock()
    this.#persist()
    if (finished) this.onFinish?.(ended)
  }

  #persist() {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          mode: this.mode,
          status: this.status,
          endsAt: this.#endsAt,
          remainingMs: this.remainingMs,
          completed: this.completed,
          day: today()
        })
      )
    } catch {}
  }

  #restore() {
    const s = load(SESSION_KEY, null)
    if (!s) {
      this.remainingMs = this.durationMs()
      return
    }
    this.completed = s.day === today() ? (s.completed ?? 0) : 0
    this.mode = s.mode in MODES ? s.mode : 'focus'
    if (s.status === 'running' && s.endsAt > Date.now()) {
      // La sesión seguía corriendo: retomarla donde iba
      this.#endsAt = s.endsAt
      this.remainingMs = s.endsAt - Date.now()
      this.status = 'running'
      this.#startInterval()
      this.#requestWakeLock()
    } else if (s.status === 'running') {
      // Terminó mientras la app estaba cerrada: avanzar sin alarma tardía
      this.status = 'running'
      this.#endsAt = 0
      this.remainingMs = 0
      this.#advance(true)
    } else if (s.status === 'paused' && s.remainingMs > 0) {
      this.status = 'paused'
      this.remainingMs = s.remainingMs
    } else {
      this.remainingMs = this.durationMs()
    }
  }

  async #requestWakeLock() {
    if (!this.settings.keepAwake || !('wakeLock' in navigator)) return
    if (this.status !== 'running' || document.visibilityState !== 'visible') return
    try {
      this.#wakeLock = await navigator.wakeLock.request('screen')
    } catch {}
  }

  #releaseWakeLock() {
    this.#wakeLock?.release().catch(() => {})
    this.#wakeLock = null
  }
}

export const timer = new PomodoroTimer()
