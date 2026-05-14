# StarSim · Frontend

SPA en HTML, CSS puro y Vanilla JavaScript que consume la API REST de Laravel ubicada en `http://127.0.0.1/api`. No usa build step ni framework: se sirve como ficheros estáticos.

## Estructura

```
frontend/
├── login.html              # Pantalla de inicio de sesión (entrada del SPA)
├── index.html              # Shell del SPA (sidebar + header + <main>)
├── components/             # Fragmentos HTML reutilizables
│   ├── aside.html          # Sidebar (navegación)
│   ├── header.html         # Cabecera (usuario, logout, modal de config)
│   └── configModal.html    # Modal de configuración / perfil
├── pages/                  # Vistas inyectadas por el router
│   ├── panel.html          # Dashboard (charts, countdown, clima)
│   ├── program.html        # Programas y misiones por entidad
│   ├── mision.html         # Editor de misión
│   ├── configAvanzada.html # Ajustes avanzados de simulación
│   └── constelacion.html   # Visualización de constelación Starlink
├── css/                    # Hojas de estilo por página + globales
├── img/                    # Logos, avatares, vehículos, destinos, blueprints
└── js/
    ├── main.js             # Bootstrap: inyecta sidebar/header, sesión
    ├── router.js           # Router por hash (#) y carga de vistas
    ├── header.js           # Lógica de la cabecera
    ├── missionService.js   # Cliente REST de /api/misiones (caché + Bearer)
    ├── panel.js            # Dashboard
    ├── program.js          # Programas
    ├── mision.js           # Editor de misión
    ├── configAvanzada.js   # Configuración avanzada
    ├── constelacion.js     # Constelación de satélites
    ├── configModal.js      # Modal de perfil / preferencias
    ├── cm.js               # Helpers compartidos del modal
    ├── popup.js            # Notificaciones flotantes
    ├── scrollTransition.js # Transiciones tipo scroll entre panel/program
    └── data/
        └── ne_110m_land.json   # GeoJSON (mapa mundial para constelación)
```

## Cómo funciona

1. **`login.html`** autentica contra `POST /api/login` y guarda `api_token` + `user` en `localStorage`.
2. **`index.html`** verifica el token; si no existe redirige a `login.html`. Carga el shell y dispara `js/main.js`.
3. **`js/router.js`** es un router por hash:
   - Las rutas válidas son `panel`, `program`, `mision`, `configAvanzada`, `constelacion`.
   - Cada ruta define `template` (HTML en `pages/`), `style` (CSS en `css/`) y un `init()` global.
   - Las rutas `mision` y `configAvanzada` están bloqueadas para el rol `viewer`; un intento redirige a `panel` con notificación.
   - Las transiciones entre `panel` ⇄ `program` se delegan en `scrollTransition.js`.
4. **`js/missionService.js`** centraliza el CRUD contra `/api/misiones`, mantiene una caché en memoria y emite el evento `missions-updated` cuando algo cambia.

## Convenciones

- **Auth:** toda llamada a la API añade `Authorization: Bearer ${localStorage.api_token}`.
- **Permisos en cliente:** son una mejora de UX. El backend siempre revalida con el middleware `role:` y responde `403` ante un `viewer` que intente escribir.
- **Inicializadores:** cada página expone una función global `window.initXxxPage()` que el router invoca tras inyectar el HTML.
- **Estilos:**
  - Las hojas globales (sidebar, header, panel, program, popup, transitions, configModal, constelacion) se enlazan desde `index.html`.
  - El `<link id="page-css">` se reescribe dinámicamente con el CSS de la vista actual.
- **Dependencias externas (CDN):**
  - [Chart.js 4](https://www.chartjs.org/) — gráficos del panel.
  - [Spline](https://spline.design/) — escenas 3D embebidas.
  - Google Fonts (Inter).

## Servir el frontend

No hay build. Basta con un servidor estático:

- **VSCode + Live Server:** clic derecho sobre `login.html` → *Open with Live Server* (sirve en `http://127.0.0.1:5500`).
- **Alternativa:** `python -m http.server 5500` desde esta carpeta.

El backend debe responder en `http://127.0.0.1` (puerto 80, Laravel Sail). CORS está configurado en Laravel para aceptar el origen del Live Server.

## Datos en `localStorage`

| Clave | Contenido |
|---|---|
| `api_token` | Token Sanctum devuelto por `/api/login` |
| `user` | JSON con `{ id, name, email, role, entidad, … }` |

Borrar ambas claves equivale a cerrar sesión.

## Añadir una página nueva

1. Crea `pages/miPagina.html` y, si aplica, `css/miPagina.css`.
2. Añade un script `js/miPagina.js` que exponga `window.initMiPaginaPage = () => { ... }`.
3. Inclúyelo con `<script defer>` en `index.html`.
4. Registra la ruta en `js/router.js`:
   ```js
   'miPagina': {
       template: 'pages/miPagina.html',
       style:    'css/miPagina.css',
       title:    'Mi Página — StarSim',
       init:     () => window.initMiPaginaPage && window.initMiPaginaPage()
   }
   ```
5. Si la ruta debe estar vetada para `viewer`, añádela al array `VIEWER_RESTRICTED_ROUTES` del router.

Para más contexto sobre la API consumida y los roles del backend, ver el [README principal](../README.md) y [`CRUD_README.md`](../CRUD_README.md).
