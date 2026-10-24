# 06 — Comportamiento de la hormiga (FSM)

## Objetivo
Que la hormiga decida sola: explore, huela comida, la recuerde, la lleve al hormiguero y vuelva a descansar cuando le falta energía.

## Comportamiento esperado

### Percepción y memoria
- **Olfato:** cada vez que llega a una casilla, detecta las fuentes de comida a 4 casillas o menos (distancia Manhattan). Las agrega a su memoria.
- **Memoria:** lista de fuentes conocidas con porciones restantes; lista de fuentes inaccesibles (se borra cuando el jugador cambia el mapa).
- **Casillas visitadas:** registro para elegir puntos de exploración nuevos.
- **Energía:** 100 al inicio; baja según el costo de cada casilla pisada. Umbral bajo: 30.

### Estados
- **EXPLORAR:** elige un punto transitable no visitado, alcanzable, preferentemente lejos de lo visitado; va hacia él. Al llegar, elige otro. Si huele o recuerda comida → IR A LA COMIDA.
- **IR A LA COMIDA:** entre las fuentes conocidas y accesibles, elige la de mejor `porciones / costo del camino`. Al llegar → RECOGER. Si la fuente ya no existe o no tiene camino, la marca y elige otra; si no queda ninguna → EXPLORAR.
- **RECOGER:** pausa breve, toma 1 porción (la fuente baja una porción; desaparece en 0) → VOLVER AL HORMIGUERO.
- **VOLVER AL HORMIGUERO:** ruta al hormiguero con algoritmo y navegación activos. Al llegar → DESCANSAR.
- **DESCANSAR:** entrega la comida (+1 al contador), recupera la energía al 100 tras una pausa. Luego → IR A LA COMIDA si recuerda alguna, si no → EXPLORAR.
- **Transición global:** si la energía baja de 30 y no lleva comida → VOLVER AL HORMIGUERO. Si lleva comida, termina el viaje igual.
- **Sin ningún objetivo alcanzable:** espera en su casilla y lo vuelve a intentar cuando el mapa cambia.

### HUD
Estado actual, energía, comida entregada, algoritmo y navegación. Con depuración: radio de olfato y fuentes recordadas marcadas.

## Fuera de alcance
Varias hormigas, feromonas, pájaros que se muevan, morir por falta de energía.

## Cómo comprobarlo
- Al iniciar, la hormiga explora; cuando una comida entra en su radio, cambia a IR A LA COMIDA.
- No va hacia comida que todavía no olió.
- Completa ciclos comida → hormiguero y el contador aumenta; las fuentes se agotan y desaparecen.
- Con poca energía y sin carga, vuelve al hormiguero aunque recuerde comida.
- Encerrar la comida elegida con piedras: la marca inaccesible y va a otra o explora.
- Al presionar `R`, todo el ciclo vuelve a funcionar en el mapa nuevo con rutas distintas.
- Cambiar algoritmo y navegación en medio del ciclo no rompe el comportamiento.
