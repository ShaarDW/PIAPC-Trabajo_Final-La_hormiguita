// busqueda.js - algoritmos puros, sin dependencia de Phaser
// Especificación 02: BFS, Dijkstra, A*

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function bfs(inicio, destino, getCosto) {
  // getCosto recibido pero ignorado (BFS no usa costos)
  if (!inicio || !destino) return { camino: null, exploradas: [] };
  if (inicio.x === destino.x && inicio.y === destino.y) {
    return { camino: [{ x: inicio.x, y: inicio.y }], exploradas: [{ x: inicio.x, y: inicio.y }] };
  }
  if (typeof window !== 'undefined' && window.esTransitable) {
    if (!window.esTransitable(destino.x, destino.y)) {
      // verificar si es piedra
      if (window.mapa && window.mapa[destino.y] && window.mapa[destino.y][destino.x] && window.mapa[destino.y][destino.x].tipo === 'piedra') {
        return { camino: null, exploradas: [] };
      }
    }
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
  if (!visitados.has(keyDestino)) {
    return { camino: null, exploradas: exploradas };
  }

  // reconstruir camino
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

function dijkstra(inicio, destino, getCosto) {
  if (!inicio || !destino) return { camino: null, exploradas: [] };
  const costoFn = getCosto || ((typeof window !== 'undefined' && window.costo) ? window.costo : () => 1);
  if (inicio.x === destino.x && inicio.y === destino.y) {
    return { camino: [{ x: inicio.x, y: inicio.y }], exploradas: [{ x: inicio.x, y: inicio.y }] };
  }

  const visitados = new Set();
  const dist = new Map();
  const padre = new Map();
  const exploradas = [];

  const keyInicio = inicio.x + ',' + inicio.y;
  dist.set(keyInicio, 0);
  padre.set(keyInicio, null);

  // cola simple con menor distancia
  const open = [{ x: inicio.x, y: inicio.y, d: 0 }];
  visitados.add(keyInicio);

  while (open.length > 0) {
    // encontrar con menor d
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
  if (!dist.has(keyDestino) && !(destino.x === inicio.x && destino.y === inicio.y)) {
    // verificar si fue visitado
  }
  if (!padre.has(keyDestino) && !(destino.x === inicio.x && destino.y === inicio.y)) {
    // revisar si llegamos
  }
  // si no hay padre hacia destino y no es inicio, null
  if (!(destino.x === inicio.x && destino.y === inicio.y)) {
    // buscar si destino fue alcanzado
    let encontrado = false;
    for (let i = 0; i < open.length; i++) {
      if (open[i].x === destino.x && open[i].y === destino.y) { encontrado = true; break; }
    }
    // reconstruir si padre existe
  }
  if (!(destino.x === inicio.x && destino.y === inicio.y) && !padre.has(keyDestino)) {
    // intentar ver si exploramos hasta él
  }

  // reconstrucción más directa
  if (!padre.has(keyDestino) && !(destino.x === inicio.x && destino.y === inicio.y)) {
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

function astar(inicio, destino, getCosto) {
  if (!inicio || !destino) return { camino: null, exploradas: [] };
  const costoFn = getCosto || ((typeof window !== 'undefined' && window.costo) ? window.costo : () => 1);
  if (inicio.x === destino.x && inicio.y === destino.y) {
    return { camino: [{ x: inicio.x, y: inicio.y }], exploradas: [{ x: inicio.x, y: inicio.y }] };
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
}
