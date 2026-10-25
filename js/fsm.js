// fsm.js - FSM pura sin Phaser
// Especificación 06: comportamiento de la hormiga

function crearFSM() {
  return {
    estado: 'EXPLORAR',
    energia: 100,
    umbralBajo: 30,
    llevaComida: false,
    comidaEntregada: 0,
    memoriaConocidas: [],
    memoriaInaccesibles: new Set(),
    visitadas: new Set(),
    radioOlfato: 4,
    pausaRestante: 0,
    enPausa: false,
    esperandoSinObjetivo: false,
    intentosExplorar: 0,
    destinoActual: null,
    destinoActualRef: null
  };
}

function resetFSM(fsm) {
  if (!fsm) return;
  fsm.estado = 'EXPLORAR';
  fsm.energia = 100;
  fsm.llevaComida = false;
  fsm.comidaEntregada = 0;
  fsm.memoriaConocidas = [];
  fsm.memoriaInaccesibles = new Set();
  fsm.visitadas = new Set();
  fsm.pausaRestante = 0;
  fsm.enPausa = false;
  fsm.esperandoSinObjetivo = false;
  fsm.intentosExplorar = 0;
  fsm.destinoActual = null;
  fsm.destinoActualRef = null;
}

function olfatear(fsm, hormiga, fuentesComida) {
  if (!fsm || !hormiga || !fuentesComida) return;
  for (let i = 0; i < fuentesComida.length; i++) {
    const f = fuentesComida[i];
    const d = Math.abs(f.x - hormiga.casilla.x) + Math.abs(f.y - hormiga.casilla.y);
    if (d <= fsm.radioOlfato) {
      let existe = false;
      for (let j = 0; j < fsm.memoriaConocidas.length; j++) {
        if (fsm.memoriaConocidas[j] === f) { existe = true; break; }
      }
      if (!existe) {
        fsm.memoriaConocidas.push(f);
      }
    }
  }
}

function marcarInaccesible(fsm, x, y) {
  if (!fsm) return;
  fsm.memoriaInaccesibles.add(x + ',' + y);
}

function limpiarInaccesibles(fsm) {
  if (!fsm) return;
  fsm.memoriaInaccesibles = new Set();
}

function bajarEnergia(fsm, costoCasilla) {
  if (!fsm) return;
  let c = costoCasilla;
  if (c === undefined || c === null) c = 1;
  if (c === Infinity) c = 1;
  if (typeof c !== 'number') c = 1;
  fsm.energia = fsm.energia - c;
  if (fsm.energia < 0) fsm.energia = 0;
}

function distanciaManhattan(a,b) {
  return Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
}

function marcarExploradasRadio(fsm, hormiga) {
  if (!fsm || !hormiga) return;
  if (!fsm.visitadas) fsm.visitadas = new Set();
  for (let dy = -fsm.radioOlfato; dy <= fsm.radioOlfato; dy++) {
    for (let dx = -fsm.radioOlfato; dx <= fsm.radioOlfato; dx++) {
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist > fsm.radioOlfato) continue;
      const x = hormiga.casilla.x + dx;
      const y = hormiga.casilla.y + dy;
      fsm.visitadas.add(x + ',' + y);
    }
  }
}

