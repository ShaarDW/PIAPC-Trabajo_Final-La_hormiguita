# 08 — Presentación visual

## Objetivo
Que el prototipo se vea cuidado y agradable para la demo, manteniendo la grilla de casillas y sin cambiar la lógica de la IA.

## Comportamiento esperado

### Terreno (sigue siendo una casilla por celda)
- Paleta coherente de jardín, con colores más suaves que los actuales.
- Cada tipo de casilla con un detalle propio, generado por código (sin imágenes externas):
  - Tierra: puntitos o granos con leve variación de tono entre casillas.
  - Pasto alto: briznas que se mecen suavemente.
  - Barro: tono oscuro con manchas o brillo húmedo.
  - Zona expuesta: tono claro de sol, con la sombra de un pájaro que la cruza de vez en cuando (decorativa, no afecta la lógica).
  - Piedra: forma redondeada con sombra y relieve, sobre tierra.
- Líneas de grilla sutiles (o ninguna) en vez de bordes negros marcados.
- El dibujo del terreno se genera una sola vez por mapa (textura o render texture) para no redibujar todo en cada frame.

### Personajes y objetos
- Hormiga dibujada como hormiga (cabeza, tórax, abdomen, patas y antenas), que **gira hacia la dirección en que se mueve** y mueve las patas al caminar. En RECOGER y DESCANSAR, una animación de quieta.
- Hormiguero como montículo de tierra con entrada.
- Migas y comida con forma reconocible (por ejemplo, migas y una fruta), según la spec 07.

### Transiciones y efectos
- Al generar un mapa (R/T): transición breve (las casillas aparecen en ola o con fundido).
- Al poner o sacar una piedra: pequeño rebote o aparición.
- Al recoger y al entregar comida: partículas o destello breve.
- Al cambiar de estado de la FSM: un ícono o globito breve sobre la hormiga (por ejemplo, "?" al explorar, "!" al oler comida, "zzz" al descansar).
- Camino calculado dibujado como línea suave o puntos, en vez de casillas rellenas.

### HUD
- Panel con título, secciones (Búsqueda, Navegación, Hormiga, Controles) y barra de energía en lugar del número solo.

### Reglas
- Los efectos son sólo visuales: no cambian datos, tiempos de la FSM ni caminos. Pueden usar tweens de Phaser, pero el movimiento lógico de la hormiga sigue en `update` con `delta`.
- Respetan la pausa (Espacio) y la velocidad (+/-) cuando corresponda.
- El modo depuración (D) sigue siendo legible encima del nuevo arte.
- Sin assets externos con licencia dudosa; todo generado por código.

## Fuera de alcance
Sonido, menús, cambiar la vista (sigue cenital y en grilla), cambiar la lógica de la IA.

## Cómo comprobarlo
- Con R varias veces: transición visible, sin bajones de rendimiento ni restos del mapa anterior.
- La hormiga se ve como hormiga y mira hacia donde camina, también al doblar.
- Los cinco tipos de casilla se distinguen a simple vista sin leer el HUD.
- Pausa congela las animaciones ligadas a la simulación.
- Con D activado se siguen viendo claros exploradas, camino, radio de olfato y vecinas penalizadas.
- Todos los comportamientos de las specs 01 a 07 siguen funcionando igual.
