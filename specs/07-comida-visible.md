# 07 — Comida que se gasta y se transporta

## Objetivo
Que se vea cómo la hormiga consume las fuentes: cada porción se ve en el mapa, la hormiga la lleva encima hasta el hormiguero y, cuando se agotan todas, el mapa queda sin comida.

## Comportamiento esperado
- **Fuentes con porciones visibles:** cada fuente se dibuja como un grupo de migas, una por porción restante (2 a 4), dentro de su casilla. Al recoger, desaparece una miga.
- **Al llegar a 0**, la fuente desaparece del mapa (ya se quita de los datos; ahora también del dibujo).
- **Carga:** mientras `llevaComida` es verdadero, la hormiga lleva una miga dibujada encima, que se mueve con ella.
- **Entrega:** al llegar al hormiguero en DESCANSAR, la miga desaparece de la hormiga y se suma a una pequeña pila junto al hormiguero (o un contador visible al lado), además del contador del HUD.
- **Sin comida en el mapa:** cuando no quedan fuentes, el HUD muestra "No queda comida" y la hormiga sigue explorando. Si el jugador pone comida con clic derecho, la puede encontrar.
- **Sincronía:** el dibujo de la comida se actualiza cada vez que cambian las porciones o la lista `fuentesComida` (recoger, clic derecho, R, T), leyendo siempre los datos reales; nunca lleva una cuenta propia.
- La lógica de la FSM no cambia.

## Fuera de alcance
Animaciones elaboradas (van en la spec 08), varias porciones por viaje, que la comida reaparezca sola.

## Cómo comprobarlo
- Al iniciar, cada fuente muestra entre 2 y 4 migas.
- Cada vez que el log muestra `RECOGER -> VOLVER_AL_HORMIGUERO`, la fuente tiene una miga menos y la hormiga lleva una encima.
- Al entregar, la miga pasa al hormiguero y sube el contador.
- Una fuente desaparece del mapa exactamente cuando la hormiga deja de volver a ella.
- Dejando correr la simulación, en algún momento no queda comida y aparece el aviso.
- Clic derecho agrega una fuente nueva con sus migas visibles; R y T dibujan la comida del mapa nuevo sin restos del anterior.
