# 03 — Movimiento de la hormiga

## Objetivo
Que la hormiga recorra un camino calculado casilla por casilla, a una velocidad que dependa del terreno.

## Comportamiento esperado
- La hormiga aparece en el hormiguero.
- Recibe un destino, pide el camino al algoritmo activo y lo sigue casilla por casilla con movimiento suave entre centros.
- Tarda más en casillas caras: el tiempo por casilla es proporcional a su costo (el barro se nota lento).
- Si el camino es `null`, no se mueve y el HUD muestra "sin camino".
- Clic izquierdo, por ahora, le da un destino nuevo (reemplaza el clic de prueba de la spec 02).
- Teclas `Espacio` (pausa) y `+` / `-` (velocidad de simulación).
- Con depuración activa, se ve el camino que le queda por recorrer.

## Fuera de alcance
Decisiones propias (FSM), comida, energía, replanificación ante obstáculos nuevos.

## Cómo comprobarlo
- Clic en una casilla lejana: la hormiga llega siguiendo el camino mostrado.
- Cambiar de algoritmo y dar otro destino: se ve la diferencia (BFS entra al barro, A* lo rodea).
- La hormiga nunca queda sobre una piedra.
- Clic en un destino encerrado: la hormiga se queda quieta en una casilla válida y aparece el aviso.
- La pausa congela el movimiento y se reanuda donde estaba.
