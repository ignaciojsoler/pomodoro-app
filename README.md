# 🍅 Pomodoro

PWA minimalista para estudiar con el método Pomodoro. Instalable en el teléfono, funciona 100% offline.

**App:** https://ignaciojsoler.github.io/pomodoro-app/

## Funciones

- Ciclo clásico: enfoque (25 min) → descanso corto (5 min), con descanso largo (15 min) cada 4 pomodoros. Todo configurable.
- Alarma sonora generada con Web Audio API (sin archivos de audio) + vibración en móvil.
- El countdown se calcula por timestamp, así sigue siendo exacto aunque el navegador suspenda la pestaña.
- Contador de pomodoros del día, persistido en `localStorage` (se reinicia cada día).
- Opción para mantener la pantalla encendida (Wake Lock API).
- Tema oscuro, responsive, instalable como app (manifest + service worker con precache).

## Instalación en el teléfono

1. Abrí la URL en el navegador del teléfono.
2. Android (Chrome): menú ⋮ → **Agregar a pantalla de inicio** / **Instalar app**.
3. iOS (Safari): botón compartir → **Agregar a inicio**.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción en dist/
npm run preview  # sirve el build para probar la PWA
npm run icons    # regenera los PNG desde public/favicon.svg
```

Stack: Svelte 5 + Vite + vite-plugin-pwa. El deploy a GitHub Pages es automático en cada push a `main` (`.github/workflows/deploy.yml`).
