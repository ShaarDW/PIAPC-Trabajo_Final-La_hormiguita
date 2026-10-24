# 01 — Mapa en grilla

## Objetivo
Tener un mapa de casillas dibujado en pantalla, con tipos de terreno y costos, que sirva de base para todo lo demás.

## Comportamiento esperado
- Proyecto web con Phaser 4 que se abre en el navegador.
- Grilla de 24 × 16 casillas, cada una con un tipo: tierra (costo 1), pasto alto (3), barro (5), zona expuesta (1) o piedra (no transitable).
- Cada tipo se dibuja con un color distinto; el hormiguero y la comida se dibujan con formas simples.
- El mapa se guarda como datos (una matriz), separado del dibujo, para que la búsqueda pueda leerlo.
- Funciones auxiliares: `esTransitable(x, y)`, `costo(x, y)`, `vecinos(x, y)` (4 direcciones, sin diagonales).
- Para esta spec alcanza con un mapa fijo de prueba escrito a mano.
- Panel de texto (HUD) arriba o al costado, vacío por ahora, preparado para mostrar estado.

## Fuera de alcance
Generación procedural, hormiga, búsqueda, controles.

## Cómo comprobarlo
- Abrir el prototipo: se ve la grilla con los cinco tipos de casilla distinguibles.
- Se ven el hormiguero y al menos una fuente de comida.
- Desde la consola del navegador, `vecinos` de una casilla junto a una piedra no devuelve la piedra.
- Las casillas del borde son piedra.
