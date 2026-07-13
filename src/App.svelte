<script>
  import { timer, MODES } from './lib/timer.svelte.js'
  import { playAlarm } from './lib/audio.js'
  import TimerDisplay from './lib/TimerDisplay.svelte'
  import Controls from './lib/Controls.svelte'
  import Settings from './lib/Settings.svelte'

  let showSettings = $state(false)

  timer.onFinish = (endedMode) => {
    if (timer.settings.sound) playAlarm(endedMode)
    if (timer.settings.vibrate && 'vibrate' in navigator) {
      const pulse = endedMode === 'focus' ? [300, 120, 300, 120, 500, 400] : [200, 100, 200, 300]
      navigator.vibrate([...pulse, ...pulse, ...pulse])
    }
  }

  let minutes = $derived(Math.floor(timer.remainingMs / 60_000))
  let seconds = $derived(Math.floor((timer.remainingMs % 60_000) / 1000))

  // Tiempo restante en el título de la pestaña
  $effect(() => {
    if (timer.status === 'running' || timer.status === 'paused') {
      const mm = String(minutes).padStart(2, '0')
      const ss = String(seconds).padStart(2, '0')
      document.title = `${mm}:${ss} · ${MODES[timer.mode].label}`
    } else {
      document.title = 'Pomodoro'
    }
  })

  let cycleSize = $derived(Math.max(1, timer.settings.longBreakEvery))
  let cycleFilled = $derived(
    timer.completed > 0 && timer.completed % cycleSize === 0 && timer.mode === 'longBreak'
      ? cycleSize
      : timer.completed % cycleSize
  )
</script>

<main style="--accent: {MODES[timer.mode].color}">
  <header>
    <span class="mode">{MODES[timer.mode].label}</span>
    <button
      class="gear"
      class:active={showSettings}
      onclick={() => (showSettings = !showSettings)}
      aria-label="Ajustes"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
  </header>

  <section class="timer">
    <TimerDisplay />

    <div class="cycle" title="Progreso del ciclo">
      {#each Array(cycleSize) as _, i}
        <span class="dot" class:filled={i < cycleFilled}></span>
      {/each}
    </div>

    <p class="count">{timer.completed} {timer.completed === 1 ? 'pomodoro' : 'pomodoros'} hoy</p>

    <Controls />
  </section>

  {#if showSettings}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class="overlay"
      onclick={(e) => {
        if (e.target === e.currentTarget) showSettings = false
      }}
    >
      <div class="sheet">
        <Settings />
      </div>
    </div>
  {/if}
</main>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') showSettings = false
  }}
/>

<style>
  main {
    min-height: 100dvh;
    max-width: 26rem;
    margin: 0 auto;
    padding: 1.25rem 1.25rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mode {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    transition: color 0.3s;
  }

  .gear {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--text-dim);
    transition: color 0.2s, transform 0.3s;
  }

  .gear:hover,
  .gear.active {
    color: var(--text);
  }

  .gear.active {
    transform: rotate(60deg);
  }

  .timer {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
  }

  .cycle {
    display: flex;
    gap: 0.6rem;
  }

  .dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: var(--surface-2);
    transition: background 0.3s;
  }

  .dot.filled {
    background: var(--accent);
  }

  .count {
    color: var(--text-dim);
    font-size: 0.9rem;
    margin-top: -0.5rem;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .sheet {
    width: min(100%, 24rem);
    max-height: calc(100dvh - 4rem);
    overflow-y: auto;
    border-radius: var(--radius);
    animation: rise 0.25s ease-out;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(1.5rem);
    }
  }

  @media (min-width: 600px) {
    .overlay {
      align-items: center;
    }
  }
</style>
