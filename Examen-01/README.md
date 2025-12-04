# 🐉 Dragon's Gold Heist - Estructura Modular

## 📁 Estructura del Proyecto

```
dragon-gold-heist/
├── index.html              # Punto de entrada principal
├── src/
│   ├── css/
│   │   └── styles.css      # Estilos del juego
│   ├── js/
│   │   ├── game.js         # Lógica principal del juego y creación del mundo
│   │   ├── player.js       # Control del dragón jugador
│   │   ├── coin.js         # Sistema de monedas
│   │   └── ui.js           # Gestión de la interfaz de usuario
│   └── assets/
│       └── models/         # Modelos GLTF 3D
```

## 📦 Módulos

### `game.js` - Módulo Principal

**Responsabilidades:**

- Inicialización del motor Babylon.js y la escena
- Creación del mundo (skybox, terreno, iluminación)
- Generación de la cueva y el pueblo
- Carga de modelos GLTF decorativos
- Sistema de colisiones
- Coordinación entre todos los módulos

**Exporta:** `class Game`

**Métodos principales:**

- `init()` - Inicializa el juego de forma asíncrona
- `start()` - Inicia el loop de renderizado
- `crearMundo()` - Construye todo el escenario
- `verificarColision(posicion)` - Verifica colisiones con objetos

---

### `player.js` - Control del Jugador

**Responsabilidades:**

- Carga del modelo GLTF del dragón
- Sistema de input (teclado WASD)
- Movimiento y rotación del jugador
- Control de la cámara que sigue al dragón

**Exporta:** `class Player`

**Métodos principales:**

- `cargarModelo()` - Carga el modelo 3D del dragón
- `setupInput()` - Configura los controles de teclado
- `update(verificarColision)` - Actualiza la posición cada frame
- `getPosition()` - Obtiene la posición actual del dragón

---

### `coin.js` - Sistema de Monedas

**Responsabilidades:**

- Creación de texturas procedurales para monedas
- Gestión del estado de las monedas (recogidas/en cueva)
- Lógica de recoger y entregar monedas
- Animaciones de levitación y rotación

**Exporta:**

- `function crearTexturaMoneda(scene)`
- `class CoinManager`

**Métodos principales:**

- `crearMonedas()` - Genera todas las monedas en el mundo
- `intentarRecoger(dragonPosition)` - Intenta recoger una moneda
- `recogerMoneda(moneda, dragon)` - Asocia la moneda al dragón
- `intentarEntregar(dragonPos, zonaPos)` - Entrega moneda en la cueva
- `haGanado()` - Verifica si se completó el objetivo

---

### `ui.js` - Interfaz de Usuario

**Responsabilidades:**

- Actualización del contador de monedas
- Gestión del indicador de estado
- Control de la pantalla de victoria

**Exporta:** `class UIManager`

**Métodos principales:**

- `update(monedasEntregadas, totalMonedas, monedaEnMano)` - Actualiza la UI
- `showVictory()` - Muestra pantalla de victoria
- `hideVictory()` - Oculta pantalla de victoria

---

## 🎮 Flujo del Juego

1. **Inicialización** (`index.html`):

   - Crea el motor Babylon.js
   - Instancia la clase `Game`
   - Llama a `game.init()`

2. **Setup** (`game.js`):

   - Crea la escena y el mundo
   - Instancia `Player`, `CoinManager` y `UIManager`
   - Carga el modelo del dragón
   - Genera las monedas
   - Configura controles

3. **Game Loop** (cada frame):

   - `Player.update()` - Mueve al dragón según input
   - `Game.verificarColision()` - Previene atravesar objetos
   - Animaciones de monedas y fuego
   - Renderiza la escena

4. **Interacción** (barra espaciadora):

   - `CoinManager.intentarRecoger()` - Recoge moneda cercana
   - `CoinManager.intentarEntregar()` - Entrega en cueva
   - `UIManager.update()` - Actualiza contador y estado

5. **Victoria**:
   - `CoinManager.haGanado()` - Verifica 3/3 monedas
   - `UIManager.showVictory()` - Muestra pantalla final

---

## 🔧 Tecnologías

- **Babylon.js 5+** - Motor 3D
- **ES6 Modules** - Sistema de módulos nativo
- **GLTF 2.0** - Formato de modelos 3D
- **Canvas API** - Texturas procedurales

---

## 🚀 Cómo Ejecutar

1. Abrir `index.html` en un servidor local (requerido por ES6 modules)
2. Usar extensión Live Server de VS Code, o
3. Ejecutar: `python -m http.server 8000` y abrir `http://localhost:8000`

---

## 🎯 Objetivo del Juego

Controla al dragón (WASD) para recoger 3 monedas de oro y llevarlas a la cueva.

- **Espacio** para recoger/soltar monedas
- Evita colisiones con árboles, casas, tanques y otros obstáculos
- Entrega las 3 monedas en la cueva para ganar

---

## 💡 Beneficios de la Arquitectura Modular

✅ **Escalabilidad**: Fácil agregar nuevas features en módulos separados  
✅ **Mantenibilidad**: Código organizado y fácil de encontrar  
✅ **Reutilización**: Clases y funciones reutilizables  
✅ **Testing**: Cada módulo se puede probar independientemente  
✅ **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo  
✅ **Legibilidad**: Código más limpio y comprensible