function encontrarPuntoExplorar(fsm, hormiga, ANCHO, ALTO, mapa) {
  if (!fsm || !hormiga) return null;
  if (!fsm.visitadas) fsm.visitadas = new Set();
  // NO marcar radio aquí - solo marcar al pisar/completar casilla
  const candidatosRango = [];
  for (let y = 1; y < ALTO - 1; y++) {
    for (let x = 1; x < ANCHO - 1; x++) {
      if (!mapa[y]) continue;
      if (mapa[y][x].tipo === 'piedra') continue;
      if (typeof window !== 'undefined' && window.esTransitable && !window.esTransitable(x,y)) continue;
      const k = x + ',' + y;
      if (fsm.visitadas.has(k)) continue;
      const d = distanciaManhattan(hormiga.casilla, {x:x,y:y});
      if (d >= 5 && d <= 10) candidatosRango.push({x:x,y:y});
    }
  }
  if (candidatosRango.length > 0) {
    const idx = Math.floor(Math.random() * candidatosRango.length);
    const elegido = candidatosRango[idx];
    try { console.log('EXPLORAR elegir: hormiga(' + hormiga.casilla.x + ',' + hormiga.casilla.y + ') -> (' + elegido.x + ',' + elegido.y + ') dist=' + distanciaManhattan(hormiga.casilla,elegido) + ' candidatasRango=' + candidatosRango.length + ' amplio=false'); } catch(e){}
    return elegido;
  }
  // ampliar a cualquier distancia
  const candidatosTodos = [];
  for (let y = 1; y < ALTO - 1; y++) {
    for (let x = 1; x < ANCHO - 1; x++) {
      if (!mapa[y]) continue;
      if (mapa[y][x].tipo === 'piedra') continue;
      if (typeof window !== 'undefined' && window.esTransitable && !window.esTransitable(x,y)) continue;
      const k = x + ',' + y;
      if (fsm.visitadas.has(k)) continue;
      candidatosTodos.push({x:x,y:y});
    }
  }
  if (candidatosTodos.length > 0) {
    const idx = Math.floor(Math.random() * candidatosTodos.length);
    const elegido = candidatosTodos[idx];
    try { console.log('EXPLORAR elegir: hormiga(' + hormiga.casilla.x + ',' + hormiga.casilla.y + ') -> (' + elegido.x + ',' + elegido.y + ') dist=' + distanciaManhattan(hormiga.casilla,elegido) + ' candidatasRango=0 amplio=true'); } catch(e){}
    return elegido;
  }
  // limpiar exploradas
  fsm.visitadas = new Set();
  // marcar solo radio actual
  for (let dy = -fsm.radioOlfato; dy <= fsm.radioOlfato; dy++) {
    for (let dx = -fsm.radioOlfato; dx <= fsm.radioOlfato; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > fsm.radioOlfato) continue;
      fsm.visitadas.add((hormiga.casilla.x + dx) + ',' + (hormiga.casilla.y + dy));
    }
  }
  const candidatosTodos2 = [];
  for (let y = 1; y < ALTO - 1; y++) {
    for (let x = 1; x < ANCHO - 1; x++) {
      if (!mapa[y]) continue;
      if (mapa[y][x].tipo === 'piedra') continue;
      if (typeof window !== 'undefined' && window.esTransitable && !window.esTransitable(x,y)) continue;
      const k = x + ',' + y;
      if (fsm.visitadas.has(k)) continue;
      candidatosTodos2.push({x:x,y:y});
    }
  }
  if (candidatosTodos2.length === 0) return null;
  const idx3 = Math.floor(Math.random() * candidatosTodos2.length);
  const elegido2 = candidatosTodos2[idx3];
  try { console.log('EXPLORAR elegir: hormiga(' + hormiga.casilla.x + ',' + hormiga.casilla.y + ') -> (' + elegido2.x + ',' + elegido2.y + ') dist=' + distanciaManhattan(hormiga.casilla,elegido2) + ' candidatasRango=0 amplio=true trasLimpiar'); } catch(e){}
  return elegido2;
}

function elegirComida(fsm, hormiga, fuentesComida) {
  if (!fsm || !hormiga) return null;
  const candidatos = [];
  for (let i = 0; i < fsm.memoriaConocidas.length; i++) {
    const ref = fsm.memoriaConocidas[i];
    let existe = false;
    if (fuentesComida) {
      for (let j = 0; j < fuentesComida.length; j++) {
        if (fuentesComida[j] === ref) { existe = true; break; }
      }
    }
    if (!existe) continue;
    if (ref.porciones !== undefined && ref.porciones <= 0) continue;
    const k = ref.x + ',' + ref.y;
    if (fsm.memoriaInaccesibles.has(k)) continue;
    candidatos.push(ref);
  }
  if (candidatos.length === 0) return null;
  let mejor = candidatos[0];
  let mejorScore = -1;
  for (let i = 0; i < candidatos.length; i++) {
    const c = candidatos[i];
    const dist = distanciaManhattan(hormiga.casilla, c);
    let costoCamino = dist;
    const score = (c.porciones || 1) / (costoCamino || 1);
    if (score > mejorScore) {
      mejorScore = score;
      mejor = c;
    }
  }
  return mejor;
}

