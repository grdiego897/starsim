// Globo interactivo a pantalla completa con seguimiento de satélites Starlink.

(function () {
  'use strict';

  // ============================================================================
  // DATOS DE MISIÓN — obtenidos desde MissionService (solo programa Starlink)
  // ============================================================================

  const PORT_COORDS = {
    'starbase': { name: 'OLP-1', site: 'Starbase, Boca Chica, TX', lat: 25.9972, lon: -97.1556 },
    'cape': { name: 'LC-39A', site: 'Cape Canaveral, FL', lat: 28.5618, lon: -80.5772 },
    'vandenberg': { name: 'SLC-4E', site: 'Vandenberg SFB, CA', lat: 34.6320, lon: -120.6107 },
    'kourou': { name: 'ELA-3', site: 'Kourou, French Guiana', lat: 5.2360, lon: -52.7755 },
    'azores': { name: 'ASC', site: 'Atlantic Spaceport (Azores)', lat: 37.7401, lon: -25.6663 },
  };

  const STARLINK_SHELLS = {
    'Shell 1': { inclination: 53.0, altitude: 550 },
    'Shell 2': { inclination: 53.2, altitude: 540 },
    'Shell 3': { inclination: 70.0, altitude: 570 },
    'Shell 4': { inclination: 97.6, altitude: 560 },
    'Shell 5': { inclination: 43.0, altitude: 530 },
  };

  const SHELL_CODE_TO_NAME = {
    'S1': 'Shell 1', 'S2': 'Shell 2', 'S3': 'Shell 3', 'S4': 'Shell 4', 'S5': 'Shell 5',
  };

  function resolveShellName(code) {
    if (!code) return 'Shell 1';
    if (SHELL_CODE_TO_NAME[code]) return SHELL_CODE_TO_NAME[code];
    if (STARLINK_SHELLS[code]) return code;
    return 'Shell 1';
  }

  const SATS_PER_LAUNCH = 22;
  const DEFAULT_ALTITUDE = 550;

  function countStarlinkUnits(adv) {
    const cargo = adv && Array.isArray(adv.cargo) ? adv.cargo : [];
    let total = 0;
    for (const item of cargo) {
      const name = (item && item.name ? String(item.name) : '').trim().toLowerCase();
      if (name !== 'starlink') continue;
      const q = parseInt(item.qty, 10);
      if (Number.isFinite(q) && q > 0) total += q;
    }
    return total;
  }

  let ALL_SATS = [];
  let UPCOMING_LAUNCHES = [];
  let MISSIONS = [];

  // Auxiliares de formato para campos derivados de misión.
  const DEST_LABEL = {
    'leo': 'LEO',
    'haven': 'Haven-1',
    'axiom': 'Axiom Station',
    'orbital-reef': 'Orbital Reef',
    'gateway': 'Lunar Gateway',
    'luna': 'Luna Surface',
    'terminus': 'Mars Terminus',
  };

  const VEHICLE_LABEL = {
    'starship': 'Starship',
    'superheavy': 'Super Heavy',
    'falcon9': 'Falcon 9',
    'falconheavy': 'Falcon Heavy',
    'dragon': 'Dragon',
    'falcon-fairing': 'Falcon Fairing',
  };

  function destLabel(slug) {
    if (!slug) return '—';
    return DEST_LABEL[slug] || slug;
  }

  function vehicleLabel(slug) {
    if (!slug) return '—';
    return VEHICLE_LABEL[slug] || slug;
  }

  function parseCargoMass(value) {
    if (value === null || value === undefined) return 0;
    const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function parseCrew(value) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : 0;
  }

  // Calcula el RAAN orbital y la anomalía media para que el satélite esté
  // directamente sobre la plataforma de lanzamiento en la época del lanzamiento.
  function orbitFromPad(padLat, padLon, altitude, epochMs, desiredIncl) {
    const minIncl = Math.abs(padLat) + 1;
    const incl = desiredIncl != null
      ? Math.max(minIncl, desiredIncl)
      : Math.max(53, minIncl);
    const inclR = incl * Math.PI / 180;
    const padLatR = padLat * Math.PI / 180;
    const padLonR = padLon * Math.PI / 180;
    const r = EARTH_R + altitude;

    let s = Math.sin(padLatR) / Math.sin(inclR);
    s = Math.max(-1, Math.min(1, s));
    const M = Math.asin(s);

    const xfT = r * Math.cos(padLatR) * Math.cos(padLonR);
    const yfT = r * Math.cos(padLatR) * Math.sin(padLonR);
    const gmst = (epochMs / 1000) * (2 * Math.PI / 86164.0905);
    const xe = xfT * Math.cos(gmst) - yfT * Math.sin(gmst);
    const ye = xfT * Math.sin(gmst) + yfT * Math.cos(gmst);
    const xi = r * Math.cos(M);
    const yi = r * Math.sin(M) * Math.cos(inclR);
    const raanR = Math.atan2(ye, xe) - Math.atan2(yi, xi);

    return {
      inclination: incl,
      raan: ((raanR * 180 / Math.PI) % 360 + 360) % 360,
      phase: ((M * 180 / Math.PI) % 360 + 360) % 360,
    };
  }

  function buildSatsForLaunch(mission, launch) {
    const portSlug = launch.port || mission.port || 'starbase';
    const pad = PORT_COORDS[portSlug] || PORT_COORDS['starbase'];
    const dateStr = launch.launchDate || mission.launchDate;
    if (!dateStr) return [];
    const epochMs = new Date(dateStr).getTime();
    if (!Number.isFinite(epochMs)) return [];

    const shellName = resolveShellName(launch.shell || mission.shell);
    const shellDef = STARLINK_SHELLS[shellName] || STARLINK_SHELLS['Shell 1'];
    const altitude = shellDef.altitude;
    const orbit = orbitFromPad(pad.lat, pad.lon, altitude, epochMs, shellDef.inclination);
    const adv = launch.advancedConfig || {};
    const count = countStarlinkUnits(adv);
    const sats = [];
    for (let i = 0; i < count; i++) {
      sats.push({
        id: `${mission.id || 'M'}-${i + 1}`,
        name: `${mission.name || 'STARLINK'} · ${String(i + 1).padStart(2, '0')}`,
        batch: mission.name || 'Starlink',
        launchDate: dateStr.slice(0, 10),
        epochMs,
        launchpad: { name: pad.name, site: pad.site, lat: pad.lat, lon: pad.lon },
        shell: shellName,
        inclination: orbit.inclination,
        altitude: altitude,
        altitudeLow: altitude - 12,
        altitudeHigh: altitude + 14,
        country: 'USA',
        operator: 'SpaceX',
        // Metadatos derivados de la misión (obtenidos de la base de datos)
        missionId: mission.id,
        missionName: mission.name || '',
        program: mission.program || '',
        status: 'lanzado',
        destination: launch.destination || '',
        ship: launch.ship || '',
        booster: launch.booster || '',
        cargoType: launch.cargoType || '',
        cargoMassT: parseCargoMass(launch.cargoMass),
        crewCount: parseCrew(adv.crew),
        duration: adv.duration || '',
        raan: ((orbit.raan + i * 0.06) % 360 + 360) % 360,
        phase: ((orbit.phase + i * 1.4) % 360 + 360) % 360,
      });
    }
    return sats;
  }

  function formatLaunchEta(ms) {
    if (ms < 0) ms = 0;
    const totalH = Math.floor(ms / 3600000);
    const d = Math.floor(totalH / 24);
    const h = totalH % 24;
    if (d > 0) return `+${d}d ${String(h).padStart(2, '0')}h`;
    const m = Math.floor((ms % 3600000) / 60000);
    return `+${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  }

  function rebuildConstellationFromMissions(missions) {
    ALL_SATS = [];
    UPCOMING_LAUNCHES = [];
    const starlink = (Array.isArray(missions) ? missions : []).filter(m => {
      const p = (m.program || '').toLowerCase();
      return p === 'starlink';
    });
    MISSIONS = starlink.slice();
    const now = Date.now();

    for (const m of starlink) {
      const status = (m.status || 'programado').toLowerCase();
      if (status === 'cancelado') continue;

      const launches = (m.launches && m.launches.length)
        ? m.launches
        : [{ port: m.port, launchDate: m.launchDate }];

      for (const l of launches) {
        const dateStr = l.launchDate || m.launchDate;
        if (!dateStr) continue;
        const t = new Date(dateStr).getTime();
        if (!Number.isFinite(t)) continue;

        const portSlug = l.port || m.port || 'starbase';
        const pad = PORT_COORDS[portSlug] || PORT_COORDS['starbase'];

        if (t > now) {
          UPCOMING_LAUNCHES.push({
            mission: m.name || 'Starlink',
            pad: pad.name,
            shell: resolveShellName(l.shell || m.shell),
            destination: l.destination || '',
            cargoType: l.cargoType || '',
            cargoMassT: parseCargoMass(l.cargoMass),
            crewCount: parseCrew((l.advancedConfig || {}).crew),
            status: m.status || 'programado',
            eta: formatLaunchEta(t - now),
            launchDateMs: t,
          });
        } else {
          ALL_SATS.push(...buildSatsForLaunch(m, l));
        }
      }
    }

    UPCOMING_LAUNCHES.sort((a, b) => a.launchDateMs - b.launchDateMs);
    UPCOMING_LAUNCHES = UPCOMING_LAUNCHES.slice(0, 8);

    state.satCount = ALL_SATS.length;
  }

  // ============================================================================
  // POLÍGONOS DE TIERRA — obtenidos de Natural Earth 110m (cargados desde js/data/)
  // ============================================================================

  // Cada entrada es un polígono: [anilloExterior, ...anillosAgujero]. Dibujado con evenodd
  // para que los agujeros (mares interiores como el Caspio) se recorten limpiamente.
  let LAND_POLYGONS = [];

  async function loadLandData() {
    if (LAND_POLYGONS.length) return;
    try {
      const res = await fetch('js/data/ne_110m_land.json');
      if (!res.ok) return;
      const geo = await res.json();
      const polygons = [];
      for (const f of (geo.features || [])) {
        const g = f.geometry;
        if (!g) continue;
        const polys = g.type === 'Polygon' ? [g.coordinates]
          : g.type === 'MultiPolygon' ? g.coordinates
            : [];
        for (const poly of polys) {
          const rings = poly.filter(r => r.length >= 3);
          if (rings.length) polygons.push(rings);
        }
      }
      LAND_POLYGONS = polygons;
    } catch (e) {
      console.warn('Failed to load land geojson', e);
    }
  }

  // ============================================================================
  // MECÁNICA ORBITAL
  // ============================================================================

  const EARTH_R = 6371;
  const MU = 398600.4418;

  function propagate(sat, simMs) {
    const r = EARTH_R + sat.altitude;
    const period = 2 * Math.PI * Math.sqrt((r * r * r) / MU);
    const v = Math.sqrt(MU / r);
    const dtSec = (simMs - sat.epochMs) / 1000;
    const M = ((sat.phase * Math.PI / 180) + (2 * Math.PI * dtSec / period)) % (2 * Math.PI);
    const incl = sat.inclination * Math.PI / 180;
    const raan = sat.raan * Math.PI / 180;
    const xp = r * Math.cos(M), yp = r * Math.sin(M);
    const xi = xp, yi = yp * Math.cos(incl), zi = yp * Math.sin(incl);
    const xe = xi * Math.cos(raan) - yi * Math.sin(raan);
    const ye = xi * Math.sin(raan) + yi * Math.cos(raan);
    const ze = zi;
    const gmst = (simMs / 1000) * (2 * Math.PI / 86164.0905);
    const xf = xe * Math.cos(gmst) + ye * Math.sin(gmst);
    const yf = -xe * Math.sin(gmst) + ye * Math.cos(gmst);
    const zf = ze;
    const lat = Math.asin(zf / r) * 180 / Math.PI;
    const lon = ((Math.atan2(yf, xf) * 180 / Math.PI) + 540) % 360 - 180;
    return { lat, lon, alt: sat.altitude, vKms: v, period };
  }

  function propagate3D(sat, simMs) {
    const r = EARTH_R + sat.altitude;
    const period = 2 * Math.PI * Math.sqrt((r * r * r) / MU);
    const v = Math.sqrt(MU / r);
    const dtSec = (simMs - sat.epochMs) / 1000;
    const M = ((sat.phase * Math.PI / 180) + (2 * Math.PI * dtSec / period)) % (2 * Math.PI);
    const incl = sat.inclination * Math.PI / 180;
    const raan = sat.raan * Math.PI / 180;
    const xp = r * Math.cos(M), yp = r * Math.sin(M);
    const xi = xp, yi = yp * Math.cos(incl), zi = yp * Math.sin(incl);
    const xe = xi * Math.cos(raan) - yi * Math.sin(raan);
    const ye = xi * Math.sin(raan) + yi * Math.cos(raan);
    const ze = zi;
    const gmst = (simMs / 1000) * (2 * Math.PI / 86164.0905);
    const xf = xe * Math.cos(gmst) + ye * Math.sin(gmst);
    const yf = -xe * Math.sin(gmst) + ye * Math.cos(gmst);
    const zf = ze;
    return { x: xf, y: yf, z: zf, r, alt: sat.altitude, vKms: v };
  }

  function groundTrack(sat, simMs, samples) {
    samples = samples || 180;
    const r = EARTH_R + sat.altitude;
    const period = 2 * Math.PI * Math.sqrt((r * r * r) / MU) * 1000;
    const out = [];
    for (let i = 0; i <= samples; i++) {
      out.push(propagate(sat, simMs - period / 2 + (period * i / samples)));
    }
    return out;
  }

  // ============================================================================
  // ESTADO
  // ============================================================================

  const state = {
    isLive: true,
    simTime: Date.now(),
    speed: 1,
    paused: false,
    selectedId: null,
    query: '',
    shellFilter: 'all',
    satCount: 0,
    showTrails: false,
    showGrid: true,
  };

  function getSatellites() {
    return ALL_SATS.slice(0, Math.min(state.satCount, ALL_SATS.length));
  }

  // ============================================================================
  // AUXILIARES DE PROYECCIÓN 3D
  // ============================================================================

  function projectSat3D(sat, simMs, view, Rpx, ox, oy) {
    const p = propagate3D(sat, simMs);
    const rotLatRad = view.rotLat * Math.PI / 180;
    const rotLonRad = view.rotLon * Math.PI / 180;
    const x1 = p.x * Math.cos(-rotLonRad) - p.y * Math.sin(-rotLonRad);
    const y1 = p.x * Math.sin(-rotLonRad) + p.y * Math.cos(-rotLonRad);
    const z1 = p.z;
    const x2 = x1 * Math.cos(rotLatRad) + z1 * Math.sin(rotLatRad);
    const z2 = -x1 * Math.sin(rotLatRad) + z1 * Math.cos(rotLatRad);
    const y2 = y1;
    const scale = Rpx / EARTH_R;
    const sx = ox + y2 * scale;
    const sy = oy - z2 * scale;
    const front = x2 >= 0;
    const occluded = !front && Math.hypot(sx - ox, sy - oy) < Rpx * 0.99;
    return { x: sx, y: sy, front, visible: !occluded };
  }

  function projectLatLonAlt(lat, lon, altKm, view, Rpx, ox, oy) {
    const r = EARTH_R + altKm;
    const latRad = lat * Math.PI / 180, lonRad = lon * Math.PI / 180;
    const xe = r * Math.cos(latRad) * Math.cos(lonRad);
    const ye = r * Math.cos(latRad) * Math.sin(lonRad);
    const ze = r * Math.sin(latRad);
    const rotLatRad = view.rotLat * Math.PI / 180;
    const rotLonRad = view.rotLon * Math.PI / 180;
    const x1 = xe * Math.cos(-rotLonRad) - ye * Math.sin(-rotLonRad);
    const y1 = xe * Math.sin(-rotLonRad) + ye * Math.cos(-rotLonRad);
    const z1 = ze;
    const x2 = x1 * Math.cos(rotLatRad) + z1 * Math.sin(rotLatRad);
    const z2 = -x1 * Math.sin(rotLatRad) + z1 * Math.cos(rotLatRad);
    const y2 = y1;
    const scale = Rpx / EARTH_R;
    return { x: ox + y2 * scale, y: oy - z2 * scale, front: x2 >= 0, depth: x2 };
  }

  // ============================================================================
  // RENDERIZADO DEL GLOBO
  // ============================================================================

  const globeView = { rotLon: 30, rotLat: -10, zoom: 1.0 };
  const drag = { active: false, lastX: 0, lastY: 0, moved: false };
  let lastInteract = Date.now();
  let globeRaf = null;
  let globeSize = { w: 800, h: 800 };

  function drawFrame(ctx) {
    const { w, h } = globeSize;
    const ox = w / 2, oy = h / 2;
    const Rpx = Math.min(w, h) * 0.42 * globeView.zoom;
    const satellites = getSatellites();

    ctx.clearRect(0, 0, w, h);

    // Halo de atmósfera
    const halo = ctx.createRadialGradient(ox, oy, Rpx * 0.98, ox, oy, Rpx * 1.18);
    halo.addColorStop(0, 'rgba(120,160,200,0.12)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    // Disco terrestre
    ctx.beginPath();
    ctx.arc(ox, oy, Rpx, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0d10';
    ctx.fill();

    // Anillo de limbo
    ctx.beginPath();
    ctx.arc(ox, oy, Rpx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Graticule (red de coordenadas)
    if (state.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.7;
      for (let lat = -80; lat <= 80; lat += 10) drawParallel(ctx, lat, globeView, Rpx, ox, oy);
      for (let lon = 0; lon < 360; lon += 10) drawMeridian(ctx, lon, globeView, Rpx, ox, oy);
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 0.9;
      drawParallel(ctx, 0, globeView, Rpx, ox, oy);
      drawMeridian(ctx, 0, globeView, Rpx, ox, oy);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.7;
      drawParallel(ctx, 23.4, globeView, Rpx, ox, oy);
      drawParallel(ctx, -23.4, globeView, Rpx, ox, oy);
    }

    // Continentes — recortar al disco del globo para que cualquier cuerda en el horizonte quede dentro
    ctx.save();
    ctx.beginPath();
    ctx.arc(ox, oy, Rpx, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(35,40,46,0.95)';
    ctx.strokeStyle = 'rgba(140,150,160,0.55)';
    ctx.lineWidth = 0.7;
    for (const poly of LAND_POLYGONS) drawContinent(ctx, poly, globeView, Rpx, ox, oy);
    ctx.restore();

    // Huella de órbita + pin de plataforma de lanzamiento para el satélite seleccionado
    const sel = satellites.find(s => s.id === state.selectedId);
    if (sel) {
      const track = groundTrack(sel, state.simTime, 220);
      ctx.strokeStyle = 'rgba(255,196,80,0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let started = false;
      for (const p of track) {
        const proj = projectLatLonAlt(p.lat, p.lon, sel.altitude, globeView, Rpx, ox, oy);
        if (!proj.front) { started = false; continue; }
        if (!started) { ctx.moveTo(proj.x, proj.y); started = true; }
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.stroke();

      const padPos = projectLatLonAlt(sel.launchpad.lat, sel.launchpad.lon, 0, globeView, Rpx, ox, oy);
      if (padPos.front) {
        ctx.beginPath();
        ctx.arc(padPos.x, padPos.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,196,80,0.9)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(padPos.x, padPos.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffc450';
        ctx.fill();
      }
    }

    // Trazas de órbita (todos los satélites, cuando está activado)
    if (state.showTrails) {
      ctx.strokeStyle = 'rgba(255,90,60,0.10)';
      ctx.lineWidth = 0.5;
      for (const s of satellites) {
        if (s.id === state.selectedId) continue;
        const track = groundTrack(s, state.simTime, 50);
        ctx.beginPath();
        let started = false;
        for (const p of track) {
          const proj = projectLatLonAlt(p.lat, p.lon, s.altitude, globeView, Rpx, ox, oy);
          if (!proj.front) { started = false; continue; }
          if (!started) { ctx.moveTo(proj.x, proj.y); started = true; }
          else ctx.lineTo(proj.x, proj.y);
        }
        ctx.stroke();
      }
    }

    // Satélites — cuadrados rojos pequeños, frente brillante + lado trasero atenuado
    for (const s of satellites) {
      const proj = projectSat3D(s, state.simTime, globeView, Rpx, ox, oy);
      if (!proj.visible) continue;
      const isSel = s.id === state.selectedId;
      const sz = isSel ? 6 : 2.4;
      if (isSel) {
        ctx.strokeStyle = '#ffd040';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(proj.x - sz / 2, proj.y - sz / 2, sz, sz);
        ctx.fillStyle = 'rgba(255,208,64,0.25)';
        ctx.fillRect(proj.x - sz / 2, proj.y - sz / 2, sz, sz);
        ctx.font = '600 11px "JetBrains Mono", ui-monospace, monospace';
        ctx.fillStyle = '#ffd040';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.name, proj.x + 10, proj.y);
      } else {
        ctx.fillStyle = proj.front ? 'rgba(255,90,55,0.95)' : 'rgba(255,90,55,0.45)';
        ctx.fillRect(proj.x - sz / 2, proj.y - sz / 2, sz, sz);
      }
    }
  }

  function drawParallel(ctx, lat, view, Rpx, ox, oy) {
    ctx.beginPath();
    let started = false;
    for (let lon = -180; lon <= 180; lon += 3) {
      const p = projectLatLonAlt(lat, lon, 0, view, Rpx, ox, oy);
      if (!p.front) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  function drawMeridian(ctx, lon, view, Rpx, ox, oy) {
    ctx.beginPath();
    let started = false;
    for (let lat = -90; lat <= 90; lat += 2) {
      const p = projectLatLonAlt(lat, lon, 0, view, Rpx, ox, oy);
      if (!p.front) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // Agrega un anillo (como sub-trayectoria) al path actual del ctx, con recorte en el horizonte
  // (recorridos por arco de limbo en lugar de cortes por cuerda). Devuelve true si se añadió algo.
  function addRingSubpath(ctx, path, view, Rpx, ox, oy) {
    const n = path.length;
    if (n < 3) return false;
    const pts = new Array(n);
    let frontCount = 0;
    for (let i = 0; i < n; i++) {
      const [lon, lat] = path[i];
      pts[i] = projectLatLonAlt(lat, lon, 0, view, Rpx, ox, oy);
      if (pts[i].front) frontCount++;
    }
    if (frontCount === 0) return false;

    if (frontCount === n) {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      return true;
    }

    let startIdx = -1;
    for (let i = 0; i < n; i++) {
      if (!pts[i].front && pts[(i + 1) % n].front) { startIdx = i; break; }
    }
    if (startIdx === -1) return false;

    function arcAlongLimb(fromAngle, toAngle) {
      let dA = toAngle - fromAngle;
      while (dA > Math.PI) dA -= 2 * Math.PI;
      while (dA < -Math.PI) dA += 2 * Math.PI;
      const steps = Math.max(2, Math.ceil(Math.abs(dA) * 48 / Math.PI));
      for (let s = 1; s <= steps; s++) {
        const aa = fromAngle + dA * s / steps;
        ctx.lineTo(ox + Rpx * Math.cos(aa), oy + Rpx * Math.sin(aa));
      }
    }

    let firstEntryAngle = null;
    let lastExitAngle = null;
    let started = false;

    for (let k = 0; k < n; k++) {
      const i = (startIdx + k) % n;
      const cur = pts[i];
      const next = pts[(i + 1) % n];

      if (cur.front) {
        if (!started) { ctx.moveTo(cur.x, cur.y); started = true; }
        else ctx.lineTo(cur.x, cur.y);

        if (!next.front) {
          const t = cur.depth / (cur.depth - next.depth);
          const lx = cur.x + (next.x - cur.x) * t;
          const ly = cur.y + (next.y - cur.y) * t;
          ctx.lineTo(lx, ly);
          lastExitAngle = Math.atan2(ly - oy, lx - ox);
        }
      } else if (next.front) {
        const t = cur.depth / (cur.depth - next.depth);
        const lx = cur.x + (next.x - cur.x) * t;
        const ly = cur.y + (next.y - cur.y) * t;
        const enterAngle = Math.atan2(ly - oy, lx - ox);

        if (lastExitAngle !== null && started) {
          arcAlongLimb(lastExitAngle, enterAngle);
        } else {
          ctx.moveTo(lx, ly);
          started = true;
          if (firstEntryAngle === null) firstEntryAngle = enterAngle;
        }
        lastExitAngle = null;
      }
    }

    if (lastExitAngle !== null && firstEntryAngle !== null) {
      arcAlongLimb(lastExitAngle, firstEntryAngle);
    }
    ctx.closePath();
    return true;
  }

  // Renderiza un polígono = anillo exterior + cero o más agujeros, usando relleno par-impar
  // para que los anillos interiores (ej. el Mar Caspio) se recorten limpiamente de la masa terrestre.
  function drawContinent(ctx, polygon, view, Rpx, ox, oy) {
    ctx.beginPath();
    let any = false;
    for (const ring of polygon) {
      if (addRingSubpath(ctx, ring, view, Rpx, ox, oy)) any = true;
    }
    if (!any) return;
    ctx.fill('evenodd');
    ctx.stroke();
  }

  // ============================================================================
  // FUNCIONES DE ACTUALIZACIÓN DE INTERFAZ
  // ============================================================================

  // Agregados derivados de la base de datos de misiones, usados para manejar los paneles HUD.
  function computeDbStats() {
    const now = Date.now();
    const total = MISSIONS.length;
    const byStatus = { programado: 0, confirmado: 0, hold: 0, cancelado: 0 };
    const byProgram = {};
    const byDestin = {};
    const byVehicle = {};
    const byPort = {};
    let totalCargoT = 0;
    let totalCrew = 0;
    let upcomingCount = 0;
    let nextLaunchMs = Infinity;
    let nextLaunch = null;

    for (const m of MISSIONS) {
      const status = (m.status || 'programado').toLowerCase();
      byStatus[status] = (byStatus[status] || 0) + 1;
      if (m.program) byProgram[m.program] = (byProgram[m.program] || 0) + 1;

      const launches = (m.launches && m.launches.length)
        ? m.launches
        : [{ port: m.port, launchDate: m.launchDate, destination: m.destination }];

      for (const l of launches) {
        if (l.destination) byDestin[l.destination] = (byDestin[l.destination] || 0) + 1;
        if (l.booster) byVehicle[l.booster] = (byVehicle[l.booster] || 0) + 1;
        if (l.port || m.port) {
          const p = l.port || m.port;
          byPort[p] = (byPort[p] || 0) + 1;
        }
        totalCargoT += parseCargoMass(l.cargoMass);
        totalCrew += parseCrew((l.advancedConfig || {}).crew);

        const t = new Date(l.launchDate || m.launchDate).getTime();
        if (Number.isFinite(t) && t > now && status !== 'cancelado') {
          upcomingCount++;
          if (t < nextLaunchMs) {
            nextLaunchMs = t;
            nextLaunch = { name: m.name || 'Misión', destination: l.destination, t };
          }
        }
      }
    }

    return {
      total, byStatus, byProgram, byDestin, byVehicle, byPort,
      totalCargoT, totalCrew, upcomingCount, nextLaunch,
      programs: Object.keys(byProgram).length,
      destinations: Object.keys(byDestin).length,
      ports: Object.keys(byPort).length,
    };
  }

  function updateUpdatedTag() {
    const el = document.getElementById('tr-updated-num');
    if (!el) return;
    const ageS = Math.max(0, Math.floor((Date.now() - state.simTime) / 1000));
    const fwd = state.simTime > Date.now();
    el.textContent = fwd
      ? `+${Math.abs(Math.floor((state.simTime - Date.now()) / 1000))}s`
      : `${ageS}s`;
  }

  function updateSelectionReadout() {
    const el = document.getElementById('tr-sel-readout');
    if (!el) return;
    const sat = getSatellites().find(s => s.id === state.selectedId);
    if (!sat) {
      el.className = 'tr-sel-readout tr-sel-readout-empty';
      el.innerHTML = `
      <div class="tr-sr-row"><span class="tr-sk">Haz clic en un satélite</span></div>
      <div class="tr-sr-row tr-sr-hint">Arrastra para rotar · Scroll para zoom</div>`;
      return;
    }
    const p = propagate(sat, state.simTime);
    el.className = 'tr-sel-readout';
    el.innerHTML = `
    <div class="tr-sr-row"><span class="tr-sk">Nombre:</span><span class="tr-sv">${sat.name}</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Misión:</span><span class="tr-sv">${sat.batch}</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Vehículo:</span><span class="tr-sv">${vehicleLabel(sat.ship)} / ${vehicleLabel(sat.booster)}</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Carga:</span><span class="tr-sv">${sat.cargoMassT.toFixed(2)} t</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Órbita:</span><span class="tr-sv">${sat.altitudeLow} × ${sat.altitudeHigh}, ${sat.inclination.toFixed(2)}°</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Posición:</span><span class="tr-sv">${p.lat.toFixed(2)}°, ${p.lon.toFixed(2)}°</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Velocidad:</span><span class="tr-sv">${p.vKms.toFixed(2)} km/s</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Lanzamiento:</span><span class="tr-sv">${sat.launchDate}</span></div>
    <div class="tr-sr-row"><span class="tr-sk">Plataforma:</span><span class="tr-sv">${sat.launchpad.name}</span></div>`;
  }

  function updateTimeControl() {
    document.querySelectorAll('.tr-tc-btn').forEach(btn => {
      const spd = btn.dataset.speed;
      const active = spd === 'live'
        ? state.isLive
        : !state.isLive && state.speed === Number(spd) && !state.paused;
      btn.classList.toggle('tr-tc-btn-on', active);
    });
  }

  function updateConstellationPanel() {
    const el = document.getElementById('tr-body-01');
    if (!el) return;
    const satellites = getSatellites();
    const stats = computeDbStats();

    // Distribución por shell en la flota Starlink activa.
    const byShell = {};
    for (const s of satellites) {
      const k = s.shell || 'Shell ?';
      byShell[k] = (byShell[k] || 0) + 1;
    }
    const shellEntries = Object.entries(byShell).sort((a, b) => b[1] - a[1]);
    const maxShellCt = shellEntries.length ? shellEntries[0][1] : 1;
    let shellBars = '';
    for (const [name, ct] of shellEntries) {
      const pct = (ct / maxShellCt) * 100;
      shellBars += `
      <div class="tr-shell-bar-row">
        <div class="tr-shell-bar-head">
          <span>${name}</span>
          <span class="tr-shell-bar-ct">${ct}</span>
        </div>
        <div class="tr-shell-bar-track"><div class="tr-shell-bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
      </div>`;
    }
    if (!shellBars) shellBars = '<div class="tr-sat-empty">Sin satélites Starlink en seguimiento</div>';

    el.innerHTML = `
    <div class="tr-stats-panel">
      <div class="tr-stat-row"><span>MISIONES</span><span class="tr-stat-v">${stats.total}</span></div>
      <div class="tr-stat-row"><span>SHELLS</span><span class="tr-stat-v">${shellEntries.length}</span></div>
      <div class="tr-stat-row"><span>PUERTOS USADOS</span><span class="tr-stat-v">${stats.ports}</span></div>
      <div class="tr-stat-row"><span>OBJ EN SEGUIMIENTO</span><span class="tr-stat-v">${satellites.length}</span></div>
      <div class="tr-stats-divider"></div>
      <div class="tr-stats-sub">DISTRIBUCIÓN POR SHELL</div>
      ${shellBars}
    </div>`;
  }

  function updateTelemetryPanel() {
    const el = document.getElementById('tr-body-02');
    if (!el) return;
    const sel = getSatellites().find(s => s.id === state.selectedId);
    const utc = new Date(state.simTime).toUTCString().replace('GMT', 'UTC');
    const stats = computeDbStats();

    // Próximo lanzamiento desde la base de datos.
    let nextLine = '—';
    if (stats.nextLaunch) {
      const eta = formatLaunchEta(stats.nextLaunch.t - Date.now());
      nextLine = `T${eta} · ${stats.nextLaunch.name}`;
    }

    let tracking = '';
    if (sel) {
      const p = propagate(sel, state.simTime);
      tracking = `
      <div class="tr-stats-divider"></div>
      <div class="tr-stats-sub">SEGUIMIENTO · ${sel.name}</div>
      <div class="tr-telem-row"><span>MISIÓN</span><span class="tr-telem-v">${sel.batch}</span></div>
      <div class="tr-telem-row"><span>ESTADO</span><span class="tr-telem-v">${(sel.status || '—').toUpperCase()}</span></div>
      <div class="tr-telem-row"><span>VEHÍCULO</span><span class="tr-telem-v">${vehicleLabel(sel.ship)} / ${vehicleLabel(sel.booster)}</span></div>
      <div class="tr-telem-row"><span>CARGA</span><span class="tr-telem-v">${sel.cargoType || '—'} · ${sel.cargoMassT.toFixed(2)} t</span></div>
      <div class="tr-telem-row"><span>TRIPULACIÓN</span><span class="tr-telem-v">${sel.crewCount}</span></div>
      <div class="tr-telem-row"><span>FECHA</span><span class="tr-telem-v">${sel.launchDate}</span></div>
      <div class="tr-telem-row"><span>RAAN</span><span class="tr-telem-v">${sel.raan.toFixed(2)}°</span></div>
      <div class="tr-telem-row"><span>ALT</span><span class="tr-telem-v">${sel.altitude} km</span></div>
      <div class="tr-telem-row"><span>VELOCIDAD</span><span class="tr-telem-v">${p.vKms.toFixed(2)} km/s</span></div>`;
    }

    el.innerHTML = `
    <div class="tr-telem-panel">
      <div class="tr-telem-row"><span>HORA SIM</span><span class="tr-telem-v">${utc}</span></div>
      <div class="tr-telem-row"><span>MARCO</span><span class="tr-telem-v">ECEF / WGS-84</span></div>
      <div class="tr-telem-row"><span>PROPAGADOR</span><span class="tr-telem-v">SGP4-LITE</span></div>
      <div class="tr-stats-divider"></div>
      <div class="tr-stats-sub">BASE DE DATOS</div>
      <div class="tr-telem-row"><span>MISIONES TOTAL</span><span class="tr-telem-v">${stats.total}</span></div>
      <div class="tr-telem-row"><span>PRÓXIMOS</span><span class="tr-telem-v">${stats.upcomingCount}</span></div>
      <div class="tr-telem-row"><span>PRÓXIMO LANZAMIENTO</span><span class="tr-telem-v">${nextLine}</span></div>
      <div class="tr-telem-row"><span>CARGA TOTAL</span><span class="tr-telem-v">${stats.totalCargoT.toFixed(2)} t</span></div>
      <div class="tr-telem-row"><span>TRIPULACIÓN TOTAL</span><span class="tr-telem-v">${stats.totalCrew}</span></div>
      ${tracking}
    </div>`;
  }

  function buildSearchPanel(el) {
    const shellKeys = Object.keys(STARLINK_SHELLS);
    let chips = `<button class="tr-chip tr-chip-on" data-shell="all">TODOS</button>`;
    for (const k of shellKeys) {
      chips += `<button class="tr-chip" data-shell="${k}">${k.replace('Shell ', 'S')}</button>`;
    }

    el.innerHTML = `
    <input class="tr-rail-search" id="tr-search-input" placeholder="NOMBRE / SHELL…">
    <div class="tr-filter-chips" id="tr-filter-chips">${chips}</div>
    <div class="tr-search-meta" id="tr-search-meta"></div>
    <div class="tr-sat-list" id="tr-sat-list"></div>`;

    document.getElementById('tr-search-input').addEventListener('input', e => {
      state.query = e.target.value;
      updateSearchList();
    });

    document.getElementById('tr-filter-chips').addEventListener('click', e => {
      const btn = e.target.closest('.tr-chip');
      if (!btn) return;
      state.shellFilter = btn.dataset.shell;
      document.querySelectorAll('#tr-filter-chips .tr-chip').forEach(c => c.classList.remove('tr-chip-on'));
      btn.classList.add('tr-chip-on');
      updateSearchList();
    });

    el.dataset.initialized = '1';
    updateSearchList();
  }

  function updateSearchList() {
    const list = document.getElementById('tr-sat-list');
    const meta = document.getElementById('tr-search-meta');
    if (!list) return;

    const satellites = getSatellites();
    const q = state.query.toLowerCase();
    const filtered = satellites.filter(s => {
      if (state.shellFilter !== 'all' && s.shell !== state.shellFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q)
        || s.batch.toLowerCase().includes(q)
        || s.shell.toLowerCase().includes(q);
    });

    if (meta) meta.textContent = `${filtered.length} / ${satellites.length} OBJETOS`;

    const shown = filtered.slice(0, 100);
    let html = '';
    for (const s of shown) {
      const p = propagate(s, state.simTime);
      const isSel = state.selectedId === s.id;
      html += `<div class="tr-sat-row${isSel ? ' tr-sat-row-sel' : ''}" data-satid="${s.id}">
      <div>
        <div class="tr-sat-row-name">${s.name}</div>
        <div class="tr-sat-row-meta">${s.batch} · ${s.shell.replace('Shell ', 'S')} · ${s.inclination.toFixed(1)}°</div>
      </div>
      <div class="tr-sat-row-coord">${Math.abs(p.lat).toFixed(1)}°${p.lat >= 0 ? 'N' : 'S'}<br>${Math.abs(p.lon).toFixed(1)}°${p.lon >= 0 ? 'E' : 'W'}</div>
    </div>`;
    }
    if (!shown.length) html = '<div class="tr-sat-empty">Sin resultados</div>';
    list.innerHTML = html;

    list.querySelectorAll('.tr-sat-row').forEach(row => {
      row.addEventListener('click', () => {
        state.selectedId = row.dataset.satid;
        updateSelectionReadout();
        updateSearchList();
      });
    });
  }

  function renderUpcomingPanel() {
    const el = document.getElementById('tr-body-04');
    if (!el) return;
    // Actualizar strings de ETA desde el tiempo actual
    const now = Date.now();
    for (const u of UPCOMING_LAUNCHES) {
      if (u.launchDateMs) u.eta = formatLaunchEta(u.launchDateMs - now);
    }
    let html = '<div class="tr-upcoming-panel">';
    if (!UPCOMING_LAUNCHES.length) {
      html += '<div class="tr-sat-empty">Sin próximos lanzamientos</div>';
    } else {
      for (const u of UPCOMING_LAUNCHES) {
        const meta = [
          u.pad,
          u.cargoType || null,
          u.cargoMassT > 0 ? `${u.cargoMassT.toFixed(1)}t` : null,
          u.crewCount > 0 ? `${u.crewCount} tripulantes` : null,
        ].filter(Boolean).join(' · ');
        html += `
        <div class="tr-upcoming-row">
          <div>
            <div class="tr-upcoming-name">${u.mission}</div>
            <div class="tr-upcoming-meta">${meta}</div>
          </div>
          <div class="tr-upcoming-eta">T${u.eta}</div>
        </div>`;
      }
    }
    el.innerHTML = html + '</div>';
    el.dataset.initialized = '1';
  }

  function updateIdStrip() {
    const sats = getSatellites();
    const stats = computeDbStats();
    const total = document.getElementById('tr-sat-total');
    const strip = document.getElementById('tr-obj-count');
    const db = document.getElementById('tr-strip-db');
    const tag = document.getElementById('tr-strip-tag');
    if (total) total.textContent = sats.length;
    if (strip) strip.textContent = `${sats.length} OBJ EN SEGUIMIENTO`;
    if (db) {
      const shellsCount = Object.keys(STARLINK_SHELLS || {}).length;
      db.textContent = `${stats.total} MISIONES · ${shellsCount} SHELLS · ${stats.upcomingCount} PRÓXIMOS`;
    }
    const upCt = document.getElementById('tr-upcoming-count');
    if (upCt) upCt.textContent = UPCOMING_LAUNCHES.length;
    if (tag) {
      const live = state.isLive ? 'LIVE' : (state.paused ? 'PAUSADO' : `${state.speed > 0 ? '+' : ''}${state.speed}×`);
      tag.textContent = `TIERRA · STARLINK · ${live}`;
    }
  }

  // ============================================================================
  // MANEJADOR DE CLIC EN EL GLOBO
  // ============================================================================

  function handleGlobeClick(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const { w, h } = globeSize;
    const Rpx = Math.min(w, h) * 0.42 * globeView.zoom;
    const ox = w / 2, oy = h / 2;
    const satellites = getSatellites();
    let best = null, bestDist = 16;
    for (const s of satellites) {
      const proj = projectSat3D(s, state.simTime, globeView, Rpx, ox, oy);
      if (!proj.front) continue;
      const d = Math.hypot(proj.x - cx, proj.y - cy);
      if (d < bestDist) { bestDist = d; best = s.id; }
    }
    state.selectedId = best;
    updateSelectionReadout();
    updateSearchList();
  }

  // ============================================================================
  // INICIALIZACIÓN DE PÁGINA
  // ============================================================================

  window.initConstelacionPage = function () {
    // Detener cualquier loop de animación previo
    if (globeRaf) { cancelAnimationFrame(globeRaf); globeRaf = null; }

    // Detectar si estamos corriendo dentro del viewport compartido de ScrollTransition.
    // En ese modo el encabezado permanece visible y el desmontaje es gestionado por ScrollTransition,
    // por lo que omitimos la clase body de pantalla completa y el binding de limpieza en hashchange.
    const stagePeek = document.getElementById('constelacion-stage');
    const inScrollMode = !!(stagePeek && stagePeek.closest('.scroll-section'));

    if (!inScrollMode) {
      document.body.classList.add('constelacion-active');
    }

    // Reiniciar estado de la página
    state.isLive = true;
    state.simTime = Date.now();
    state.speed = 1;
    state.paused = false;
    state.selectedId = null;
    state.query = '';
    state.shellFilter = 'all';
    globeView.rotLon = 30;
    globeView.rotLat = -10;
    globeView.zoom = 1.0;
    lastInteract = Date.now();

    const canvas = document.getElementById('constelacion-canvas');
    const stage = document.getElementById('constelacion-stage');
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d');

    // ── Redimensionado del canvas ──────────────────────────────────────────────
    let ro = null;
    function applySize() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      globeSize = { w, h };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(applySize);
      ro.observe(stage);
    }
    applySize();

    // ── Eventos de puntero / rueda ─────────────────────────────────────────────
    canvas.addEventListener('pointerdown', e => {
      drag.active = true;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      drag.moved = false;
      canvas.setPointerCapture(e.pointerId);
      lastInteract = Date.now();
    });

    canvas.addEventListener('pointermove', e => {
      if (!drag.active) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      globeView.rotLon = (globeView.rotLon - dx * 0.25) % 360;
      globeView.rotLat = Math.max(-89, Math.min(89, globeView.rotLat + dy * 0.25));
      lastInteract = Date.now();
    });

    canvas.addEventListener('pointerup', e => {
      const wasDrag = drag.moved;
      drag.active = false;
      canvas.releasePointerCapture(e.pointerId);
      if (!wasDrag) handleGlobeClick(e, canvas);
    });

    canvas.addEventListener('pointercancel', () => { drag.active = false; });

    // Período de gracia tras activarse la sección: una rueda que terminó una
    // transición de sección hacia la constelación no debe interpretarse como zoom.
    let zoomReadyAt = Date.now() + 600;
    const bodyObserver = new MutationObserver(() => {
      if (document.body.classList.contains('constelacion-active')) {
        zoomReadyAt = Date.now() + 600;
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      // Evitar que la rueda también se interprete como transición de sección por ScrollTransition.
      e.stopPropagation();
      if (Date.now() < zoomReadyAt) return;
      globeView.zoom = Math.max(0.6, Math.min(3.5, globeView.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
      lastInteract = Date.now();
    }, { passive: false });

    // Bloquear el scroll para que no salga del stage de constelación, de modo que ScrollTransition
    // no avance a la siguiente sección mientras el usuario está en esta vista.
    stage.addEventListener('wheel', e => {
      e.stopPropagation();
      if (e.target === canvas) return;
      e.preventDefault();
    }, { passive: false });

    // ── Botones de control de tiempo ───────────────────────────────────────────
    document.querySelectorAll('.tr-tc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const spd = btn.dataset.speed;
        if (spd === 'live') {
          state.isLive = true;
          state.speed = 1;
          state.paused = false;
        } else {
          state.isLive = false;
          state.speed = Number(spd);
          state.paused = false;
        }
        updateTimeControl();
      });
    });

    // ── Toggles de paneles desplegables ────────────────────────────────────────
    document.querySelectorAll('.tr-dp-head').forEach(head => {
      head.addEventListener('click', () => {
        const bodyId = head.dataset.panel;
        const body = document.getElementById(bodyId);
        const chev = head.querySelector('.tr-dp-chev');
        const panel = head.closest('.tr-drop-panel');
        if (!body) return;

        const opening = body.style.display === 'none';
        body.style.display = opening ? 'block' : 'none';
        if (chev) chev.textContent = opening ? '▾' : '▸';
        if (panel) panel.classList.toggle('tr-drop-panel-open', opening);

        if (opening) {
          if (bodyId === 'tr-body-01') updateConstellationPanel();
          if (bodyId === 'tr-body-02') updateTelemetryPanel();
          if (bodyId === 'tr-body-03' && !body.dataset.initialized) buildSearchPanel(body);
          if (bodyId === 'tr-body-04') renderUpcomingPanel();
        }
      });
    });

    // ── Renderizados estáticos iniciales ───────────────────────────────────────
    updateIdStrip();
    updateSelectionReadout();
    updateTimeControl();

    // ── Cargar polígonos de tierra de alta resolución (Natural Earth 110m) ─────
    loadLandData();

    // ── Cargar datos de misión y reconstruir constelación + próximos lanzamientos
    function applyMissions(missions) {
      rebuildConstellationFromMissions(missions);
      updateIdStrip();
      updateSelectionReadout();
      const c01 = document.getElementById('tr-body-01');
      if (c01 && c01.style.display !== 'none') updateConstellationPanel();
      const c04 = document.getElementById('tr-body-04');
      if (c04 && c04.dataset.initialized) renderUpcomingPanel();
      const c03 = document.getElementById('tr-body-03');
      if (c03 && c03.style.display !== 'none') updateSearchList();
    }

    let unsubMissions = null;
    if (window.MissionService) {
      window.MissionService.getAllMissions().then(applyMissions).catch(() => { });
      if (typeof window.MissionService.subscribe === 'function') {
        unsubMissions = window.MissionService.subscribe(() => {
          applyMissions(window.MissionService.getAllMissionsSync());
        });
      }
    }

    // ── Loop de animación ──────────────────────────────────────────────────────
    let lastTickMs = performance.now();
    let lastSearchMs = 0;
    let lastTelemMs = 0;

    function tick(now) {
      const dt = now - lastTickMs;
      lastTickMs = now;

      // Avanzar tiempo de simulación
      if (state.isLive) {
        state.simTime = Date.now();
      } else if (!state.paused) {
        state.simTime += dt * state.speed;
      }

      // Auto-rotar cuando hay inactividad (y no hay satélite seleccionado)
      if (Date.now() - lastInteract > 2500 && !state.selectedId) {
        globeView.rotLon = (globeView.rotLon + dt / 1000 * 4) % 360;
      }

      // Dibujar globo
      drawFrame(ctx);

      // Actualizaciones de UI en vivo
      updateUpdatedTag();
      updateSelectionReadout();

      // Actualizaciones de paneles con throttle
      const nowMs = Date.now();
      if (nowMs - lastSearchMs > 2000) {
        updateSearchList();
        lastSearchMs = nowMs;
      }
      if (nowMs - lastTelemMs > 1000) {
        const telemBody = document.getElementById('tr-body-02');
        if (telemBody && telemBody.style.display !== 'none') updateTelemetryPanel();
        lastTelemMs = nowMs;
      }

      globeRaf = requestAnimationFrame(tick);
    }
    globeRaf = requestAnimationFrame(tick);

    // ── Limpieza al navegar fuera ──────────────────────────────────────────────
    function cleanup() {
      if (!inScrollMode) document.body.classList.remove('constelacion-active');
      if (globeRaf) { cancelAnimationFrame(globeRaf); globeRaf = null; }
      if (ro) ro.disconnect();
      if (bodyObserver) bodyObserver.disconnect();
      if (unsubMissions) { unsubMissions(); unsubMissions = null; }
      window.removeEventListener('hashchange', cleanup);
      if (window._constelacionCleanup === cleanup) window._constelacionCleanup = null;
    }
    if (inScrollMode) {
      // ScrollTransition.destroy() invocará esto al salir del modo scroll completamente.
      window._constelacionCleanup = cleanup;
    } else {
      window.addEventListener('hashchange', cleanup);
    }
  };

})();
