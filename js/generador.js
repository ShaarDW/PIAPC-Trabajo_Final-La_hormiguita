// generador.js - generación procedural sin Phaser
// Especificación 04: generación de escenarios

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function agregarMancha(mapa, ANCHO, ALTO, tipo, costo, minSize, maxSize) {
  const intentos = 30;
  for (let it = 0; it < intentos; it++) {
    const cx = randInt(2, ANCHO - 3);
    const cy = randInt(2, ALTO - 3);
    const tam = randInt(minSize, maxSize);
    const formaAlargada = Math.random() < 0.4;
    const colocadas = [];
    if (formaAlargada) {
      const dir = Math.random() < 0.5 ? 'h' : 'v';
      for (let i = 0; i < tam; i++) {
        let nx = cx, ny = cy;
        if (dir === 'h') nx = cx + i; else ny = cy + i;
        if (nx < 1 || nx > ANCHO - 2 || ny < 1 || ny > ALTO - 2) continue;
        if (!mapa[ny]) continue;
        if (mapa[ny][nx].tipo === 'piedra') continue;
        colocadas.push({ x: nx, y: ny });
      }
    } else {
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (colocadas.length >= tam) break;
          if (Math.random() > 0.5) continue;
          const nx = cx + dx, ny = cy + dy;
          if (nx < 1 || nx > ANCHO - 2 || ny < 1 || ny > ALTO - 2) continue;
          if (!mapa[ny]) continue;
          if (mapa[ny][nx].tipo === 'piedra') continue;
          colocadas.push({ x: nx, y: ny });
        }
        if (colocadas.length >= tam) break;
      }
    }
    if (colocadas.length >= 4) {
      for (let i = 0; i < colocadas.length; i++) {
        const p = colocadas[i];
        if (mapa[p.y]) {
          mapa[p.y][p.x].tipo = tipo;
          mapa[p.y][p.x].costo = costo;
        }
      }
      return true;
    }
  }
  return false;
}

function floodFillAlcanzables(mapa, ANCHO, ALTO, inicio) {
  const visitados = new Set();
  const cola = [];
  if (!inicio) return visitados;
  if (inicio.x < 0 || inicio.x >= ANCHO || inicio.y < 0 || inicio.y >= ALTO) return visitados;
  if (!mapa[inicio.y]) return visitados;
  if (mapa[inicio.y][inicio.x].tipo === 'piedra') return visitados;
  const k0 = inicio.x + ',' + inicio.y;
  visitados.add(k0);
  cola.push({ x: inicio.x, y: inicio.y });
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let head = 0;
  while (head < cola.length) {
    const cur = cola[head++];
    for (let d = 0; d < dirs.length; d++) {
      const nx = cur.x + dirs[d][0], ny = cur.y + dirs[d][1];
      if (nx < 0 || nx >= ANCHO || ny < 0 || ny >= ALTO) continue;
      if (!mapa[ny]) continue;
      if (mapa[ny][nx].tipo === 'piedra') continue;
      const k = nx + ',' + ny;
      if (!visitados.has(k)) {
        visitados.add(k);
        cola.push({ x: nx, y: ny });
      }
    }
  }
  return visitados;
}

function generarMapaProcedural(ANCHO, ALTO, mapaExistente, hormigueroRef, comidasRef) {
  const mapa = mapaExistente;
  // Limpiar interior a tierra, mantener borde piedra - mutar en el lugar
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) {
      if (!mapa[y]) continue;
      if (x === 0 || x === ANCHO - 1 || y === 0 || y === ALTO - 1) {
        mapa[y][x].tipo = 'piedra';
        mapa[y][x].costo = 0;
      } else {
        mapa[y][x].tipo = 'tierra';
        mapa[y][x].costo = 1;
      }
    }
  }

  // Manchas más grandes
  const gruposPiedra = randInt(5, 8);
  for (let g = 0; g < gruposPiedra; g++) {
    agregarMancha(mapa, ANCHO, ALTO, 'piedra', 0, 4, 12);
  }
  const gruposBarro = randInt(2, 3);
  for (let g = 0; g < gruposBarro; g++) {
    agregarMancha(mapa, ANCHO, ALTO, 'barro', 5, 8, 20);
  }
  const gruposPasto = randInt(2, 3);
  for (let g = 0; g < gruposPasto; g++) {
    agregarMancha(mapa, ANCHO, ALTO, 'pasto_alto', 3, 6, 16);
  }
  const zonasExp = randInt(1, 2);
  for (let g = 0; g < zonasExp; g++) {
    agregarMancha(mapa, ANCHO, ALTO, 'expuesta', 1, 4, 10);
  }

  // Hormiguero
  let hx = 2, hy = 2;
  let colocadoHorm = false;
  for (let intento = 0; intento < 300 && !colocadoHorm; intento++) {
    hx = randInt(4, ANCHO - 5);
    hy = randInt(4, ALTO - 5);
    let ok = true;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!mapa[hy + dy]) { ok = false; break; }
        if (mapa[hy + dy][hx + dx].tipo === 'piedra') { ok = false; break; }
      }
      if (!ok) break;
    }
    if (ok) colocadoHorm = true;
  }
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (mapa[hy + dy] && mapa[hy + dy][hx + dx].tipo === 'piedra') {
        mapa[hy + dy][hx + dx].tipo = 'tierra';
        mapa[hy + dy][hx + dx].costo = 1;
      }
    }
  }
  if (hormigueroRef) { hormigueroRef.x = hx; hormigueroRef.y = hy; }

  const numComidas = randInt(4, 7);
  // Validación
  for (let intentoGen = 0; intentoGen < 50; intentoGen++) {
    const alcanzables = floodFillAlcanzables(mapa, ANCHO, ALTO, { x: hx, y: hy });
    if (comidasRef) {
      comidasRef.length = 0;
    }
    const alcanzablesArr = [];
    for (let y = 1; y < ALTO - 1; y++) {
      for (let x = 1; x < ANCHO - 1; x++) {
        const k = x + ',' + y;
        if (alcanzables.has(k) && mapa[y] && mapa[y][x].tipo !== 'piedra') {
          if (x === hx && y === hy) continue;
          alcanzablesArr.push({ x: x, y: y });
        }
      }
    }
    let colocadasOk = 0;
    const listaComidas = [];
    for (let c = 0; c < numComidas; c++) {
      if (alcanzablesArr.length > 0) {
        let idx = randInt(0, alcanzablesArr.length - 1);
        let p = alcanzablesArr.splice(idx, 1)[0];
        listaComidas.push({ x: p.x, y: p.y, porciones: randInt(2, 4) });
        colocadasOk++;
      } else {
        listaComidas.push({ x: hx + 1, y: hy + 1, porciones: randInt(2, 4) });
      }
    }
    if (comidasRef) {
      for (let i = 0; i < listaComidas.length; i++) comidasRef.push(listaComidas[i]);
    }
    let algunaLejos = false;
    if (comidasRef) {
      for (let i = 0; i < comidasRef.length; i++) {
        const c = comidasRef[i];
        const d = Math.abs(c.x - hx) + Math.abs(c.y - hy);
        if (d > 4) { algunaLejos = true; break; }
      }
    }
    if (colocadasOk >= 4 && algunaLejos) {
      return true;
    }
  }

  if (typeof window !== 'undefined' && window.inicializarMapaPrueba) {
    window.inicializarMapaPrueba();
  }
  return false;
}

if (typeof window !== 'undefined') {
  window.generarMapaProcedural = generarMapaProcedural;
}
