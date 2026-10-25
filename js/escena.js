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

    // HUD
    this.actualizarHUD();

    // Input
    this.input.on('pointerdown', this.onClick, this);

    // Teclado
    this.input.keyboard.on('keydown', this.onKey, this);
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
    hud.innerHTML = '<div>Algoritmo: ' + algo + '</div>' +
                    '<div>Debug (D): ' + (this.debugActivo ? 'ON' : 'OFF') + '</div>' +
                    '<div>Costo camino: ' + costo + '</div>' +
                    '<div>Exploradas: ' + exploradas + '</div>' +
                    (this.resultadoActual && this.resultadoActual.camino === null ? '<div>sin camino</div>' : '');
  }

  limpiarDebug() {
    this.grupoExploradas.clear(true, true);
    this.grupoCamino.clear(true, true);
  }

  dibujarDebug() {
    this.limpiarDebug();
    if (!this.resultadoActual) {
      this.actualizarHUD();
      return;
    }
    const t = this.tamanoTile || 32;

    // Dibujar camino siempre
    if (this.resultadoActual.camino) {
      for (let i = 0; i < this.resultadoActual.camino.length; i++) {
        const p = this.resultadoActual.camino[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 4, t - 4, 0x00FF00, 0.4);
        rect.setStrokeStyle(2, 0x00FF00);
        this.grupoCamino.add(rect);
      }
    }

    // Dibujar exploradas solo con D
    if (this.debugActivo && this.resultadoActual.exploradas) {
      for (let i = 0; i < this.resultadoActual.exploradas.length; i++) {
        const p = this.resultadoActual.exploradas[i];
        const rect = this.add.rectangle(p.x * t + 16, p.y * t + 16, t - 8, t - 8, 0x87CEEB, 0.25);
        this.grupoExploradas.add(rect);
      }
    }

    this.actualizarHUD();
  }

  calcularHacia(destino) {
    if (!destino) return;
    this.ultimoDestino = { x: destino.x, y: destino.y };
    let res = null;
    const inicio = { x: window.hormiguero.x, y: window.hormiguero.y };
    if (this.algoritmoActivo === 'bfs') {
      res = window.bfs(inicio, destino, window.costo);
    } else if (this.algoritmoActivo === 'dijkstra') {
      res = window.dijkstra(inicio, destino, window.costo);
    } else if (this.algoritmoActivo === 'astar') {
      res = window.astar(inicio, destino, window.costo);
    }
    this.resultadoActual = res;
    this.dibujarDebug();
  }

  onClick(pointer) {
    const t = this.tamanoTile || 32;
    const tx = Math.floor(pointer.worldX / t);
    const ty = Math.floor(pointer.worldY / t);
    if (tx < 0 || tx >= window.ANCHO || ty < 0 || ty >= window.ALTO) return;
    this.calcularHacia({ x: tx, y: ty });
  }

  onKey(event) {
    if (event.key === '1') {
      this.algoritmoActivo = 'bfs';
      if (this.ultimoDestino) this.calcularHacia(this.ultimoDestino);
      else this.actualizarHUD();
    } else if (event.key === '2') {
      this.algoritmoActivo = 'dijkstra';
      if (this.ultimoDestino) this.calcularHacia(this.ultimoDestino);
      else this.actualizarHUD();
    } else if (event.key === '3') {
      this.algoritmoActivo = 'astar';
      if (this.ultimoDestino) this.calcularHacia(this.ultimoDestino);
      else this.actualizarHUD();
    } else if (event.key === 'd' || event.key === 'D') {
      this.debugActivo = !this.debugActivo;
      this.dibujarDebug();
    }
  }
}

window.JuegoEscena = JuegoEscena;
