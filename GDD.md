# GDD — Hormiga recolectora

**Materia:** Programación de IA y Patrones de Comportamiento (PIAPC) — TP final integrador
**Integrante:** Juan Thiago [apellido] (individual)
**Tecnología:** JavaScript + Phaser 4, ejecutable en el navegador
**Repositorio:** [URL del repositorio público]

---

## 1. Idea

Un prototipo 2D visto desde arriba, en un mapa de grilla que representa un patio o jardín. Una hormiga (NPC) sale del hormiguero, busca comida usando el olfato, la lleva de vuelta y repite. El terreno tiene obstáculos y zonas con distinto costo de paso, y algunas zonas están expuestas a pájaros, que son peligrosas para la hormiga.

No es un juego competitivo: es una simulación interactiva donde el jugador cumple el rol de **observador/experimentador**. Puede generar otros terrenos, cambiar el algoritmo de búsqueda y la forma de navegar, y modificar el mapa en vivo para ver cómo responde la hormiga.

## 2. Escenario

- Grilla de aproximadamente 24 × 16 casillas, con gráficos simples (formas y colores).
- **Tipos de casilla:**

| Casilla | Transitable | Costo de paso | Notas |
|---|---|---|---|
| Tierra | Sí | 1 | Terreno normal |
| Pasto alto | Sí | 3 | Más lento de atravesar |
| Barro | Sí | 5 | Muy lento |
| Zona expuesta (a pájaros) | Sí | 1 | Barata pero peligrosa; la ruta segura la evita |
| Piedra / rama | No | — | Obstáculo |

- **Hormiguero:** casilla base de donde sale la hormiga y adonde entrega la comida.
- **Fuentes de comida:** entre 4 y 7 por mapa (migas, una fruta caída, etc.). Cada una tiene varias porciones; la hormiga lleva una porción por viaje y la fuente desaparece al agotarse.

## 3. Interacción y controles

| Tecla / acción | Efecto |
|---|---|
| `1` / `2` / `3` | Algoritmo de búsqueda: BFS / Dijkstra / A* |
| `N` | Alternar navegación: ruta directa ↔ ruta segura |
| `R` | Generar otro escenario |
| `T` | Cargar mapa de prueba fijo |
| Clic izquierdo | Poner / sacar una piedra (para bloquear caminos en vivo) |
| Clic derecho | Dejar una fuente de comida nueva |
| `D` | Mostrar / ocultar depuración: casillas exploradas por el algoritmo, camino calculado, radio de olfato y estado actual de la hormiga |
| `Espacio` | Pausa |
| `+` / `-` | Velocidad de la simulación |

En pantalla se muestra siempre: algoritmo activo, modo de navegación, estado de la FSM y comida entregada.

## 4. NPC: la hormiga

### Percepción
- **Mapa:** conoce la disposición del terreno (obstáculos, costos y zonas expuestas), como si lo recordara de recorridos anteriores.
- **Olfato:** detecta comida sólo dentro de un radio (por ejemplo, 4 casillas). Fuera de ese radio no sabe que existe.
- **Carga y energía:** sabe si lleva comida y cuánta energía le queda. La energía baja con cada paso.
- **Bloqueos:** si en el camino aparece un obstáculo nuevo (puesto por el jugador), lo detecta al llegar a la casilla anterior.

### Memoria
- Recuerda las fuentes de comida que olió y que todavía no se agotaron, aunque ya no estén en su radio.
- Recuerda qué fuentes resultaron inaccesibles (sin camino) para no insistir hasta que el mapa cambie.

### Objetivos
1. Encontrar comida.
2. Llevarla al hormiguero.
3. No quedarse sin energía: si baja de un umbral, vuelve al hormiguero a recuperarse.

### Comportamiento (FSM)

```
           ┌──────────────┐  huele comida /    ┌───────────────┐
  inicio → │  EXPLORAR    │ ─ recuerda alguna ─→│ IR A LA COMIDA │
           └──────────────┘                    └───────────────┘
                 ↑                                     │ llega
                 │ sin comida conocida                 ↓
           ┌──────────────┐                    ┌───────────────┐
           │  DESCANSAR   │ ←── llega ──────── │   RECOGER     │
           │  (entregar)  │                    └───────────────┘
           └──────────────┘                            │
                 ↑                                     ↓
                 └────────── llega ─────── VOLVER AL HORMIGUERO
```

- **Explorar:** elige un punto transitable que todavía no visitó (preferentemente lejos de lo ya explorado), calcula la ruta y va hacia él. Al llegar elige otro.
- **Ir a la comida:** si conoce varias fuentes, elige la que tenga mejor relación porciones / costo del camino.
- **Recoger:** toma una porción (breve pausa).
- **Volver al hormiguero:** calcula la ruta de regreso con el algoritmo y la navegación activos.
- **Descansar / entregar:** deja la comida, recupera energía y vuelve a Explorar o a Ir a la comida según lo que recuerde.
- **Transición global:** desde cualquier estado, si la energía baja del umbral y no lleva comida → Volver al hormiguero.

