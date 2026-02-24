// Carga el runtime de Spline desde CDN (sin instalación npm)
import { Application } from 'https://unpkg.com/@splinetool/runtime@1.9.32/build/runtime.js';

const _r = atob('aHR0cHM6Ly9wcm9kLnNwbGluZS5kZXNpZ24va1pERGpPNUh1QzlHSlVNMi9zY2VuZS5zcGxpbmVjb2Rl');

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);
app.load(_r);
