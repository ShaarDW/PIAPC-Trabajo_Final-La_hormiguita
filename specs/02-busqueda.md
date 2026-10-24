# 02 — Algoritmos de búsqueda

## Objetivo
Calcular caminos entre dos casillas con BFS, Dijkstra y A*, seleccionables en vivo y visibles en modo depuración.

## Comportamiento esperado
- Una función por algoritmo con la misma firma: recibe el mapa, el inicio, el destino y una función de costo; devuelve `{ camino, exploradas }`.
  - `camino`: lista de casillas desde el inicio hasta el destino, o `null` si no hay camino.
  - `exploradas`: casillas que el algoritmo expandió, en orden.
- **BFS:** ignora costos; devuelve el camino con menos casillas.
- **Dijkstra:** usa la función de costo; devuelve el camino de menor costo total.
- **A\*:** igual que Dijkstra, con heurística de distancia Manhattan.
- Teclas `1` / `2` / `3` cambian el algoritmo activo; el HUD lo muestra.
- Tecla `D` alterna la depuración: casillas exploradas en un color tenue y camino resultante resaltado.
- Para probar sin hormiga: clic en una casilla calcula y muestra el camino desde el hormiguero hasta ahí (esto se reemplaza en la spec 03).

## Fuera de alcance
Movimiento de la hormiga, ruta segura (spec 05), generación de mapas.

## Cómo comprobarlo
- En un tramo con barro en línea recta, BFS cruza el barro y Dijkstra/A* lo rodean.
- En terreno sólo de tierra, los tres dan caminos de igual largo.
- Con depuración activa, A* muestra menos casillas exploradas que Dijkstra en la mayoría de los casos.
- Dijkstra y A* dan siempre el mismo costo total.
- Un destino rodeado de piedras devuelve `null` en los tres, sin errores ni cuelgues.
- Ningún camino atraviesa piedras.
