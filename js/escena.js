// escena.js
class JuegoEscena extends Phaser.Scene {
  constructor() {
    super({ key: 'JuegoEscena' });
  }

  create() {
    const TAMANO_TILE = 32;
    this.tamanoTile = TAMANO_TILE;
    const colores = {
      'tierra': 0x8B7355,
      'pasto_alto': 0x6B8E23,
      'barro': 0x654321,
      'expuesta': 0xD2691E,
      'piedra': 0x2F2F2F
    };

    this.grupoMapa = this.add.group();
    this.grupoHormiguero = this.add.group();
    this.grupoComida = this.add.group();
    this.grupoCarga = this.add.group();
    this.grupoEntrega = this.add.group();
    this.grupoExploradas = this.add.group();
    this.grupoCamino = this.add.group();
    this.grupoDebugExtra = this.add.group();
    this._firmaComida = '';

    this.dibujarTodo(colores, TAMANO_TILE);

    this.algoritmoActivo = 'bfs';
    this.debugActivo = false;
    this.ultimoDestino = null;
    this.resultadoActual = null;
    this.modoNavegacion = 'directa';
    this.modoAutonomo = true;
    if (typeof window !== 'undefined') {
      window.modoNavegacion = 'directa';
      window.algoritmoActivo = 'bfs';
    }

    this.hormiga = window.crearHormiga ? window.crearHormiga(window.hormiguero.x, window.hormiguero.y) : {
      casilla: { x: window.hormiguero.x, y: window.hormiguero.y },
      camino: [], indiceCamino: 0, destino: null, enMovimiento: false, pausado: false, velocidadSim: 1.0,
      origenPaso: { x: window.hormiguero.x, y: window.hormiguero.y }, objetivoPaso: { x: window.hormiguero.x, y: window.hormiguero.y },
      tPaso: 0, duracionPaso: 0
    };
    const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, TAMANO_TILE) : { x: window.hormiguero.x * 32 + 16, y: window.hormiguero.y * 32 + 16 };
    this.hormigaSprite = this.add.rectangle(hv.x, hv.y, 14, 14, 0x000000).setStrokeStyle(2, 0xFFFFFF);
    this.hormigaSprite.setDepth(100);

    this.fsm = window.crearFSM ? window.crearFSM() : { estado: 'EXPLORAR', energia: 100, llevaComida: false, comidaEntregada: 0, memoriaConocidas: [], memoriaInaccesibles: new Set(), visitadas: new Set() };

    this.actualizarHUD();

    this.input.on('pointerdown', this.onClick, this);
    this.input.keyboard.on('keydown', this.onKey, this);
    this.input.mouse.disableContextMenu();

    this.lastTime = this.time.now;

