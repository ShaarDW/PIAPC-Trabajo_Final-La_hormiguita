// busqueda.js - algoritmos puros, sin dependencia de Phaser
// Especificación 02: BFS, Dijkstra, A*

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function esZonasExpuesta(x, y) {
  if (typeof window === 'undefined') return false;
  if (!window.mapa || !window.mapa[y]) return false;
  return window.mapa[y][x] && window.mapa[y][x].tipo === 'expuesta';
}

function esVecinaZonaExpuesta(x, y) {
  if (typeof window === 'undefined') return false;
  if (!window.mapa) return false;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  for (let d = 0; d < dirs.length; d++) {
    const nx = x + dirs[d][0], ny = y + dirs[d][1];
    if (nx >= 0 && ny >= 0 && window.mapa[ny] && window.mapa[ny][nx] && window.mapa[ny][nx].tipo === 'expuesta') {
      return true;
    }
  }
  return false;
}

function costoDirecto(x, y) {
  if (typeof window !== 'undefined' && window.costo) {
    return window.costo(x, y);
  }
  return 1;
}

function costoSeguro(x, y, algoritmo) {
  if (typeof window === 'undefined') return 1;
  if (!window.mapa || !window.mapa[y]) return Infinity;
  if (window.mapa[y][x].tipo === 'piedra') return Infinity;
  if (window.esTransitable && !window.esTransitable(x, y)) return Infinity;
  if (algoritmo === 'bfs') {
    if (esZonasExpuesta(x, y)) return Infinity;
    return 1;
  }
  let c = (window.costo) ? window.costo(x, y) : 1;
  if (c === Infinity) return Infinity;
  if (esZonasExpuesta(x, y)) {
    c = c + 20;
  } else if (esVecinaZonaExpuesta(x, y)) {
    c = c + 5;
  }
  return c;
}

function bfs(inicio, destino, getCosto, algoritmo) {
  const algo = algoritmo || (typeof window !== 'undefined' && window.algoritmoActivo ? window.algoritmoActivo : 'bfs');
  const modo = (typeof window !== 'undefined' && window.modoNavegacion) ? window.modoNavegacion : 'directa';
  if (!inicio || !destino) return { camino: null, exploradas: [] };
  if (inicio.x === destino.x && inicio.y === destino.y) {
    return { camino: [{ x: inicio.x, y: inicio.y }], exploradas: [{ x: inicio.x, y: inicio.y }] };
  }
  if (typeof window !== 'undefined' && window.esTransitable) {
    if (!window.esTransitable(destino.x, destino.y)) {
      if (window.mapa && window.mapa[destino.y] && window.mapa[destino.y][destino.x] && window.mapa[destino.y][destino.x].tipo === 'piedra') {
        return { camino: null, exploradas: [] };
      }
    }
  }

  let usarCostoSeguro = false;
  if (modo === 'segura') usarCostoSeguro = true;

  const visitados = new Set();
  const padre = new Map();
  const cola = [];
  const exploradas = [];

  const keyInicio = inicio.x + ',' + inicio.y;
  visitados.add(keyInicio);
  cola.push({ x: inicio.x, y: inicio.y });
  padre.set(keyInicio, null);

  while (cola.length > 0) {
    const actual = cola.shift();
    exploradas.push({ x: actual.x, y: actual.y });
    if (actual.x === destino.x && actual.y === destino.y) break;
    const vecinos = (typeof window !== 'undefined' && window.vecinos) ? window.vecinos(actual.x, actual.y) : [];
    for (let i = 0; i < vecinos.length; i++) {
      const n = vecinos[i];
      const k = n.x + ',' + n.y;
      if (visitados.has(k)) continue;
      if (usarCostoSeguro) {
        const cc = costoSeguro(n.x, n.y, 'bfs');
        if (cc === Infinity) continue;
      }
      visitados.add(k);
      padre.set(k, actual.x + ',' + actual.y);
      cola.push(n);
    }
  }

  const keyDestino = destino.x + ',' + destino.y;
  if (!visitados.has(keyDestino)) {
    if (usarCostoSeguro) {
      // reintentar con costo directo
      if (typeof window !== 'undefined') window._bfsAvisoSeguro = true;
      // intentar con directo
      const res2 = bfsDirecto(inicio, destino);
      if (res2.camino) return res2;
      return { camino: null, exploradas: exploradas };
    }
    return { camino: null, exploradas: exploradas };
  }

  const camino = [];
  let cur = keyDestino;
  const temp = [];
  while (cur !== null) {
    const [cx, cy] = cur.split(',');
    temp.push({ x: parseInt(cx), y: parseInt(cy) });
    if (cur === keyInicio) break;
    cur = padre.get(cur);
  }
  temp.reverse();
  camino.push(...temp);
  return { camino: camino, exploradas: exploradas };
}

