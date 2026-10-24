# 04 — Generación de escenarios

## Objetivo
Generar mapas distintos con la tecla `R`, siempre válidos y jugables, para comprobar que las rutas se adaptan.

## Comportamiento esperado
- Al iniciar y al presionar `R` se genera un mapa nuevo, reemplazando el fijo de la spec 01.
- Pasos de generación:
  1. Todo tierra; borde de piedra.
  2. Manchas de piedras/ramas (grupos de varias casillas, no sueltas).
  3. Manchas de pasto alto y barro.
  4. Una o dos zonas expuestas (rectángulos o manchas).
  5. Hormiguero en una casilla transitable, con el área 3 × 3 a su alrededor libre de piedras.
  6. Entre 4 y 7 fuentes de comida en casillas transitables, cada una con 2 a 4 porciones.
- **Validación:** flood fill (BFS) desde el hormiguero. Cada comida no alcanzable se reubica en una casilla alcanzable. Si no hay suficientes casillas alcanzables, se descarta el mapa y se vuelve a generar (máximo 50 intentos).
- Al menos una comida debe estar a más de 4 casillas del hormiguero (fuera del olfato inicial).
- Al regenerar, la hormiga vuelve al hormiguero y se olvida de lo que sabía.

## Fuera de alcance
Semillas, guardado de mapas, ajustes de dificultad.

## Cómo comprobarlo
- Presionar `R` varias veces: cada mapa es distinto en obstáculos, terreno, hormiguero y comida.
- En ningún mapa hay comida ni hormiguero sobre piedras.
- Darle a la hormiga como destino cada comida (clic): siempre llega.
- Las rutas a un mismo tipo de objetivo cambian de forma entre mapas.
