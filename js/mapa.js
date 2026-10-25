// mapa.js - datos puros, sin dependencia de Phaser
// Especificación 01: mapa en grilla

const ANCHO = 24;
const ALTO = 16;

// Tipos de celda
const TIPO = {
  TIERRA: 'tierra',
  PASTO_ALTO: 'pasto_alto',
  BARRO: 'barro',
  ZONA_EXPUESTA: 'expuesta',
  PIEDRA: 'piedra'
};

// Matriz del mapa
const mapa = [];
for (let y = 0; y < ALTO; y++) {
  mapa[y] = [];
  for (let x = 0; x < ANCHO; x++) {
    mapa[y][x] = { tipo: TIPO.TIERRA, costo: 1 };
  }
}

// Posición del hormiguero y comida
const hormiguero = { x: 2, y: 2 };
const fuentesComida = [];

// Inicializar mapa de prueba fijo (mutar en el lugar)
function inicializarMapaPrueba() {
  // Limpiar matriz
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) {
      if (x === 0 || x === ANCHO - 1 || y === 0 || y === ALTO - 1) {
        mapa[y][x].tipo = TIPO.PIEDRA;
        mapa[y][x].costo = 0;
      } else {
        mapa[y][x].tipo = TIPO.TIERRA;
        mapa[y][x].costo = 1;
      }
    }
  }

  // Pasto alto
  if (ANCHO > 10 && ALTO > 5) {
    mapa[5][10].tipo = TIPO.PASTO_ALTO; mapa[5][10].costo = 3;
    mapa[5][11].tipo = TIPO.PASTO_ALTO; mapa[5][11].costo = 3;
    mapa[6][10].tipo = TIPO.PASTO_ALTO; mapa[6][10].costo = 3;
  }

  // Barro
  if (ANCHO > 15 && ALTO > 8) {
    mapa[8][15].tipo = TIPO.BARRO; mapa[8][15].costo = 5;
    mapa[8][16].tipo = TIPO.BARRO; mapa[8][16].costo = 5;
    mapa[9][15].tipo = TIPO.BARRO; mapa[9][15].costo = 5;
  }

  // Franja de barro entre hormiguero y comida para ver diferencia BFS vs Dijkstra/A*
  if (ANCHO > 14 && ALTO > 6) {
    mapa[6][10].tipo = TIPO.TIERRA; mapa[6][10].costo = 1;
    mapa[6][11].tipo = TIPO.TIERRA; mapa[6][11].costo = 1;
    mapa[6][12].tipo = TIPO.TIERRA; mapa[6][12].costo = 1;
    mapa[6][13].tipo = TIPO.TIERRA; mapa[6][13].costo = 1;
    mapa[7][10].tipo = TIPO.TIERRA; mapa[7][10].costo = 1;
    mapa[7][11].tipo = TIPO.TIERRA; mapa[7][11].costo = 1;
    mapa[7][12].tipo = TIPO.TIERRA; mapa[7][12].costo = 1;
    mapa[7][13].tipo = TIPO.TIERRA; mapa[7][13].costo = 1;
    mapa[8][10].tipo = TIPO.BARRO; mapa[8][10].costo = 5;
    mapa[8][11].tipo = TIPO.BARRO; mapa[8][11].costo = 5;
    mapa[8][12].tipo = TIPO.BARRO; mapa[8][12].costo = 5;
    mapa[8][13].tipo = TIPO.BARRO; mapa[8][13].costo = 5;
    mapa[9][10].tipo = TIPO.BARRO; mapa[9][10].costo = 5;
    mapa[9][11].tipo = TIPO.BARRO; mapa[9][11].costo = 5;
    mapa[9][12].tipo = TIPO.BARRO; mapa[9][12].costo = 5;
    mapa[9][13].tipo = TIPO.BARRO; mapa[9][13].costo = 5;
    fuentesComida.length = 0;
    fuentesComida.push({ x: 12, y: 10, porciones: 3 });
    fuentesComida.push({ x: 20, y: 5, porciones: 2 });
  } else {
    fuentesComida.length = 0;
    fuentesComida.push({ x: 20, y: 5, porciones: 3 });
    fuentesComida.push({ x: 5, y: 12, porciones: 2 });
  }

  // Zona expuesta
  if (ANCHO > 12 && ALTO > 10) {
    mapa[11][12].tipo = TIPO.ZONA_EXPUESTA; mapa[11][12].costo = 1;
    mapa[11][13].tipo = TIPO.ZONA_EXPUESTA; mapa[11][13].costo = 1;
    mapa[12][12].tipo = TIPO.ZONA_EXPUESTA; mapa[12][12].costo = 1;
  }

  // Algunas piedras internas
  if (ANCHO > 8 && ALTO > 7) {
    mapa[7][8].tipo = TIPO.PIEDRA; mapa[7][8].costo = 0;
  }

  // Hormiguero
  hormiguero.x = 2;
  hormiguero.y = 2;
}

// Funciones puras
function esTransitable(x, y) {
  if (x < 0 || x >= ANCHO || y < 0 || y >= ALTO) {
    return false;
  }
  if (!mapa[y]) return false;
  return mapa[y][x].tipo !== TIPO.PIEDRA;
}

function costo(x, y) {
  if (x < 0 || x >= ANCHO || y < 0 || y >= ALTO) {
    return Infinity;
  }
  if (!mapa[y]) return Infinity;
  if (mapa[y][x].tipo === TIPO.PIEDRA) {
    return Infinity;
  }
  return mapa[y][x].costo;
}

function vecinos(x, y) {
  const direcciones = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 }
  ];
  const resultado = [];
  for (let i = 0; i < direcciones.length; i++) {
    const nx = x + direcciones[i].dx;
    const ny = y + direcciones[i].dy;
    if (esTransitable(nx, ny)) {
      resultado.push({ x: nx, y: ny });
    }
  }
  return resultado;
}

// Inicializar al cargar
inicializarMapaPrueba();

// Exponer en window para probar desde consola
if (typeof window !== 'undefined') {
  window.ANCHO = ANCHO;
  window.ALTO = ALTO;
  window.TIPO = TIPO;
  window.mapa = mapa;
  window.hormiguero = hormiguero;
  window.fuentesComida = fuentesComida;
  window.esTransitable = esTransitable;
  window.costo = costo;
  window.vecinos = vecinos;
  window.inicializarMapaPrueba = inicializarMapaPrueba;
}
