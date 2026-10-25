// main.js
window.addEventListener('DOMContentLoaded', function() {
  if (typeof Phaser === 'undefined') {
    console.error('Phaser no cargado');
    return;
  }
  const JuegoEscena = window.JuegoEscena;
  if (!JuegoEscena) {
    console.error('JuegoEscena no definida');
    return;
  }
  try {
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      width: 32 * 24,
      height: 32 * 16,
      parent: document.getElementById('phaser-game'),
      backgroundColor: '#1a1a1a',
      scene: [JuegoEscena]
    });
    console.log('Juego iniciado con class');
  } catch (e) {
    console.error('Error:', e);
  }
});