## 5. Búsqueda (algoritmos)

Se implementan tres algoritmos seleccionables en vivo:

- **BFS:** encuentra el camino con menos casillas, pero ignora los costos del terreno. En este mapa puede meter a la hormiga en el barro porque "es más corto".
- **Dijkstra:** encuentra el camino de menor costo total considerando el terreno. Explora en todas las direcciones.
- **A\*:** también encuentra el camino de menor costo, pero usa una heurística (distancia Manhattan) para explorar menos casillas que Dijkstra. Con el modo depuración se ve la diferencia en la cantidad de casillas exploradas.

Las diferencias esperadas: BFS y Dijkstra/A* van a coincidir cuando el terreno sea uniforme y van a diferir cuando haya pasto o barro en el camino. Dijkstra y A* deberían dar caminos de igual costo, pero A* explora menos.

## 6. Navegación (alternativas)

Lo que cambia no es cómo se calcula el camino, sino **qué camino se considera bueno** y cómo lo recorre la hormiga.

1. **Ruta directa:** usa los costos normales del terreno. Atraviesa zonas expuestas sin problema porque son baratas.
2. **Ruta segura:** las zonas expuestas a pájaros (y las casillas vecinas a ellas) reciben una penalización alta de costo. La hormiga prefiere rodear aunque tarde más; sólo las cruza si no existe otra opción.
   - Con **Dijkstra y A\*** la penalización funciona directamente como costo (la heurística de A* sigue siendo válida porque todos los costos son ≥ 1).
   - **BFS** no admite costos, así que en ruta segura se trata la zona expuesta como bloqueada; si eso deja sin camino, BFS la vuelve a permitir y se muestra un aviso.

**Ante obstáculos y bloqueos:** si el jugador pone una piedra en la ruta, la hormiga lo detecta y recalcula desde su posición. Si el destino quedó sin camino, lo marca como inaccesible y pasa a otro objetivo; si no hay ninguno alcanzable, se queda en una casilla válida esperando y lo vuelve a intentar cuando el mapa cambia.

> Extra opcional si sobra tiempo: una tercera alternativa de movimiento, "seguir rastro de feromonas", donde la hormiga deja marcas en los viajes exitosos y en los siguientes las prefiere.

## 7. Escenarios variables

Cada vez que se presiona `R` se genera un mapa nuevo:

- **Qué varía:** posición y cantidad de piedras/ramas (agrupadas en manchas, no sueltas), manchas de pasto alto y barro, zonas expuestas, ubicación del hormiguero y de las fuentes de comida.
- **Reglas para que sea válido y jugable:**
  - El borde del mapa siempre es obstáculo.
  - El hormiguero tiene libre el área de 3 × 3 a su alrededor.
  - Ninguna comida ni la hormiga quedan sobre un obstáculo.
  - Después de generar, se hace una búsqueda desde el hormiguero (flood fill con BFS) y se verifica que cada fuente de comida sea alcanzable. Las inalcanzables se reubican; si no se logra, se genera otro mapa (con un límite de intentos).
  - Debe haber al menos una fuente fuera del radio de olfato inicial, para que la hormiga tenga que explorar.
- **Adaptación de las rutas:** los puntos de exploración se eligen sobre el mapa generado y todas las rutas (exploración, ida a la comida, regreso) se calculan en cada momento con el algoritmo activo. No hay trayectorias fijas.
- **Casos sin camino:** se pueden probar a mano encerrando una comida o el hormiguero con piedras (clic izquierdo).

## 8. Alcance y límites

**Incluido:** una hormiga, mapa en grilla con generación procedural, tres algoritmos de búsqueda, dos alternativas de navegación, FSM con energía y memoria, edición del mapa en vivo y modo de depuración.

**Fuera de alcance:** varias hormigas o coordinación entre ellas, pájaros u otros enemigos que se muevan, combate, animaciones elaboradas, sonido, menús, guardado de escenarios, semillas, comparaciones formales o métricas.

**Recortes posibles si falta tiempo** (en este orden): la penalización a las casillas vecinas de las zonas expuestas, la energía (dejar sólo carga), el clic derecho para poner comida, y BFS (quedarían Dijkstra y A*, que alcanzan el mínimo).

## 9. Desarrollo

- Proceso spec-driven: GDD → specs breves en `specs/` → implementación de a una spec con OpenCode, revisando el plan antes de cada cambio y probando jugando.
- Orden tentativo de specs: grilla y dibujo del mapa → búsqueda (BFS, Dijkstra, A*) con depuración → movimiento de la hormiga por la ruta → generación procedural y validación → navegación directa/segura y replanificación → FSM con olfato, memoria y energía.
- Ejecución prevista: abrir la versión publicada (GitHub Pages) o correrla localmente siguiendo el README.
