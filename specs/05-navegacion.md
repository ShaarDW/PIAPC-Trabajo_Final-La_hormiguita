# 05 — Navegación: ruta directa y ruta segura, y bloqueos

## Objetivo
Dos formas seleccionables de decidir qué camino es bueno (directa y segura) y respuesta a obstáculos puestos en vivo.

## Comportamiento esperado
- Tecla `N` alterna entre **ruta directa** y **ruta segura**; el HUD lo muestra.
- **Ruta directa:** costos normales del terreno.
- **Ruta segura:**
  - Dijkstra y A*: las zonas expuestas suman una penalización alta (por ejemplo +20) y sus casillas vecinas una menor (+5). La hormiga rodea si existe alternativa razonable.
  - Los tres algoritmos tratan un costo Infinity como no transitable. `costoSeguro` devuelve Infinity en zonas expuestas cuando el algoritmo es BFS; si da `null`, reintentar con `costoDirecto` y avisar "BFS: sin ruta segura, cruza zona expuesta".
- Al cambiar de modo con la hormiga en movimiento, recalcula desde su casilla actual.
- **Edición en vivo:** Shift + clic izquierdo da destino a la hormiga (herramienta de prueba). Clic izquierdo solo pone o saca piedras. Clic derecho deja una fuente de comida.
  - No se puede poner piedra sobre la hormiga, sobre la casilla a la que se está moviendo, sobre el hormiguero ni sobre la comida. Las piedras del borde no se pueden sacar.
  - Clic derecho: comida solo en casillas transitables sin comida, sin hormiga ni hormiguero. Desactivar menú contextual.
- **Bloqueos:** antes de avanzar a la siguiente casilla, la hormiga verifica que siga siendo transitable. Si no, recalcula desde donde está.
- Si el recálculo da `null`, se queda en su casilla y avisa "sin camino" (en la spec 06 la FSM elige otro objetivo).
- Con `D`, marcar las casillas vecinas penalizadas de las zonas expuestas.

## Fuera de alcance
Feromonas, evasión de obstáculos móviles, diagonales.

## Cómo comprobarlo
- Con una zona expuesta entre el hormiguero y el destino: en ruta directa la cruza, en ruta segura la rodea.
- Si la zona expuesta corta el mapa de lado a lado, en ruta segura con Dijkstra/A* igual la cruza (por la parte más corta) y con BFS aparece el aviso.
- Poner una piedra justo delante de la hormiga: se detiene y toma otro camino sin atravesarla.
- Encerrar el destino con piedras: la hormiga no atraviesa nada y queda en un lugar válido.
- En mapas sin zonas expuestas en el camino, ambas rutas coinciden (explicable: no hay nada que evitar).
