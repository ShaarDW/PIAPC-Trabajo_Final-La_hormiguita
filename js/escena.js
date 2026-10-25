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

    // Dibujar mapa
    for (let y = 0; y < window.ALTO; y++) {
      for (let x = 0; x < window.ANCHO; x++) {
        const celda = window.mapa[y][x];
        const color = colores[celda.tipo] || 0x000000;
        const rect = this.add.rectangle(x * TAMANO_TILE + 16, y * TAMANO_TILE + 16, TAMANO_TILE - 1, TAMANO_TILE - 1, color);
        rect.setStrokeStyle(1, 0x000000);
      }
    }

    // Hormiguero
    this.add.rectangle(window.hormiguero.x * 32 + 16, window.hormiguero.y * 32 + 16, 16, 16, 0xFFD700).setStrokeStyle(2, 0x000000);

    // Comida
    if (window.fuentesComida) {
      for (let i = 0; i < window.fuentesComida.length; i++) {
        const c = window.fuentesComida[i];
        this.add.circle(c.x * 32 + 16, c.y * 32 + 16, 6, 0xFF6347).setStrokeStyle(2, 0x000000);
      }
    }

    // Estado búsqueda
    this.algoritmoActivo = 'bfs';
    this.debugActivo = false;
    this.ultimoDestino = null;
    this.resultadoActual = null;

    // Grupos para debug
    this.grupoExploradas = this.add.group();
    this.grupoCamino = this.add.group();

    // Hormiga
    this.hormiga = window.crearHormiga ? window.crearHormiga(window.hormiguero.x, window.hormiguero.y) : {
      casilla: { x: window.hormiguero.x, y: window.hormiguero.y },
      camino: [], indiceCamino: 0, destino: null, enMovimiento: false, pausado: false, velocidadSim: 1.0,
      origenPaso: { x: window.hormiguero.x, y: window.hormiguero.y }, objetivoPaso: { x: window.hormiguero.x, y: window.hormiguero.y },
      tPaso: 0, duracionPaso: 0
    };
    const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, TAMANO_TILE) : { x: window.hormiguero.x * 32 + 16, y: window.hormiguero.y * 32 + 16 };
    this.hormigaSprite = this.add.rectangle(hv.x, hv.y, 14, 14, 0x000000).setStrokeStyle(2, 0xFFFFFF);

    this.actualizarHUD();

    // Input
    this.input.on('pointerdown', this.onClick, this);
    this.input.keyboard.on('keydown', this.onKey, this);

    // Tiempo
    this.lastTime = this.time.now;
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
    hud.innerHTML = '<div>Algoritmo: ' + algo + '</div>' +
                    '<div>Debug (D): ' + (this.debugActivo ? 'ON' : 'OFF') + '</div>' +
                    '<div>Costo camino: ' + costo + '</div>' +
                    '<div>Exploradas: ' + exploradas + '</div>' +
                    '<div>Hormiga: ' + mov + '</div>' +
                    '<div>Vel: ' + (this.hormiga ? this.hormiga.velocidadSim.toFixed(2) : '1.00') + '</div>' +
                    (this.resultadoActual && this.resultadoActual.camino === null ? '<div>sin camino</div>' : '');
  }

  limpiarDebug() {
    this.grupoExploradas.clear(true, true);
    this.grupoCamino.clear(true, true);
  }

  dibujarDebug() {
    this.limpiarDebug();
    const t = this.tamanoTile || 32;
    if (!this.hormiga) {
      this.actualizarHUD();
      return;
    }
    // Camino restante siempre visible
    const restante = window.getCaminoRestante ? window.getCaminoRestante(this.hormiga) : [];
    if (restante && restante.length > 0) {
      for (let i = 0; i < restante.length; i++) {
        const p = restante[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 4, t - 4, 0x00FF00, 0.35);
        rect.setStrokeStyle(2, 0x00FF00);
        this.grupoCamino.add(rect);
      }
    } else if (this.resultadoActual && this.resultadoActual.camino) {
      // si no hay camino restante pero hay resultado, mostrarlo completo
      for (let i = 0; i < this.resultadoActual.camino.length; i++) {
        const p = this.resultadoActual.camino[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 4, t - 4, 0x00FF00, 0.2);
        rect.setStrokeStyle(1, 0x00FF00);
        this.grupoCamino.add(rect);
      }
    }

    // Exploradas solo con D
    if (this.debugActivo && this.resultadoActual && this.resultadoActual.exploradas) {
      for (let i = 0; i < this.resultadoActual.exploradas.length; i++) {
        const p = this.resultadoActual.exploradas[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 8, t - 8, 0x87CEEB, 0.25);
        this.grupoExploradas.add(rect);
      }
    }

    this.actualizarHUD();
  }

  calcularYCaminarlizar(destino) {
    if (!destino || !this.hormiga) return;
    this.ultimoDestino = { x: destino.x, y: destino.y };
    const inicio = { x: this.hormiga.casilla.x, y: this.hormiga.casilla.y };
    let res = null;
    if (this.algoritmoActivo === 'bfs') {
      res = window.bfs(inicio, destino, window.costo);
    } else if (this.algoritmoActivo === 'dijkstra') {
      res = window.dijkstra(inicio, destino, window.costo);
    } else if (this.algoritmoActivo === 'astar') {
      res = window.astar(inicio, destino, window.costo);
    }
    this.resultadoActual = res;
    if (!res || res.camino === null) {
      this.hormiga.camino = [];
      this.hormiga.indiceCamino = 0;
      this.hormiga.enMovimiento = false;
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
    // Clic mientras se mueve: terminar paso actual y recalcular desde esa casilla
    if (this.hormiga && this.hormiga.enMovimiento && !this.hormiga.pausado) {
      // Completar paso actual moviendo posición lógica
      if (this.hormiga.objetivoPaso) {
        this.hormiga.casilla.x = this.hormiga.objetivoPaso.x;
        this.hormiga.casilla.y = this.hormiga.objetivoPaso.y;
        this.hormiga.indiceCamino++;
      }
      this.hormiga.tPaso = 0;
      this.hormiga.enMovimiento = false;
    }
    this.calcularYCaminarlizar({ x: tx, y: ty });
  }

  onKey(event) {
    if (event.key === '1') {
      this.algoritmoActivo = 'bfs';
      if (this.hormiga && this.ultimoDestino) {
        // recalcular desde su casilla hacia el mismo destino
        this.calcularYCaminarlizar(this.ultimoDestino);
      } else {
        this.actualizarHUD();
      }
    } else if (event.key === '2') {
      this.algoritmoActivo = 'dijkstra';
      if (this.hormiga && this.ultimoDestino) {
        this.calcularYCaminarlizar(this.ultimoDestino);
      } else {
        this.actualizarHUD();
      }
    } else if (event.key === '3') {
      this.algoritmoActivo = 'astar';
      if (this.hormiga && this.ultimoDestino) {
        this.calcularYCaminarlizar(this.ultimoDestino);
      } else {
        this.actualizarHUD();
      }
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
    }
  }

  update(time, delta) {
    if (this.hormiga && window.actualizarHormiga) {
      window.actualizarHormiga(this.hormiga, delta, window.costo);
      const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, this.tamanoTile) : { x: this.hormiga.casilla.x * 32 + 16, y: this.hormiga.casilla.y * 32 + 16 };
      if (this.hormigaSprite) {
        this.hormigaSprite.x = hv.x;
        this.hormigaSprite.y = hv.y;
      }
    }
    // Actualizar debug dibujo para camino restante
    this.dibujarDebug();
    this.actualizarHUD();
  }
}

window.JuegoEscena = JuegoEscena;