function bfsDirecto(inicio, destino) {
  if (!inicio || !destino) return { camino: null, exploradas: [] };
  if (inicio.x === destino.x && inicio.y === destino.y) {
    return { camino: [{ x: inicio.x, y: inicio.y }], exploradas: [{ x: inicio.x, y: inicio.y }] };
  }
  const visitados = new Set();
  const padre = new Map();
  const cola = [];
  const exploradas = [];
  const keyInicio = inicio.x + ',' + inicio.y;
  visitados.add(keyInicio);
  cola.push({ x: inicio.x, y: inicio.y });
  padre.set(keyInicio, null);
  while (cola.length > 0) {
    const actual = cola.shift();
    exploradas.push({ x: actual.x, y: actual.y });
    if (actual.x === destino.x && actual.y === destino.y) break;
    const vecinos = (typeof window !== 'undefined' && window.vecinos) ? window.vecinos(actual.x, actual.y) : [];
    for (let i = 0; i < vecinos.length; i++) {
      const n = vecinos[i];
      const k = n.x + ',' + n.y;
      if (!visitados.has(k)) {
        visitados.add(k);
        padre.set(k, actual.x + ',' + actual.y);
        cola.push(n);
      }
    }
  }
  const keyDestino = destino.x + ',' + destino.y;
  if (!visitados.has(keyDestino)) return { camino: null, exploradas: exploradas };
  const camino = [];
  let cur = keyDestino;
  const temp = [];
  while (cur !== null) {
    const [cx, cy] = cur.split(',');
    temp.push({ x: parseInt(cx), y: parseInt(cy) });
    if (cur === keyInicio) break;
    cur = padre.get(cur);
  }
  temp.reverse();
  camino.push(...temp);
  return { camino: camino, exploradas: exploradas };
}

function dijkstra(inicio, destino, getCosto, algoritmo) {
  const algo = algoritmo || (typeof window !== 'undefined' && window.algoritmoActivo ? window.algoritmoActivo : 'dijkstra');
  const modo = (typeof window !== 'undefined' && window.modoNavegacion) ? window.modoNavegacion : 'directa';
  if (!inicio || !destino) return { camino: null, exploradas: [] };
  if (inicio.x === destino.x && inicio.y === destino.y) {
    return { camino: [{ x: inicio.x, y: inicio.y }], exploradas: [{ x: inicio.x, y: inicio.y }] };
  }

  let costoFn;
  if (modo === 'segura') {
    costoFn = function(x,y) { return costoSeguro(x,y, algo); };
  } else {
    costoFn = getCosto || ((typeof window !== 'undefined' && window.costo) ? window.costo : () => 1);
  }

  const visitados = new Set();
  const dist = new Map();
  const padre = new Map();
  const exploradas = [];

  const keyInicio = inicio.x + ',' + inicio.y;
  dist.set(keyInicio, 0);
  padre.set(keyInicio, null);

  const open = [{ x: inicio.x, y: inicio.y, d: 0 }];
  visitados.add(keyInicio);

  while (open.length > 0) {
    let mejorIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].d < open[mejorIdx].d) mejorIdx = i;
    }
    const actual = open.splice(mejorIdx, 1)[0];
    const kActual = actual.x + ',' + actual.y;
    if (actual.x === destino.x && actual.y === destino.y) break;
    exploradas.push({ x: actual.x, y: actual.y });
    const vecinos = (typeof window !== 'undefined' && window.vecinos) ? window.vecinos(actual.x, actual.y) : [];
    for (let i = 0; i < vecinos.length; i++) {
      const n = vecinos[i];
      const kN = n.x + ',' + n.y;
      if (visitados.has(kN)) continue;
      const c = costoFn(n.x, n.y);
      if (c === Infinity) continue;
      const nd = actual.d + c;
      if (!dist.has(kN) || nd < dist.get(kN)) {
        dist.set(kN, nd);
        padre.set(kN, kActual);
        open.push({ x: n.x, y: n.y, d: nd });
      }
    }
  }

  const keyDestino = destino.x + ',' + destino.y;
  if (!padre.has(keyDestino)) {
    if (modo === 'segura') {
      if (typeof window !== 'undefined') window._bfsAvisoSeguro = true;
      return dijkstra(inicio, destino, getCosto, algo);
    }
    return { camino: null, exploradas: exploradas };
  }

  const camino = [];
  let cur = keyDestino;
  const temp = [];
  while (cur !== null) {
    const [cx, cy] = cur.split(',');
    temp.push({ x: parseInt(cx), y: parseInt(cy) });
    if (cur === keyInicio) break;
    cur = padre.get(cur);
  }
  if (temp.length === 0 || temp[temp.length - 1].x !== inicio.x || temp[temp.length - 1].y !== inicio.y) {
    return { camino: null, exploradas: exploradas };
  }
  temp.reverse();
  camino.push(...temp);
  return { camino: camino, exploradas: exploradas };
}

