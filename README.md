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

## Cómo ejecutar desde otra PC

### Requisitos
- Node.js 18 o superior (incluye npm): https://nodejs.org/
- Git (opcional, para clonar el repositorio)
- Conexión a internet: Phaser se carga desde un CDN

### Pasos
1. Clonar el repositorio (o descargar el ZIP y descomprimirlo):
   ```bash
   git clone https://github.com/ShaarDW/PIAPC-Trabajo_Final-La_hormiguita.git
   cd PIAPC-Trabajo_Final-La_hormiguita
   ```
2. Instalar las dependencias del servidor de desarrollo:
   ```bash
   npm install
   ```
3. Iniciar el servidor:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador:
   ```
   http://localhost:8000
   ```

No hace falta compilar ni instalar Phaser: el proyecto usa JavaScript vanilla y carga Phaser desde CDN.

### Acceso desde otra PC en la misma red (opcional)
Con `npm run dev` el servidor queda disponible en la red local:
1. Obtener la IP local de la PC que ejecuta el proyecto:
   - Windows: `ipconfig` (IPv4)
   - macOS/Linux: `ifconfig` o `ip addr`
2. Desde la otra PC, abrir en el navegador:
   ```
   http://IP-DE-LA-PC:8000
   ```
3. Si no carga, permitir Node.js/serve en el firewall de la PC que ejecuta el servidor.

### Alternativa sin npm
Si se prefiere no instalar dependencias, desde la carpeta del proyecto:
```bash
python -m http.server 8000
```
Luego abrir `http://localhost:8000` (o `http://IP-DE-LA-PC:8000` desde otra PC de la misma red).