    if (window.generarMapaProcedural && window.mapa && window.hormiguero && window.fuentesComida) {
      window.generarMapaProcedural(window.ANCHO, window.ALTO, window.mapa, window.hormiguero, window.fuentesComida);
      this.regenerarVisual();
    }
  }

  dibujarTodo(colores, TAMANO_TILE) {
    this.grupoMapa.clear(true, true);
    this.grupoHormiguero.clear(true, true);
    this.grupoComida.clear(true, true);
    for (let y = 0; y < window.ALTO; y++) {
      for (let x = 0; x < window.ANCHO; x++) {
        const celda = window.mapa[y][x];
        const color = colores[celda.tipo] || 0x000000;
        const rect = this.add.rectangle(x * TAMANO_TILE + 16, y * TAMANO_TILE + 16, TAMANO_TILE - 1, TAMANO_TILE - 1, color);
        rect.setStrokeStyle(1, 0x000000);
        rect.setDepth(0);
        this.grupoMapa.add(rect);
      }
    }
    const hormiX = window.hormiguero.x * 32 + 16;
    const hormiY = window.hormiguero.y * 32 + 16;
    const hrect = this.add.rectangle(hormiX, hormiY, 16, 16, 0xFFD700);
    hrect.setStrokeStyle(2, 0x000000);
    hrect.setDepth(10);
    this.grupoHormiguero.add(hrect);
    this.dibujarComidas(TAMANO_TILE);
  }

  dibujarComidas(TAMANO_TILE) {
    this.grupoComida.clear(true, true);
    if (window.fuentesComida) {
      for (let i = 0; i < window.fuentesComida.length; i++) {
        const c = window.fuentesComida[i];
        if (c.porciones === undefined || c.porciones === null) {
          try { console.warn('Fuente sin porciones definidas', c); } catch(e){}
          continue;
        }
        if (c.porciones <= 0) continue;
        const porciones = c.porciones;
        for (let m = 0; m < porciones; m++) {
          const ox = c.x * 32 + 16;
          const oy = c.y * 32 + 16;
          const ang = (m / porciones) * Math.PI * 2;
          const r = 3.5;
          const cx = ox + Math.cos(ang) * 4;
          const cy = oy + Math.sin(ang) * 4;
          const circ = this.add.circle(cx, cy, 2.5, 0xFF6347);
          circ.setStrokeStyle(1, 0x000000);
          circ.setDepth(11);
          this.grupoComida.add(circ);
        }
      }
    }
  }

  dibujarCarga() {
    if (!this.grupoCarga) return;
    this.grupoCarga.clear(true, true);
    if (!this.fsm || !this.hormiga) return;
    if (!this.fsm.llevaComida) return;
    const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, this.tamanoTile || 32) : { x: this.hormiga.casilla.x * 32 + 16, y: this.hormiga.casilla.y * 32 + 16 };
    const circ = this.add.circle(hv.x, hv.y - 10, 3, 0xFF6347);
    circ.setStrokeStyle(1, 0x000000);
    circ.setDepth(150);
    this.grupoCarga.add(circ);
  }

  dibujarEntrega() {
    if (!this.grupoEntrega) return;
    this.grupoEntrega.clear(true, true);
    if (!window.hormiguero || !this.fsm) return;
    const entregadas = this.fsm.comidaEntregada || 0;
    const ox = window.hormiguero.x * 32 + 16;
    const oy = window.hormiguero.y * 32 + 16;
    if (entregadas <= 0) return;
    if (entregadas <= 10) {
      for (let i = 0; i < entregadas; i++) {
        const circ = this.add.circle(ox + 12 + (i % 5) * 4, oy - 8 - Math.floor(i/5) * 4, 2.2, 0xFF6347);
        circ.setStrokeStyle(1, 0x000000);
        circ.setDepth(12);
        this.grupoEntrega.add(circ);
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const circ = this.add.circle(ox + 12 + (i % 5) * 4, oy - 8 - Math.floor(i/5) * 4, 2.2, 0xFF6347);
        circ.setStrokeStyle(1, 0x000000);
        circ.setDepth(12);
        this.grupoEntrega.add(circ);
      }
      const txt = this.add.text(ox + 12 + 20, oy - 12, '+' + entregadas, { fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 2 });
      txt.setDepth(13);
      this.grupoEntrega.add(txt);
    }
  }

  regenerarVisual() {
    const colores = {
      'tierra': 0x8B7355,
      'pasto_alto': 0x6B8E23,
      'barro': 0x654321,
      'expuesta': 0xD2691E,
      'piedra': 0x2F2F2F
    };
    this.dibujarTodo(colores, this.tamanoTile || 32);
    if (this.hormiga && window.crearHormiga) {
      this.hormiga = window.crearHormiga(window.hormiguero.x, window.hormiguero.y);
      if (this.hormigaSprite) {
        const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, this.tamanoTile) : { x: window.hormiguero.x * 32 + 16, y: window.hormiguero.y * 32 + 16 };
        this.hormigaSprite.x = hv.x;
        this.hormigaSprite.y = hv.y;
        this.hormigaSprite.setDepth(100);
      }
    }
    if (this.fsm && window.resetFSM) window.resetFSM(this.fsm);
    this.ultimoDestino = null;
    this.resultadoActual = null;
    this.grupoExploradas.clear(true, true);
    this.grupoCamino.clear(true, true);
    this.grupoDebugExtra.clear(true, true);
    if (this.grupoCarga) this.grupoCarga.clear(true, true);
    if (this.grupoEntrega) this.grupoEntrega.clear(true, true);
    this._firmaComida = '';
    this.dibujarComidas(this.tamanoTile || 32);
    this.dibujarCarga();
    this.dibujarEntrega();
    this.actualizarHUD();
  }

  actualizarHUD() {
    const hud = document.getElementById('hud');
    if (!hud) return;
    let algo = 'BFS';
    if (this.algoritmoActivo === 'dijkstra') algo = 'DIJKSTRA';
    if (this.algoritmoActivo === 'astar') algo = 'A*';
    let costo = 0;
    let exploradas = 0;
    if (this.resultadoActual) {
      costo = (window.calcularCostoCamino) ? window.calcularCostoCamino(this.resultadoActual.camino, window.costo) : 0;
      exploradas = this.resultadoActual.exploradas ? this.resultadoActual.exploradas.length : 0;
    }
    const mov = this.hormiga && this.hormiga.enMovimiento && !this.hormiga.pausado ? 'MOVIENDO' : (this.hormiga && this.hormiga.pausado ? 'PAUSADO' : 'QUIETA');
    const estado = this.fsm ? this.fsm.estado : '-';
    const energia = this.fsm ? this.fsm.energia : '-';
    const entregadas = this.fsm ? this.fsm.comidaEntregada : 0;
    let aviso = '';
    if (typeof window !== 'undefined' && window._bfsAvisoSeguro) {
      aviso = '<div>BFS: sin ruta segura, cruza zona expuesta</div>';
      window._bfsAvisoSeguro = false;
    }
    let avisoComida = '';
    if (window.fuentesComida && window.fuentesComida.length === 0) {
      avisoComida = '<div>No queda comida</div>';
    }
    hud.innerHTML = '<div>Algoritmo: ' + algo + '</div>' +
                    '<div>Navegacion: ' + (this.modoNavegacion || 'directa') + ' (N)</div>' +
                    '<div>Modo: ' + (this.modoAutonomo ? 'AUTONOMO (M)' : 'MANUAL (M)') + '</div>' +
                    '<div>FSM: ' + estado + '</div>' +
                    '<div>Energia: ' + energia + '</div>' +
                    '<div>Comida entregada: ' + entregadas + '</div>' +
                    '<div>Debug (D): ' + (this.debugActivo ? 'ON' : 'OFF') + '</div>' +
                    '<div>Costo camino: ' + costo + '</div>' +
                    '<div>Exploradas: ' + exploradas + '</div>' +
                    '<div>Hormiga: ' + mov + '</div>' +
                    '<div>Vel: ' + (this.hormiga ? this.hormiga.velocidadSim.toFixed(2) : '1.00') + '</div>' +
                    '<div>Shift+Click: destino | Click izq: piedra | Click der: comida</div>' +
                    '<div>R: regenerar | T: mapa prueba</div>' +
                    aviso +
                    avisoComida +
                    (this.resultadoActual && this.resultadoActual.camino === null ? '<div>sin camino</div>' : '');
  }

  limpiarDebug() {
    this.grupoExploradas.clear(true, true);
    this.grupoCamino.clear(true, true);
    this.grupoDebugExtra.clear(true, true);
  }

  dibujarDebug() {
    this.limpiarDebug();
    const t = this.tamanoTile || 32;
    if (!this.hormiga) {
      this.actualizarHUD();
      return;
    }
    // Con D, pintar muy tenue las casillas exploradas (FSM)
    if (this.debugActivo && this.fsm && this.fsm.visitadas) {
      this.fsm.visitadas.forEach((k) => {
        const [vx, vy] = k.split(',');
        const px = parseInt(vx), py = parseInt(vy);
        const rect = this.add.rectangle(px * t + 16, py * t + 16, t - 6, t - 6, 0x87CEEB, 0.12);
        rect.setDepth(39);
        this.grupoExploradas.add(rect);
      });
    } else if (this.debugActivo && this.resultadoActual && this.resultadoActual.exploradas) {
      for (let i = 0; i < this.resultadoActual.exploradas.length; i++) {
        const p = this.resultadoActual.exploradas[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 8, t - 8, 0x87CEEB, 0.25);
        rect.setDepth(40);
        this.grupoExploradas.add(rect);
      }
    }

    const restante = window.getCaminoRestante ? window.getCaminoRestante(this.hormiga) : [];
    if (restante && restante.length > 0) {
      for (let i = 0; i < restante.length; i++) {
        const p = restante[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 4, t - 4, 0x00FF00, 0.35);
        rect.setStrokeStyle(2, 0x00FF00);
        rect.setDepth(50);
        this.grupoCamino.add(rect);
      }
    } else if (this.resultadoActual && this.resultadoActual.camino) {
      for (let i = 0; i < this.resultadoActual.camino.length; i++) {
        const p = this.resultadoActual.camino[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 4, t - 4, 0x00FF00, 0.2);
        rect.setStrokeStyle(1, 0x00FF00);
        rect.setDepth(50);
        this.grupoCamino.add(rect);
      }
    }

    if (this.debugActivo && window.obtenerVecinasZonasExpuestas) {
      const set = window.obtenerVecinasZonasExpuestas();
      set.forEach((k) => {
        const [cx, cy] = k.split(',');
        const px = parseInt(cx), py = parseInt(cy);
        const rect = this.add.rectangle(px * t + 16, py * t + 16, t - 10, t - 10, 0x000000, 0);
        rect.setStrokeStyle(2, 0xFFFF00);
        rect.setDepth(45);
        this.grupoDebugExtra.add(rect);
      });
    }

    // radio olfato y fuentes recordadas
    if (this.debugActivo && this.fsm && this.hormiga) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= 4) {
            const rect = this.add.rectangle((this.hormiga.casilla.x + dx) * t + 16, (this.hormiga.casilla.y + dy) * t + 16, t - 12, t - 12, 0x000000, 0);
            rect.setStrokeStyle(1, 0xFFFFFF);
            rect.setDepth(43);
            this.grupoDebugExtra.add(rect);
          }
        }
      }
      if (this.fsm.memoriaConocidas) {
        for (let i = 0; i < this.fsm.memoriaConocidas.length; i++) {
          const fc = this.fsm.memoriaConocidas[i];
          const rect = this.add.rectangle(fc.x * t + 16, fc.y * t + 16, t - 6, t - 6, 0x000000, 0);
          rect.setStrokeStyle(2, 0x00FFFF);
          rect.setDepth(46);
          this.grupoDebugExtra.add(rect);
        }
      }
    }

    this.actualizarHUD();
  }

  calcularYCaminarlizar(destino) {
    if (!destino || !this.hormiga) return;
    this.ultimoDestino = { x: destino.x, y: destino.y };
    const inicio = { x: this.hormiga.casilla.x, y: this.hormiga.casilla.y };
    if (typeof window !== 'undefined') {
      window.modoNavegacion = this.modoNavegacion;
      window.algoritmoActivo = this.algoritmoActivo;
      window._bfsAvisoSeguro = false;
    }
    let res = null;
    if (this.algoritmoActivo === 'bfs') {
      res = window.bfs(inicio, destino, window.costo, 'bfs');
    } else if (this.algoritmoActivo === 'dijkstra') {
      res = window.dijkstra(inicio, destino, window.costo, 'dijkstra');
    } else if (this.algoritmoActivo === 'astar') {
      res = window.astar(inicio, destino, window.costo, 'astar');
    }
    this.resultadoActual = res;
    if (!res || res.camino === null) {
      if (this.hormiga) {
        this.hormiga.camino = [];
        this.hormiga.indiceCamino = 0;
        this.hormiga.enMovimiento = false;
      }
      if (this.fsm) {
        if (window.marcarInaccesible) window.marcarInaccesible(this.fsm, destino.x, destino.y);
      }
      this.actualizarHUD();
      this.dibujarDebug();
      return;
    }
    if (window.iniciarCamino) {
      window.iniciarCamino(this.hormiga, res.camino);
    }
    this.actualizarHUD();
    this.dibujarDebug();
  }

  onClick(pointer) {
    const t = this.tamanoTile || 32;
    const tx = Math.floor(pointer.worldX / t);
    const ty = Math.floor(pointer.worldY / t);
    if (tx < 0 || tx >= window.ANCHO || ty < 0 || ty >= window.ALTO) return;
    if (pointer.rightButtonDown && pointer.button === 2) {
      if (window.esTransitable && !window.esTransitable(tx, ty)) return;
      if (window.mapa && window.mapa[ty] && window.mapa[ty][tx].tipo === 'piedra') return;
      if (window.hormiguero && window.hormiguero.x === tx && window.hormiguero.y === ty) return;
      if (this.hormiga && this.hormiga.casilla && this.hormiga.casilla.x === tx && this.hormiga.casilla.y === ty) return;
      if (window.hayComidaEn && window.hayComidaEn(tx, ty)) return;
      if (window.agregarComida) window.agregarComida(tx, ty, 3);
      this.dibujarComidas(t);
      if (this._firmaComida !== undefined) {
        let sumaPorciones = 0;
        let cantFuentes = 0;
        if (window.fuentesComida) {
          cantFuentes = window.fuentesComida.length;
          for (let i = 0; i < window.fuentesComida.length; i++) sumaPorciones += (window.fuentesComida[i].porciones || 0);
        }
        this._firmaComida = cantFuentes + '|' + sumaPorciones + '|' + (this.fsm ? this.fsm.llevaComida : false) + '|' + (this.fsm ? this.fsm.comidaEntregada : 0);
      }
      this.dibujarCarga();
      this.dibujarEntrega();
      this.actualizarHUD();
      return;
    }
    const shift = pointer.event && pointer.event.shiftKey;
    if (shift) {
      if (this.hormiga && this.hormiga.enMovimiento && !this.hormiga.pausado) {
        if (this.hormiga.objetivoPaso) {
          this.hormiga.casilla.x = this.hormiga.objetivoPaso.x;
          this.hormiga.casilla.y = this.hormiga.objetivoPaso.y;
          this.hormiga.indiceCamino++;
        }
        this.hormiga.tPaso = 0;
        this.hormiga.enMovimiento = false;
      }
      this.calcularYCaminarlizar({ x: tx, y: ty });
      return;
    }
    if (window.esBorde && window.esBorde(tx, ty)) return;
    if (this.hormiga && this.hormiga.casilla && this.hormiga.casilla.x === tx && this.hormiga.casilla.y === ty) return;
    if (this.hormiga && this.hormiga.objetivoPaso && this.hormiga.enMovimiento && !this.hormiga.pausado && this.hormiga.objetivoPaso.x === tx && this.hormiga.objetivoPaso.y === ty) return;
    if (window.hormiguero && window.hormiguero.x === tx && window.hormiguero.y === ty) return;
    if (window.hayComidaEn && window.hayComidaEn(tx, ty)) return;
    if (window.mapa && window.mapa[ty] && window.mapa[ty][tx].tipo === 'piedra') {
      if (window.quitarPiedra) window.quitarPiedra(tx, ty);
    } else {
      if (window.ponerPiedra) window.ponerPiedra(tx, ty);
    }
    if (this.fsm && window.limpiarInaccesibles) {
      window.limpiarInaccesibles(this.fsm);
      if (this.fsm.esperandoSinObjetivo && this.modoAutonomo && window.actualizarFSM) {
        const resF = window.actualizarFSM(this.fsm, this.hormiga, { mapa: window.mapa, hormiguero: window.hormiguero, fuentesComida: window.fuentesComida, ANCHO: window.ANCHO, ALTO: window.ALTO, modoAutonomo: this.modoAutonomo });
        if (resF && resF.destino) this.calcularYCaminarlizar(resF.destino);
      }
    }
    const colores = {
      'tierra': 0x8B7355,
      'pasto_alto': 0x6B8E23,
      'barro': 0x654321,
      'expuesta': 0xD2691E,
      'piedra': 0x2F2F2F
    };
    this.dibujarTodo(colores, t);
    this.dibujarDebug();
    this.actualizarHUD();
  }

  onKey(event) {
    if (event.key === '1') {
      this.algoritmoActivo = 'bfs';
      if (typeof window !== 'undefined') window.algoritmoActivo = 'bfs';
      if (this.hormiga && this.ultimoDestino && !this.modoAutonomo) {
        this.calcularYCaminarlizar(this.ultimoDestino);
      } else {
        this.actualizarHUD();
      }
    } else if (event.key === '2') {
      this.algoritmoActivo = 'dijkstra';
      if (typeof window !== 'undefined') window.algoritmoActivo = 'dijkstra';
      if (this.hormiga && this.ultimoDestino && !this.modoAutonomo) {
        this.calcularYCaminarlizar(this.ultimoDestino);
      } else {
        this.actualizarHUD();
      }
    } else if (event.key === '3') {
      this.algoritmoActivo = 'astar';
      if (typeof window !== 'undefined') window.algoritmoActivo = 'astar';
      if (this.hormiga && this.ultimoDestino && !this.modoAutonomo) {
        this.calcularYCaminarlizar(this.ultimoDestino);
      } else {
        this.actualizarHUD();
      }
    } else if (event.key === 'n' || event.key === 'N') {
      this.modoNavegacion = this.modoNavegacion === 'directa' ? 'segura' : 'directa';
      if (typeof window !== 'undefined') window.modoNavegacion = this.modoNavegacion;
      if (this.hormiga && this.ultimoDestino && !this.modoAutonomo) {
        this.calcularYCaminarlizar(this.ultimoDestino);
      } else {
        this.actualizarHUD();
      }
    } else if (event.key === 'm' || event.key === 'M') {
      this.modoAutonomo = !this.modoAutonomo;
    if (this.modoAutonomo && this.fsm) {
      if (window.resetFSM) {
        window.resetFSM(this.fsm);
        if (this.fsm.visitadas && this.hormiga && this.hormiga.casilla) {
          for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
              if (Math.abs(dx) + Math.abs(dy) > 4) continue;
              this.fsm.visitadas.add((this.hormiga.casilla.x + dx) + ',' + (this.hormiga.casilla.y + dy));
            }
          }
        }
      }
      if (this.hormiga && window.crearHormiga) {
        this.hormiga = window.crearHormiga(window.hormiguero.x, window.hormiguero.y);
        if (this.hormigaSprite) {
          const hv2 = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, this.tamanoTile) : { x: window.hormiguero.x * 32 + 16, y: window.hormiguero.y * 32 + 16 };
          this.hormigaSprite.x = hv2.x; this.hormigaSprite.y = hv2.y; this.hormigaSprite.setDepth(100);
        }
      }
      this.ultimoDestino = null;
      this.resultadoActual = null;
    }
      this.actualizarHUD();
    } else if (event.key === 'd' || event.key === 'D') {
      this.debugActivo = !this.debugActivo;
      this.dibujarDebug();
    } else if (event.key === ' ') {
      if (this.hormiga) {
        this.hormiga.pausado = !this.hormiga.pausado;
      }
      this.actualizarHUD();
    } else if (event.key === '+' || event.key === '=') {
      if (this.hormiga) {
        this.hormiga.velocidadSim += 0.25;
        if (this.hormiga.velocidadSim > 3.0) this.hormiga.velocidadSim = 3.0;
      }
      this.actualizarHUD();
    } else if (event.key === '-') {
      if (this.hormiga) {
        this.hormiga.velocidadSim -= 0.25;
        if (this.hormiga.velocidadSim < 0.25) this.hormiga.velocidadSim = 0.25;
      }
      this.actualizarHUD();
    } else if (event.key === 'r' || event.key === 'R') {
      if (window.generarMapaProcedural && window.mapa && window.hormiguero && window.fuentesComida) {
        window.generarMapaProcedural(window.ANCHO, window.ALTO, window.mapa, window.hormiguero, window.fuentesComida);
      }
      if (this.fsm && window.resetFSM) {
        window.resetFSM(this.fsm);
        if (this.fsm.visitadas && this.hormiga && this.hormiga.casilla) {
          for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
              if (Math.abs(dx) + Math.abs(dy) > 4) continue;
              this.fsm.visitadas.add((this.hormiga.casilla.x + dx) + ',' + (this.hormiga.casilla.y + dy));
            }
          }
        }
      }
      this.regenerarVisual();
    } else if (event.key === 't' || event.key === 'T') {
      if (window.inicializarMapaPrueba) {
        window.inicializarMapaPrueba();
      }
      if (this.fsm && window.resetFSM) {
        window.resetFSM(this.fsm);
        if (this.fsm.visitadas && this.hormiga && this.hormiga.casilla) {
          for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
              if (Math.abs(dx) + Math.abs(dy) > 4) continue;
              this.fsm.visitadas.add((this.hormiga.casilla.x + dx) + ',' + (this.hormiga.casilla.y + dy));
            }
          }
        }
      }
      this.regenerarVisual();
    }
  }

  update(time, delta) {
    // sincronización por firma
    let sumaPorciones = 0;
    let cantFuentes = 0;
    if (window.fuentesComida) {
      cantFuentes = window.fuentesComida.length;
      for (let i = 0; i < window.fuentesComida.length; i++) {
        sumaPorciones += (window.fuentesComida[i].porciones || 0);
      }
    }
    const firma = cantFuentes + '|' + sumaPorciones + '|' + (this.fsm ? this.fsm.llevaComida : false) + '|' + (this.fsm ? this.fsm.comidaEntregada : 0);
    if (firma !== this._firmaComida) {
      this._firmaComida = firma;
      this.dibujarComidas(this.tamanoTile || 32);
      this.dibujarCarga();
      this.dibujarEntrega();
    }
    if (this.hormiga && window.actualizarHormiga) {
      const casillaAntes = this.hormiga.casilla ? { x: this.hormiga.casilla.x, y: this.hormiga.casilla.y } : null;
      // verificar antes de avanzar
      if (this.hormiga.enMovimiento && !this.hormiga.pausado && this.hormiga.camino && this.hormiga.indiceCamino < this.hormiga.camino.length) {
        const sig = this.hormiga.camino[this.hormiga.indiceCamino];
        if (sig && window.esTransitable && !window.esTransitable(sig.x, sig.y)) {
          if (this.ultimoDestino && !this.modoAutonomo) {
            this.calcularYCaminarlizar(this.ultimoDestino);
            window.actualizarHormiga(this.hormiga, delta, window.costo);
            const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, this.tamanoTile) : { x: this.hormiga.casilla.x * 32 + 16, y: this.hormiga.casilla.y * 32 + 16 };
            if (this.hormigaSprite) { this.hormigaSprite.x = hv.x; this.hormigaSprite.y = hv.y; this.hormigaSprite.setDepth(100); }
            this.dibujarDebug();
            this.actualizarHUD();
            return;
          } else if (this.modoAutonomo) {
            if (this.fsm && window.marcarInaccesible) window.marcarInaccesible(this.fsm, this.ultimoDestino ? this.ultimoDestino.x : sig.x, this.ultimoDestino ? this.ultimoDestino.y : sig.y);
            this.hormiga.enMovimiento = false;
            this.hormiga.camino = [];
            // no frenar si transitable - only if blocked
          } else {
            this.hormiga.enMovimiento = false;
            this.hormiga.camino = [];
          }
        }
        // if transitable, do nothing special
      }
      window.actualizarHormiga(this.hormiga, delta, window.costo);
      // bajar energia UNA SOLA VEZ por casilla completada
      if (this.fsm && window.bajarEnergia && casillaAntes && this.hormiga.casilla) {
        if (casillaAntes.x !== this.hormiga.casilla.x || casillaAntes.y !== this.hormiga.casilla.y) {
          const cst = window.costo ? window.costo(this.hormiga.casilla.x, this.hormiga.casilla.y) : 1;
          window.bajarEnergia(this.fsm, cst);
          // marcar radio 4 como explorado SOLO al pisar casilla completada
          if (this.fsm.visitadas) {
            for (let dy = -4; dy <= 4; dy++) {
              for (let dx = -4; dx <= 4; dx++) {
                if (Math.abs(dx) + Math.abs(dy) > 4) continue;
                this.fsm.visitadas.add((this.hormiga.casilla.x + dx) + ',' + (this.hormiga.casilla.y + dy));
              }
            }
          }
          // olfato al completar casilla en EXPLORAR
          if (this.modoAutonomo && this.fsm.estado === 'EXPLORAR' && window.olfatear && window.elegirComida) {
            window.olfatear(this.fsm, this.hormiga, window.fuentesComida);
            const comida = window.elegirComida(this.fsm, this.hormiga, window.fuentesComida);
            if (comida) {
              this.hormiga.enMovimiento = false;
              this.hormiga.camino = [];
              this.hormiga.indiceCamino = 0;
              const ant = this.fsm.estado;
              this.fsm.estado = 'IR_A_LA_COMIDA';
              this.fsm.destinoActual = { x: comida.x, y: comida.y };
              this.fsm.destinoActualRef = comida;
              if (window.fsm && window.fsm.logCambioEstado) {
                // no direct access, use console
              }
              try { console.log('FSM cambio:', ant, '->', this.fsm.estado, '| energia:', this.fsm.energia, '| llevaComida:', this.fsm.llevaComida); } catch(e){}
              this.ultimoDestino = { x: comida.x, y: comida.y };
              if (typeof window !== 'undefined') { window.modoNavegacion = this.modoNavegacion; window.algoritmoActivo = this.algoritmoActivo; window._bfsAvisoSeguro = false; }
              let res = null;
              if (this.algoritmoActivo === 'bfs') res = window.bfs(this.hormiga.casilla, comida, window.costo, 'bfs');
              else if (this.algoritmoActivo === 'dijkstra') res = window.dijkstra(this.hormiga.casilla, comida, window.costo, 'dijkstra');
              else if (this.algoritmoActivo === 'astar') res = window.astar(this.hormiga.casilla, comida, window.costo, 'astar');
              this.resultadoActual = res;
              if (res && res.camino && window.iniciarCamino) window.iniciarCamino(this.hormiga, res.camino);
            }
          }
        }
      }
      const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, this.tamanoTile) : { x: this.hormiga.casilla.x * 32 + 16, y: this.hormiga.casilla.y * 32 + 16 };
      if (this.hormigaSprite) {
        this.hormigaSprite.x = hv.x;
        this.hormigaSprite.y = hv.y;
        this.hormigaSprite.setDepth(100);
      }
      if (this.grupoCarga && this.grupoCarga.getLength && this.grupoCarga.getLength() > 0) {
        this.grupoCarga.clear(true, true);
        if (this.fsm && this.fsm.llevaComida) {
          const circ = this.add.circle(hv.x, hv.y - 10, 3, 0xFF6347);
          circ.setStrokeStyle(1, 0x000000);
          circ.setDepth(150);
          this.grupoCarga.add(circ);
        }
      } else {
        this.dibujarCarga();
      }
    }

    // FSM autónoma
    if (this.modoAutonomo && this.fsm && window.actualizarFSM) {
      if (!this.hormiga.enMovimiento) {
        if (this.fsm.memoriaConocidas && this.fsm.memoriaConocidas.length === 0) {
          if (window.olfatear) window.olfatear(this.fsm, this.hormiga, window.fuentesComida);
        }
      }
      const resF = window.actualizarFSM(this.fsm, this.hormiga, { mapa: window.mapa, hormiguero: window.hormiguero, fuentesComida: window.fuentesComida, ANCHO: window.ANCHO, ALTO: window.ALTO, modoAutonomo: this.modoAutonomo }, delta);
      if (resF && resF.destino && !this.hormiga.enMovimiento) {
        this.ultimoDestino = { x: resF.destino.x, y: resF.destino.y };
        if (typeof window !== 'undefined') { window.modoNavegacion = this.modoNavegacion; window.algoritmoActivo = this.algoritmoActivo; window._bfsAvisoSeguro = false; }
        let res = null;
        if (this.algoritmoActivo === 'bfs') res = window.bfs(this.hormiga.casilla, resF.destino, window.costo, 'bfs');
        else if (this.algoritmoActivo === 'dijkstra') res = window.dijkstra(this.hormiga.casilla, resF.destino, window.costo, 'dijkstra');
        else if (this.algoritmoActivo === 'astar') res = window.astar(this.hormiga.casilla, resF.destino, window.costo, 'astar');
        this.resultadoActual = res;
        if (res && res.camino && window.iniciarCamino) window.iniciarCamino(this.hormiga, res.camino);
        else if (res && res.camino === null && this.fsm) { if (window.marcarInaccesible) window.marcarInaccesible(this.fsm, resF.destino.x, resF.destino.y); }
      }
    }

    // forzar redibujo por firma si cambió
    let sumaPorciones2 = 0;
    let cantFuentes2 = 0;
    if (window.fuentesComida) {
      cantFuentes2 = window.fuentesComida.length;
      for (let i = 0; i < window.fuentesComida.length; i++) {
        sumaPorciones2 += (window.fuentesComida[i].porciones || 0);
      }
    }
    const firma2 = cantFuentes2 + '|' + sumaPorciones2 + '|' + (this.fsm ? this.fsm.llevaComida : false) + '|' + (this.fsm ? this.fsm.comidaEntregada : 0);
    if (firma2 !== this._firmaComida) {
      this._firmaComida = firma2;
      this.dibujarComidas(this.tamanoTile || 32);
      this.dibujarCarga();
      this.dibujarEntrega();
    }
    this.dibujarDebug();
    this.actualizarHUD();
  }
}

window.JuegoEscena = JuegoEscena;