function astar(inicio, destino, getCosto, algoritmo) {
  const algo = algoritmo || (typeof window !== 'undefined' && window.algoritmoActivo ? window.algoritmoActivo : 'astar');
  const modo = (typeof window !== 'undefined' && window.modoNavegacion) ? window.modoNavegacion : 'directa';
  if (!inicio || !destino) return { camino: null, exploradas: [] };
  if (inicio.x === destino.x && inicio.y === destino.y) {
    return { camino: [{ x: inicio.x, y: inicio.y }], exploradas: [{ x: inicio.x, y: inicio.y }] };
  }

  let costoFn;
  if (modo === 'segura') {
    costoFn = function(x,y) { return costoSeguro(x,y, algo); };
  } else {
    costoFn = getCosto || ((typeof window !== 'undefined' && window.costo) ? window.costo : () => 1);
  }

  const visitados = new Set();
  const g = new Map();
  const padre = new Map();
  const exploradas = [];

  const keyInicio = inicio.x + ',' + inicio.y;
  const keyDestino = destino.x + ',' + destino.y;
  g.set(keyInicio, 0);
  padre.set(keyInicio, null);

  const open = [{ x: inicio.x, y: inicio.y, f: manhattan(inicio, destino), g: 0 }];
  visitados.add(keyInicio);

  while (open.length > 0) {
    let mejorIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[mejorIdx].f) mejorIdx = i;
    }
    const actual = open.splice(mejorIdx, 1)[0];
    const kActual = actual.x + ',' + actual.y;
    if (actual.x === destino.x && actual.y === destino.y) break;
    exploradas.push({ x: actual.x, y: actual.y });
    const vecinos = (typeof window !== 'undefined' && window.vecinos) ? window.vecinos(actual.x, actual.y) : [];
    for (let i = 0; i < vecinos.length; i++) {
      const n = vecinos[i];
      const kN = n.x + ',' + n.y;
      if (visitados.has(kN)) continue;
      const c = costoFn(n.x, n.y);
      if (c === Infinity) continue;
      const ng = actual.g + c;
      if (!g.has(kN) || ng < g.get(kN)) {
        g.set(kN, ng);
        padre.set(kN, kActual);
        open.push({ x: n.x, y: n.y, g: ng, f: ng + manhattan(n, destino) });
      }
    }
  }

  if (!padre.has(keyDestino)) {
    if (modo === 'segura') {
      if (typeof window !== 'undefined') window._bfsAvisoSeguro = true;
      return astar(inicio, destino, getCosto, algo);
    }
    return { camino: null, exploradas: exploradas };
  }

  const camino = [];
  let cur = keyDestino;
  const temp = [];
  while (cur !== null) {
    const [cx, cy] = cur.split(',');
    temp.push({ x: parseInt(cx), y: parseInt(cy) });
    if (cur === keyInicio) break;
    cur = padre.get(cur);
  }
  if (temp.length === 0 || temp[temp.length - 1].x !== inicio.x || temp[temp.length - 1].y !== inicio.y) {
    return { camino: null, exploradas: exploradas };
  }
  temp.reverse();
  camino.push(...temp);
  return { camino: camino, exploradas: exploradas };
}

function calcularCostoCamino(camino, getCosto) {
  if (!camino || camino.length === 0) return 0;
  const costoFn = getCosto || ((typeof window !== 'undefined' && window.costo) ? window.costo : () => 1);
  let total = 0;
  for (let i = 0; i < camino.length; i++) {
    total += costoFn(camino[i].x, camino[i].y);
  }
  return total;
}

if (typeof window !== 'undefined') {
  window.manhattan = manhattan;
  window.bfs = bfs;
  window.dijkstra = dijkstra;
  window.astar = astar;
  window.calcularCostoCamino = calcularCostoCamino;
  window.costoDirecto = costoDirecto;
  window.costoSeguro = costoSeguro;
}
