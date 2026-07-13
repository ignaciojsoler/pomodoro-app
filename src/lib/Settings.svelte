<script>
  import { timer } from './timer.svelte.js'
  import { playAlarm } from './audio.js'

  const durations = [
    { key: 'focusMin', label: 'Enfoque', min: 1, max: 90 },
    { key: 'shortBreakMin', label: 'Descanso corto', min: 1, max: 30 },
    { key: 'longBreakMin', label: 'Descanso largo', min: 1, max: 60 },
    { key: 'longBreakEvery', label: 'Descanso largo cada', min: 2, max: 8, unit: 'pomodoros' }
  ]

  const toggles = [
    { key: 'sound', label: 'Sonido de alarma' },
    { key: 'vibrate', label: 'Vibración' },
    { key: 'keepAwake', label: 'Mantener pantalla encendida' }
  ]

  function clamp(d) {
    const v = Math.round(Number(timer.settings[d.key]) || d.min)
    timer.settings[d.key] = Math.min(d.max, Math.max(d.min, v))
    timer.settingsChanged()
  }
</script>

<section class="settings">
  <h2>Ajustes</h2>

  {#each durations as d}
    <label class="row">
      <span>{d.label}</span>
      <span class="value">
        <input
          type="number"
          inputmode="numeric"
          min={d.min}
          max={d.max}
          bind:value={timer.settings[d.key]}
          onchange={() => clamp(d)}
        />
        <small>{d.unit ?? 'min'}</small>
      </span>
    </label>
  {/each}

  {#each toggles as t}
    <label class="row">
      <span>{t.label}</span>
      <input
        type="checkbox"
        class="switch"
        bind:checked={timer.settings[t.key]}
        onchange={() => timer.settingsChanged()}
      />
    </label>
  {/each}

  <div class="actions">
    <button class="ghost" onclick={() => playAlarm('focus')}>Probar sonido</button>
    <button class="ghost" onclick={() => timer.resetCompleted()}>Reiniciar contador</button>
  </div>
</section>

<style>
  .settings {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    width: 100%;
  }

  h2 {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.95rem;
  }

  .value {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .value small {
    color: var(--text-dim);
    width: 5.5ch;
  }

  input[type='number'] {
    width: 3.5rem;
    padding: 0.4rem;
    text-align: center;
    background: var(--surface-2);
    color: var(--text);
    border: none;
    border-radius: 8px;
  }

  .switch {
    appearance: none;
    width: 2.6rem;
    height: 1.5rem;
    border-radius: 999px;
    background: var(--surface-2);
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .switch::after {
    content: '';
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: var(--text-dim);
    transition: transform 0.2s, background 0.2s;
  }

  .switch:checked {
    background: var(--accent);
  }

  .switch:checked::after {
    background: #fff;
    transform: translateX(1.1rem);
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }

  .ghost {
    flex: 1;
    padding: 0.6rem;
    border-radius: 10px;
    background: var(--surface-2);
    color: var(--text-dim);
    font-size: 0.85rem;
    transition: color 0.2s;
  }

  .ghost:hover {
    color: var(--text);
  }
</style>
