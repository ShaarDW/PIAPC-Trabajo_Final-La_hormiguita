// escena.js
class JuegoEscena extends Phaser.Scene {
  constructor() {
    super({ key: 'JuegoEscena' });
  }

  create() {
    const TAMANO_TILE = 32;
    const colores = {
      'tierra': 0x8B7355,
      'pasto_alto': 0x6B8E23,
      'barro': 0x654321,
      'expuesta': 0xD2691E,
      'piedra': 0x2F2F2F
    };

    for (let y = 0; y < window.ALTO; y++) {
      for (let x = 0; x < window.ANCHO; x++) {
        const celda = window.mapa[y][x];
        const color = colores[celda.tipo] || 0x000000;
        const rect = this.add.rectangle(x * TAMANO_TILE + 16, y * TAMANO_TILE + 16, TAMANO_TILE - 1, TAMANO_TILE - 1, color);
        rect.setStrokeStyle(1, 0x000000);
      }
    }

    this.add.rectangle(window.hormiguero.x * 32 + 16, window.hormiguero.y * 32 + 16, 16, 16, 0xFFD700).setStrokeStyle(2, 0x000000);

    if (window.fuentesComida) {
      for (let i = 0; i < window.fuentesComida.length; i++) {
        const c = window.fuentesComida[i];
        this.add.circle(c.x * 32 + 16, c.y * 32 + 16, 6, 0xFF6347).setStrokeStyle(2, 0x000000);
      }
    }
  }
}

window.JuegoEscena = JuegoEscena;
