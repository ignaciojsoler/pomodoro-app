<script>
  import { timer } from './timer.svelte.js'

  const SIZE = 280
  const STROKE = 8
  const R = (SIZE - STROKE) / 2
  const CIRC = 2 * Math.PI * R

  let progress = $derived(timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0)

  let minutes = $derived(Math.floor(timer.remainingMs / 60_000))
  let seconds = $derived(Math.floor((timer.remainingMs % 60_000) / 1000))
  let display = $derived(
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  )
</script>

<div class="ring-wrap">
  <svg viewBox="0 0 {SIZE} {SIZE}" class="ring">
    <circle class="track" cx={SIZE / 2} cy={SIZE / 2} r={R} stroke-width={STROKE} />
    <circle
      class="progress"
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={R}
      stroke-width={STROKE}
      stroke-dasharray={CIRC}
      stroke-dashoffset={CIRC * (1 - progress)}
    />
  </svg>
  <div class="time" class:paused={timer.status === 'paused'}>{display}</div>
</div>

<style>
  .ring-wrap {
    position: relative;
    width: min(72vw, 320px);
    aspect-ratio: 1;
    margin: 0 auto;
  }

  .ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  circle {
    fill: none;
    stroke-linecap: round;
  }

  .track {
    stroke: var(--surface-2);
  }

  .progress {
    stroke: var(--accent);
    transition: stroke-dashoffset 0.25s linear, stroke 0.3s;
  }

  .time {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: clamp(3rem, 16vw, 4.5rem);
    font-weight: 200;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  .time.paused {
    animation: blink 1.6s ease-in-out infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0.35;
    }
  }
</style>
