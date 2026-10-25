// hormiga.js - estado lógico sin Phaser
// Especificación 03: movimiento de la hormiga

function crearHormiga(x, y) {
  return {
    casilla: { x: x, y: y },
    camino: [],
    indiceCamino: 0,
    destino: null,
    enMovimiento: false,
    pausado: false,
    velocidadSim: 1.0,
    // progreso del paso actual
    origenPaso: { x: x, y: y },
    objetivoPaso: { x: x, y: y },
    tPaso: 0,        // tiempo transcurrido del paso actual
    duracionPaso: 0, // tiempo total para el paso actual
    terminoPaso: false
  };
}

function obtenerTiempoPaso(casillaDestino, getCosto) {
  const costoFn = getCosto || ((typeof window !== 'undefined' && window.costo) ? window.costo : function() { return 1; });
  const c = costoFn(casillaDestino.x, casillaDestino.y);
  if (c === Infinity) return 1000000;
  const base = 250; // ms base
  return base * c;
}

function iniciarCamino(hormiga, camino) {
  if (!hormiga || !camino || camino.length === 0) {
    hormiga.camino = [];
    hormiga.indiceCamino = 0;
    hormiga.enMovimiento = false;
    return;
  }
  hormiga.camino = camino.slice();
  hormiga.indiceCamino = 0;
  hormiga.enMovimiento = true;
  hormiga.pausado = false;
  hormiga.tPaso = 0;
  hormiga.terminoPaso = false;
  // Empezar primer paso
  prepararSiguientePaso(hormiga);
}

function prepararSiguientePaso(hormiga) {
  if (!hormiga) return;
  if (!hormiga.enMovimiento) return;
  if (hormiga.indiceCamino >= hormiga.camino.length) {
    // llegó
    hormiga.enMovimiento = false;
    hormiga.tPaso = 0;
    hormiga.terminoPaso = true;
    return;
  }
  // Antes de empezar cada paso, tomar la siguiente casilla del camino
  const siguiente = hormiga.camino[hormiga.indiceCamino];
  hormiga.origenPaso = { x: hormiga.casilla.x, y: hormiga.casilla.y };
  hormiga.objetivoPaso = { x: siguiente.x, y: siguiente.y };
  const getCosto = (typeof window !== 'undefined' && window.costo) ? window.costo : function() { return 1; };
  hormiga.duracionPaso = obtenerTiempoPaso(siguiente, getCosto);
  hormiga.tPaso = 0;
  hormiga.terminoPaso = false;
  // si duracionPaso es 0 por alguna razón, forzar
  if (hormiga.duracionPaso <= 0) hormiga.duracionPaso = 1;
}

function actualizarHormiga(hormiga, deltaMs, getCosto) {
  if (!hormiga) return { movio: false, termino: false };
  if (hormiga.pausado) return { movio: false, termino: false };
  if (!hormiga.enMovimiento) return { movio: false, termino: false };
  if (hormiga.camino.length === 0) {
    hormiga.enMovimiento = false;
    return { movio: false, termino: false };
  }
  if (hormiga.indiceCamino >= hormiga.camino.length) {
    hormiga.enMovimiento = false;
    return { movio: false, termino: true };
  }

  const vel = hormiga.velocidadSim <= 0 ? 1.0 : hormiga.velocidadSim;
  hormiga.tPaso += deltaMs * vel;

  if (hormiga.tPaso >= hormiga.duracionPaso) {
    // Completar paso: posición lógica pasa a la casilla objetivo
    hormiga.casilla.x = hormiga.objetivoPaso.x;
    hormiga.casilla.y = hormiga.objetivoPaso.y;
    hormiga.indiceCamino++;
    if (hormiga.indiceCamino >= hormiga.camino.length) {
      hormiga.enMovimiento = false;
      hormiga.tPaso = 0;
      hormiga.terminoPaso = true;
      return { movio: true, termino: true, casilla: { x: hormiga.casilla.x, y: hormiga.casilla.y } };
    }
    // Preparar siguiente paso (tomar siguiente casilla del camino)
    prepararSiguientePaso(hormiga);
    return { movio: true, termino: false, casilla: { x: hormiga.casilla.x, y: hormiga.casilla.y } };
  }

  return { movio: true, termino: false, casilla: { x: hormiga.casilla.x, y: hormiga.casilla.y } };
}

function obtenerPosicionVisual(hormiga, tamanoTile) {
  // Interpolación visual entre centros, posición lógica sigue siendo casilla
  const t = tamanoTile || 32;
  if (!hormiga) return { x: 0, y: 0 };
  if (!hormiga.enMovimiento || hormiga.pausado) {
    return { x: hormiga.casilla.x * t + t / 2, y: hormiga.casilla.y * t + t / 2 };
  }
  if (hormiga.duracionPaso <= 0) {
    return { x: hormiga.casilla.x * t + t / 2, y: hormiga.casilla.y * t + t / 2 };
  }
  const vel = hormiga.velocidadSim <= 0 ? 1.0 : hormiga.velocidadSim;
  const prog = (hormiga.tPaso) / hormiga.duracionPaso;
  const p = prog < 0 ? 0 : (prog > 1 ? 1 : prog);
  const ox = hormiga.origenPaso.x * t + t / 2;
  const oy = hormiga.origenPaso.y * t + t / 2;
  const tx = hormiga.objetivoPaso.x * t + t / 2;
  const ty = hormiga.objetivoPaso.y * t + t / 2;
  return { x: ox + (tx - ox) * p, y: oy + (ty - oy) * p };
}

function getCaminoRestante(hormiga) {
  if (!hormiga || !hormiga.camino) return [];
  const res = [];
  for (let i = hormiga.indiceCamino; i < hormiga.camino.length; i++) {
    res.push({ x: hormiga.camino[i].x, y: hormiga.camino[i].y });
  }
  return res;
}

if (typeof window !== 'undefined') {
  window.crearHormiga = crearHormiga;
  window.obtenerTiempoPaso = obtenerTiempoPaso;
  window.iniciarCamino = iniciarCamino;
  window.actualizarHormiga = actualizarHormiga;
  window.obtenerPosicionVisual = obtenerPosicionVisual;
  window.getCaminoRestante = getCaminoRestante;
}
