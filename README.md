# PIAPC-Trabajo_Final-La_hormiguita

Hormiga recolectora - TP Final Integrador PIAPC

## Descripción
Simulación 2D con IA para una hormiga que explora, busca comida con olfato, la recoge, vuelve al hormiguero y entrega. Implementado con Phaser 4.2.1 desde CDN, JavaScript vanilla, proceso spec-driven.

## Tecnologías
- JavaScript + Phaser 4.2.1 (CDN)
- HTML/CSS
- Sin assets externos

## Características
- **Grilla 24x16** con terrenos: tierra, pasto alto, barro, zona expuesta, piedra
- **Búsqueda**: BFS, Dijkstra, A* con depuración
- **Navegación**: directa/segura
- **FSM autónoma**: EXPLORAR/IR_A_LA_COMIDA/RECOGER/VOLVER_AL_HORMIGUERO/DESCANSAR con olfato, memoria por referencias, energía
- **Exploración**: marca radio 4 al pisar, busca puntos a distancia Manhattan 5-10 al azar
- **Generación procedural**: mapas válidos con validación por flood fill
- **Edición en vivo**: poner/sacar piedras, agregar comida
- **Comida visible**: porciones dibujadas, miga encima al llevar, pila junto al hormiguero
- **Visual**: hormiga animada girando y moviendo patas, HUD con paneles y barra de energía

## Controles
- `1/2/3` - Algoritmo BFS/Dijkstra/A*
- `N` - Navegación directa/segura
- `M` - Modo autónomo/manual
- `D` - Depuración
- `Espacio` - Pausa
- `+/-` - Velocidad
- `R` - Generar nuevo mapa
- `T` - Mapa de prueba
- `Shift+Click izq` - Dar destino (manual)
- `Click izq` - Poner/sacar piedra
- `Click der` - Agregar comida

## Desarrollo
- `npm run dev` (servidor en `http://localhost:8000`)
- Abrir `http://localhost:8000`