function logCambioEstado(fsm, estadoAnterior, estadoNuevo) {
  try {
    console.log('FSM cambio:', estadoAnterior, '->', estadoNuevo, '| energia:', fsm.energia, '| llevaComida:', fsm.llevaComida);
  } catch(e) {}
}

function actualizarFSM(fsm, hormiga, ctx, delta) {
  if (!fsm || !hormiga) return { accion: 'ninguna' };
  if (!ctx.modoAutonomo) return { accion: 'manual' };
  if (fsm.enPausa || fsm.pausaRestante > 0) {
    if (delta) fsm.pausaRestante -= delta * (hormiga.velocidadSim || 1);
    if (fsm.pausaRestante <= 0) {
      fsm.pausaRestante = 0;
      fsm.enPausa = false;
    } else {
      return { accion: 'pausa' };
    }
  }

  // NO marcar radio aquí - marcar solo al completar casilla (pisa) desde escena.js

  // transición global no debe interrumpir RECOGER ni DESCANSAR
  if (fsm.estado !== 'RECOGER' && fsm.estado !== 'DESCANSAR') {
    if (fsm.energia < fsm.umbralBajo && !fsm.llevaComida && fsm.estado !== 'VOLVER_AL_HORMIGUERO') {
      const ant = fsm.estado;
      fsm.estado = 'VOLVER_AL_HORMIGUERO';
      fsm.destinoActual = null;
      logCambioEstado(fsm, ant, fsm.estado);
      return { accion: 'cambiar_estado', estado: fsm.estado };
    }
  }

  if (hormiga.enMovimiento) {
    return { accion: 'moviendo' };
  }

  if (fsm.estado === 'RECOGER') {
    if (fsm.destinoActualRef) {
      const ref = fsm.destinoActualRef;
      if (typeof ref.porciones === 'number') {
        ref.porciones = ref.porciones - 1;
        if (ref.porciones <= 0) {
          if (ctx.fuentesComida) {
            for (let i = 0; i < ctx.fuentesComida.length; i++) {
              if (ctx.fuentesComida[i] === ref) {
                ctx.fuentesComida.splice(i, 1);
                break;
              }
            }
          }
          for (let i = 0; i < fsm.memoriaConocidas.length; i++) {
            if (fsm.memoriaConocidas[i] === ref) {
              fsm.memoriaConocidas.splice(i, 1);
              break;
            }
          }
        }
        // si porciones > 0, solo bajar porción, mantener en fuentes/memoria
      }
    }
    const ant = fsm.estado;
    fsm.llevaComida = true;
    fsm.estado = 'VOLVER_AL_HORMIGUERO';
    fsm.destinoActual = { x: ctx.hormiguero.x, y: ctx.hormiguero.y };
    fsm.destinoActualRef = null;
    logCambioEstado(fsm, ant, fsm.estado);
    return { accion: 'ir_hormiguero', destino: fsm.destinoActual };
  }

  if (fsm.estado === 'DESCANSAR') {
    const ant = fsm.estado;
    if (!fsm.llevaComida) {
      fsm.estado = 'EXPLORAR';
      fsm.destinoActual = null;
      logCambioEstado(fsm, ant, fsm.estado);
      return { accion: 'explorar' };
    }
    fsm.comidaEntregada = (fsm.comidaEntregada || 0) + 1;
    fsm.llevaComida = false;
    fsm.energia = 100;
    fsm.estado = 'EXPLORAR';
    logCambioEstado(fsm, ant, fsm.estado);
    const comida = elegirComida(fsm, hormiga, ctx.fuentesComida);
    if (comida) {
      const ant2 = fsm.estado;
      fsm.estado = 'IR_A_LA_COMIDA';
      fsm.destinoActual = { x: comida.x, y: comida.y };
      fsm.destinoActualRef = comida;
      logCambioEstado(fsm, ant2, fsm.estado);
      return { accion: 'ir_comida', destino: fsm.destinoActual };
    }
    fsm.destinoActual = null;
    return { accion: 'explorar' };
  }

  if (fsm.estado === 'IR_A_LA_COMIDA') {
    if (fsm.destinoActualRef) {
      let existe = false;
      if (ctx.fuentesComida) {
        for (let i = 0; i < ctx.fuentesComida.length; i++) {
          if (ctx.fuentesComida[i] === fsm.destinoActualRef) { existe = true; break; }
        }
      }
      if (!existe) {
        marcarInaccesible(fsm, fsm.destinoActual.x, fsm.destinoActual.y);
        const comida = elegirComida(fsm, hormiga, ctx.fuentesComida);
        if (comida) {
          const ant = fsm.estado;
          fsm.destinoActual = { x: comida.x, y: comida.y };
          fsm.destinoActualRef = comida;
          logCambioEstado(fsm, ant, fsm.estado);
          return { accion: 'ir_comida', destino: fsm.destinoActual };
        }
        const ant2 = fsm.estado;
        fsm.estado = 'EXPLORAR';
        logCambioEstado(fsm, ant2, fsm.estado);
        return { accion: 'explorar' };
      }
    }
    const ant = fsm.estado;
    fsm.estado = 'RECOGER';
    fsm.pausaRestante = 500;
    fsm.enPausa = true;
    logCambioEstado(fsm, ant, fsm.estado);
    return { accion: 'pausa_recojer' };
  }

  if (fsm.estado === 'VOLVER_AL_HORMIGUERO') {
    if (hormiga.casilla.x === ctx.hormiguero.x && hormiga.casilla.y === ctx.hormiguero.y) {
      const ant = fsm.estado;
      fsm.estado = 'DESCANSAR';
      if (fsm.llevaComida) {
        fsm.pausaRestante = 400;
      } else {
        fsm.pausaRestante = 200;
      }
      fsm.enPausa = true;
      logCambioEstado(fsm, ant, fsm.estado);
      return { accion: 'pausa_descansar' };
    }
    fsm.destinoActual = { x: ctx.hormiguero.x, y: ctx.hormiguero.y };
    return { accion: 'ir_hormiguero', destino: fsm.destinoActual };
  }

  if (fsm.estado === 'EXPLORAR') {
    olfatear(fsm, hormiga, ctx.fuentesComida);
    const comida = elegirComida(fsm, hormiga, ctx.fuentesComida);
    if (comida) {
      const ant = fsm.estado;
      fsm.estado = 'IR_A_LA_COMIDA';
      fsm.destinoActual = { x: comida.x, y: comida.y };
      fsm.destinoActualRef = comida;
      logCambioEstado(fsm, ant, fsm.estado);
      return { accion: 'ir_comida', destino: fsm.destinoActual };
    }
    if (fsm.intentosExplorar >= 10) {
      fsm.intentosExplorar = 0;
      fsm.esperandoSinObjetivo = true;
      return { accion: 'esperar' };
    }
    fsm.intentosExplorar++;
    const pto = encontrarPuntoExplorar(fsm, hormiga, ctx.ANCHO, ctx.ALTO, ctx.mapa);
    if (!pto) {
      fsm.intentosExplorar = 0;
      fsm.esperandoSinObjetivo = true;
      return { accion: 'esperar' };
    }
    fsm.destinoActual = pto;
    return { accion: 'explorar_ir', destino: pto };
  }

  return { accion: 'ninguna' };
}

if (typeof window !== 'undefined') {
  window.crearFSM = crearFSM;
  window.resetFSM = resetFSM;
  window.olfatear = olfatear;
  window.marcarInaccesible = marcarInaccesible;
  window.limpiarInaccesibles = limpiarInaccesibles;
  window.bajarEnergia = bajarEnergia;
  window.encontrarPuntoExplorar = encontrarPuntoExplorar;
  window.elegirComida = elegirComida;
  window.actualizarFSM = actualizarFSM;
}
