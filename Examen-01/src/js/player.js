// ============================================
// PLAYER MODULE - Control del dragón jugador
// ============================================

export class Player {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.dragon = null;
    this.dragonMesh = null;
    this.velocidad = 0.15;
    this.radioColision = 1;
    this.inputMap = {};
    this.isLoaded = false;
  }

  /**
   * Carga el modelo GLTF del dragón
   */
  cargarModelo() {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh(
        '',
        './src/assets/models/',
        'Dragon.gltf',
        this.scene,
        (meshes) => {
          this.dragonMesh = meshes[0];
          this.dragon = new BABYLON.TransformNode('dragonController');
          this.dragonMesh.parent = this.dragon;

          this.dragonMesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
          this.dragonMesh.position = new BABYLON.Vector3(0, 0, 0);
          this.dragonMesh.rotation.y = 0;

          this.dragon.position = new BABYLON.Vector3(10, 0.3, 18);
          this.isLoaded = true;

          console.log('🐉 Modelo de dragón cargado exitosamente');
          resolve(this.dragon);
        },
        null,
        (scene, message) => {
          console.error('Error cargando dragón:', message);
          reject(message);
        }
      );
    });
  }

  /**
   * Configura el sistema de input (teclado)
   */
  setupInput() {
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);

    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        (evt) => {
          this.inputMap[evt.sourceEvent.key.toLowerCase()] = true;
        }
      )
    );

    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyUpTrigger,
        (evt) => {
          this.inputMap[evt.sourceEvent.key.toLowerCase()] = false;
        }
      )
    );
  }

  /**
   * Actualiza el movimiento del dragón basado en el input
   */
  update(verificarColision) {
    if (!this.isLoaded || !this.dragon) return;

    let moved = false;
    let targetRotation = this.dragon.rotation.y;

    if (this.inputMap['w']) {
      const nuevaPosicion = this.dragon.position.clone();
      nuevaPosicion.z += this.velocidad;
      if (!verificarColision(nuevaPosicion)) {
        this.dragon.position.z += this.velocidad;
      }
      targetRotation = Math.PI;
      moved = true;
    }
    if (this.inputMap['s']) {
      const nuevaPosicion = this.dragon.position.clone();
      nuevaPosicion.z -= this.velocidad;
      if (!verificarColision(nuevaPosicion)) {
        this.dragon.position.z -= this.velocidad;
      }
      targetRotation = 0;
      moved = true;
    }
    if (this.inputMap['a']) {
      const nuevaPosicion = this.dragon.position.clone();
      nuevaPosicion.x -= this.velocidad;
      if (!verificarColision(nuevaPosicion)) {
        this.dragon.position.x -= this.velocidad;
      }
      targetRotation = Math.PI / 2;
      moved = true;
    }
    if (this.inputMap['d']) {
      const nuevaPosicion = this.dragon.position.clone();
      nuevaPosicion.x += this.velocidad;
      if (!verificarColision(nuevaPosicion)) {
        this.dragon.position.x += this.velocidad;
      }
      targetRotation = -Math.PI / 2;
      moved = true;
    }

    // Rotación suave
    if (moved) {
      let diff = targetRotation - this.dragon.rotation.y;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      this.dragon.rotation.y += diff * 0.1;
    }

    // Cámara sigue al dragón
    this.camera.target = this.dragon.position;
  }

  /**
   * Obtiene la posición actual del dragón
   */
  getPosition() {
    return this.dragon ? this.dragon.position : null;
  }

  /**
   * Obtiene el objeto dragón
   */
  getDragon() {
    return this.dragon;
  }

  /**
   * Verifica si el dragón está cargado
   */
  isReady() {
    return this.isLoaded;
  }

  /**
   * Obtiene el radio de colisión del dragón
   */
  getRadioColision() {
    return this.radioColision;
  }
}
