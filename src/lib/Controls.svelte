<script>
  import { timer } from './timer.svelte.js'
  import { unlockAudio } from './audio.js'

  let mainLabel = $derived(
    timer.status === 'running' ? 'Pausar' : timer.status === 'paused' ? 'Continuar' : 'Iniciar'
  )

  function toggle() {
    unlockAudio()
    if (timer.status === 'running') timer.pause()
    else timer.start()
  }
</script>

<div class="controls">
  <button class="side" onclick={() => timer.reset()} aria-label="Reiniciar" title="Reiniciar">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  </button>

  <button class="main" onclick={toggle}>{mainLabel}</button>

  <button class="side" onclick={() => timer.skip()} aria-label="Saltar sesión" title="Saltar sesión">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M5 4l10 8-10 8V4z" />
      <rect x="17" y="4" width="2.5" height="16" rx="1" />
    </svg>
  </button>
</div>

<style>
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
  }

  .main {
    min-width: 10rem;
    padding: 1rem 2rem;
    border-radius: 999px;
    background: var(--accent);
    color: #fff;
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    transition: background 0.3s, transform 0.1s;
  }

  .main:active {
    transform: scale(0.97);
  }

  .side {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--surface);
    color: var(--text-dim);
    transition: color 0.2s;
  }

  .side:hover {
    color: var(--text);
  }
</style>
