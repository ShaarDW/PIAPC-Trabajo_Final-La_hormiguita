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

    // Grupos propios para poder redibujar sin borrar hormiga/hud
    this.grupoMapa = this.add.group();
    this.grupoHormiguero = this.add.group();
    this.grupoComida = this.add.group();
    this.grupoExploradas = this.add.group();
    this.grupoCamino = this.add.group();

    this.dibujarTodo(colores, TAMANO_TILE);

    // Estado búsqueda
    this.algoritmoActivo = 'bfs';
    this.debugActivo = false;
    this.ultimoDestino = null;
    this.resultadoActual = null;

    // Hormiga
    this.hormiga = window.crearHormiga ? window.crearHormiga(window.hormiguero.x, window.hormiguero.y) : {
      casilla: { x: window.hormiguero.x, y: window.hormiguero.y },
      camino: [], indiceCamino: 0, destino: null, enMovimiento: false, pausado: false, velocidadSim: 1.0,
      origenPaso: { x: window.hormiguero.x, y: window.hormiguero.y }, objetivoPaso: { x: window.hormiguero.x, y: window.hormiguero.y },
      tPaso: 0, duracionPaso: 0
    };
    const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, TAMANO_TILE) : { x: window.hormiguero.x * 32 + 16, y: window.hormiguero.y * 32 + 16 };
    this.hormigaSprite = this.add.rectangle(hv.x, hv.y, 14, 14, 0x000000).setStrokeStyle(2, 0xFFFFFF);
    this.hormigaSprite.setDepth(100);

    this.actualizarHUD();

    // Input
    this.input.on('pointerdown', this.onClick, this);
    this.input.keyboard.on('keydown', this.onKey, this);

    this.lastTime = this.time.now;

    // Generar mapa al iniciar si existe generador
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
    if (window.fuentesComida) {
      for (let i = 0; i < window.fuentesComida.length; i++) {
        const c = window.fuentesComida[i];
        const circ = this.add.circle(c.x * 32 + 16, c.y * 32 + 16, 6, 0xFF6347);
        circ.setStrokeStyle(2, 0x000000);
        circ.setDepth(10);
        this.grupoComida.add(circ);
      }
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
    this.ultimoDestino = null;
    this.resultadoActual = null;
    this.grupoExploradas.clear(true, true);
    this.grupoCamino.clear(true, true);
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
    hud.innerHTML = '<div>Algoritmo: ' + algo + '</div>' +
                    '<div>Debug (D): ' + (this.debugActivo ? 'ON' : 'OFF') + '</div>' +
                    '<div>Costo camino: ' + costo + '</div>' +
                    '<div>Exploradas: ' + exploradas + '</div>' +
                    '<div>Hormiga: ' + mov + '</div>' +
                    '<div>Vel: ' + (this.hormiga ? this.hormiga.velocidadSim.toFixed(2) : '1.00') + '</div>' +
                    '<div>R: regenerar | T: mapa prueba</div>' +
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

    if (this.debugActivo && this.resultadoActual && this.resultadoActual.exploradas) {
      for (let i = 0; i < this.resultadoActual.exploradas.length; i++) {
        const p = this.resultadoActual.exploradas[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 8, t - 8, 0x87CEEB, 0.25);
        rect.setDepth(40);
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
      if (this.hormiga) {
        this.hormiga.camino = [];
        this.hormiga.indiceCamino = 0;
        this.hormiga.enMovimiento = false;
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
  }

  onKey(event) {
    if (event.key === '1') {
      this.algoritmoActivo = 'bfs';
      if (this.hormiga && this.ultimoDestino) {
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
    } else if (event.key === 'r' || event.key === 'R') {
      if (window.generarMapaProcedural && window.mapa && window.hormiguero && window.fuentesComida) {
        window.generarMapaProcedural(window.ANCHO, window.ALTO, window.mapa, window.hormiguero, window.fuentesComida);
      }
      this.regenerarVisual();
    } else if (event.key === 't' || event.key === 'T') {
      if (window.inicializarMapaPrueba) {
        window.inicializarMapaPrueba();
      }
      this.regenerarVisual();
    }
  }

  update(time, delta) {
    if (this.hormiga && window.actualizarHormiga) {
      window.actualizarHormiga(this.hormiga, delta, window.costo);
      const hv = window.obtenerPosicionVisual ? window.obtenerPosicionVisual(this.hormiga, this.tamanoTile) : { x: this.hormiga.casilla.x * 32 + 16, y: this.hormiga.casilla.y * 32 + 16 };
      if (this.hormigaSprite) {
        this.hormigaSprite.x = hv.x;
        this.hormigaSprite.y = hv.y;
        this.hormigaSprite.setDepth(100);
      }
    }
    this.dibujarDebug();
    this.actualizarHUD();
  }
}

window.JuegoEscena = JuegoEscena;
