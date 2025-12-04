// ============================================
// GAME MODULE - Lógica principal del juego
// ============================================

import { Player } from './player.js';
import { CoinManager } from './coin.js';
import { UIManager } from './ui.js';

export class Game {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.engine = engine;
    this.scene = null;
    this.camera = null;
    this.player = null;
    this.coinManager = null;
    this.uiManager = null;

    // Arrays para colisiones
    this.casas = [];
    this.objetosConColision = [];
    this.paredesCueva = [];

    // Zona de entrega
    this.zonaEntrega = null;

    // Constantes
    this.TOTAL_MONEDAS = 3;
  }

  /**
   * Inicializa el juego
   */
  async init() {
    this.scene = this.createScene();
    this.uiManager = new UIManager();
    this.coinManager = new CoinManager(this.scene, this.TOTAL_MONEDAS);

    // Crear el mundo
    this.crearMundo();

    // Crear jugador
    this.player = new Player(this.scene, this.camera);
    this.player.setupInput();
    await this.player.cargarModelo();

    // Crear monedas
    this.coinManager.crearMonedas();

    // Configurar controles
    this.setupGameControls();

    // Inicializar UI
    this.uiManager.update(0, this.TOTAL_MONEDAS, false);

    // Loop de actualización
    this.scene.onBeforeRenderObservable.add(() => {
      this.update();
    });

    return this.scene;
  }

  /**
   * Crea la escena base con cámara, luces y skybox
   */
  createScene() {
    const scene = new BABYLON.Scene(this.engine);
    scene.collisionsEnabled = true;

    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox(
      'skyBox',
      { size: 1000.0 },
      scene
    );
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      'https://playground.babylonjs.com/textures/skybox',
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Cámara
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      30,
      new BABYLON.Vector3(10, 0.3, 18),
      scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 15;
    this.camera.upperRadiusLimit = 50;

    // Luces
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 1.2;

    const directionalLight = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(-1, -2, -1),
      scene
    );
    directionalLight.intensity = 0.5;

    return scene;
  }

  /**
   * Crea el mundo: suelo, cueva, pueblo, decoraciones
   */
  crearMundo() {
    this.crearSuelo();
    this.crearCueva();
    this.crearPueblo();
    this.crearDecoraciones();
    this.cargarModelosGLTF();
  }

  /**
   * Crea el suelo principal
   */
  crearSuelo() {
    const matSuelo = new BABYLON.StandardMaterial('matSuelo', this.scene);
    const sueloTexture = new BABYLON.Texture(
      'https://raw.githubusercontent.com/BabylonJS/Assets/master/textures/ground.jpg',
      this.scene
    );
    sueloTexture.uScale = 10;
    sueloTexture.vScale = 10;
    matSuelo.diffuseTexture = sueloTexture;
    matSuelo.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const suelo = BABYLON.MeshBuilder.CreateGround(
      'suelo',
      { width: 50, height: 50, subdivisions: 10 },
      this.scene
    );
    suelo.material = matSuelo;
    suelo.receiveShadows = true;
  }

  /**
   * Crea la zona de la cueva con paredes y saco de monedas
   */
  crearCueva() {
    // Material para paredes
    const matParedCueva = new BABYLON.StandardMaterial(
      'matParedCueva',
      this.scene
    );
    matParedCueva.diffuseColor = new BABYLON.Color3(0.3, 0.25, 0.2);
    matParedCueva.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    const rocaTexture = new BABYLON.Texture(
      'https://raw.githubusercontent.com/BabylonJS/Assets/master/textures/rock.png',
      this.scene
    );
    matParedCueva.diffuseTexture = rocaTexture;
    matParedCueva.bumpTexture = rocaTexture;

    // Crear paredes
    const crearParedCueva = (posicion, rotacion, nombre) => {
      const pared = BABYLON.MeshBuilder.CreateBox(
        nombre,
        { width: 10, height: 5, depth: 1 },
        this.scene
      );
      pared.material = matParedCueva;
      pared.position = posicion;
      pared.rotation.y = rotacion;
      this.paredesCueva.push(pared);

      // Protuberancias
      for (let i = 0; i < 8; i++) {
        const roca = BABYLON.MeshBuilder.CreateSphere(
          `${nombre}_roca${i}`,
          { diameter: Math.random() * 2 + 1 },
          this.scene
        );
        roca.material = matParedCueva;
        roca.position = new BABYLON.Vector3(
          posicion.x + (Math.random() - 0.5) * 2,
          Math.random() * 4 + 0.5,
          posicion.z + (Math.random() - 0.5) * 2
        );
        roca.scaling.y = 0.6;
      }
    };

    crearParedCueva(new BABYLON.Vector3(-18, 2.5, -20), 0, 'paredCuevaA');
    crearParedCueva(
      new BABYLON.Vector3(-23, 2.5, -15),
      Math.PI / 2,
      'paredCuevaB'
    );
    crearParedCueva(
      new BABYLON.Vector3(-13, 2.5, -15),
      -Math.PI / 2,
      'paredCuevaD'
    );

    // Techo
    const techoCueva = BABYLON.MeshBuilder.CreateBox(
      'techoCueva',
      { width: 12, height: 1, depth: 12 },
      this.scene
    );
    techoCueva.material = matParedCueva;
    techoCueva.position = new BABYLON.Vector3(-18, 5.5, -15);

    // Saco de monedas
    this.crearSacoMonedas();

    // Zona de entrega (invisible)
    this.zonaEntrega = BABYLON.MeshBuilder.CreateGround(
      'zonaEntrega',
      { width: 4, height: 4 },
      this.scene
    );
    this.zonaEntrega.isVisible = false;
    this.zonaEntrega.position = new BABYLON.Vector3(-18, 0.05, -15);
  }

  /**
   * Crea el saco visual donde se entregan las monedas
   */
  crearSacoMonedas() {
    const matSaco = new BABYLON.StandardMaterial('matSaco', this.scene);
    matSaco.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);

    const matCuerdaSaco = new BABYLON.StandardMaterial(
      'matCuerdaSaco',
      this.scene
    );
    matCuerdaSaco.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.3);

    const saco = BABYLON.MeshBuilder.CreateSphere(
      'saco',
      { diameter: 1.5, segments: 16 },
      this.scene
    );
    saco.material = matSaco;
    saco.scaling.y = 1.2;
    saco.position = new BABYLON.Vector3(-18, 0.7, -15);

    const cuelloBolsa = BABYLON.MeshBuilder.CreateCylinder(
      'cuelloBolsa',
      { height: 0.3, diameter: 0.8, diameterTop: 0.5 },
      this.scene
    );
    cuelloBolsa.material = matSaco;
    cuelloBolsa.position = new BABYLON.Vector3(-18, 1.5, -15);

    const cuerda = BABYLON.MeshBuilder.CreateTorus(
      'cuerda',
      { diameter: 0.7, thickness: 0.08 },
      this.scene
    );
    cuerda.material = matCuerdaSaco;
    cuerda.position = new BABYLON.Vector3(-18, 1.5, -15);
    cuerda.rotation.x = Math.PI / 2;
  }

  /**
   * Crea el pueblo con casas
   */
  crearPueblo() {
    // Textura de hierba
    const crearTexturaHierba = (scene) => {
      const textura = new BABYLON.DynamicTexture('grass-texture', 512, scene);
      const ctx = textura.getContext();
      ctx.fillStyle = '#567d46';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const green = Math.floor(Math.random() * 50 + 80);
        ctx.fillStyle = `rgb(${green - 30}, ${green}, ${green - 50})`;
        ctx.fillRect(x, y, 1, Math.random() * 3 + 1);
      }

      textura.update();
      return textura;
    };

    const matPueblo = new BABYLON.StandardMaterial('matPueblo', this.scene);
    matPueblo.diffuseTexture = crearTexturaHierba(this.scene);

    const zonaPueblo = BABYLON.MeshBuilder.CreateGround(
      'zonaPueblo',
      { width: 12, height: 12 },
      this.scene
    );
    zonaPueblo.material = matPueblo;
    zonaPueblo.position = new BABYLON.Vector3(15, 0.02, 15);

    // Materiales para casas
    const matCasa = new BABYLON.StandardMaterial('matCasa', this.scene);
    matCasa.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.4);

    const matTecho = new BABYLON.StandardMaterial('matTecho', this.scene);
    matTecho.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.1);

    // Crear 3 casas
    for (let i = 0; i < 3; i++) {
      const casa = BABYLON.MeshBuilder.CreateBox(
        `casa${i}`,
        { width: 3, height: 3, depth: 3 },
        this.scene
      );
      casa.material = matCasa;
      casa.position = new BABYLON.Vector3(12 + i * 4, 1.5, 12 + i * 2);
      casa.checkCollisions = true;
      this.casas.push(casa);

      const techo = BABYLON.MeshBuilder.CreateCylinder(
        `techo${i}`,
        { height: 2, diameterTop: 0, diameterBottom: 4 },
        this.scene
      );
      techo.material = matTecho;
      techo.position = new BABYLON.Vector3(12 + i * 4, 4, 12 + i * 2);
      techo.checkCollisions = true;
    }
  }

  /**
   * Crea elementos decorativos procedurales
   */
  crearDecoraciones() {
    const matMadera = new BABYLON.StandardMaterial('matMadera', this.scene);
    matMadera.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.1);

    const matFuego = new BABYLON.StandardMaterial('matFuego', this.scene);
    matFuego.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
    matFuego.emissiveColor = new BABYLON.Color3(1, 0.3, 0);

    const matPiedraOscura = new BABYLON.StandardMaterial(
      'matPiedraOscura',
      this.scene
    );
    matPiedraOscura.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Antorchas
    const crearAntorcha = (pos) => {
      const palo = BABYLON.MeshBuilder.CreateCylinder(
        'paloAntorcha',
        { height: 2, diameter: 0.1 },
        this.scene
      );
      palo.material = matMadera;
      palo.position = new BABYLON.Vector3(pos.x, 1, pos.z);

      const fuego = BABYLON.MeshBuilder.CreateSphere(
        'fuego',
        { diameter: 0.3 },
        this.scene
      );
      fuego.material = matFuego;
      fuego.position = new BABYLON.Vector3(pos.x, 2.2, pos.z);
    };

    crearAntorcha(new BABYLON.Vector3(-15, 0, -12));
    crearAntorcha(new BABYLON.Vector3(-21, 0, -12));

    // Barriles
    const crearBarril = (pos) => {
      const barril = BABYLON.MeshBuilder.CreateCylinder(
        'barril',
        { height: 1.2, diameter: 0.8 },
        this.scene
      );
      barril.material = matMadera;
      barril.position = new BABYLON.Vector3(pos.x, 0.6, pos.z);
    };

    crearBarril(new BABYLON.Vector3(11, 0, 11));
    crearBarril(new BABYLON.Vector3(11.5, 0, 12));

    // Columnas
    const crearColumna = (pos) => {
      const columna = BABYLON.MeshBuilder.CreateCylinder(
        'columna',
        { height: 4, diameterTop: 0.5, diameterBottom: 0.6 },
        this.scene
      );
      columna.material = matPiedraOscura;
      columna.position = new BABYLON.Vector3(pos.x, 2, pos.z);

      const capitel = BABYLON.MeshBuilder.CreateBox(
        'capitel',
        { width: 0.8, height: 0.3, depth: 0.8 },
        this.scene
      );
      capitel.material = matPiedraOscura;
      capitel.position = new BABYLON.Vector3(pos.x, 4.2, pos.z);
    };

    crearColumna(new BABYLON.Vector3(-5, 0, -5));
    crearColumna(new BABYLON.Vector3(5, 0, -5));

    // Cercas
    const crearCerca = (pos) => {
      for (let i = 0; i < 3; i++) {
        const poste = BABYLON.MeshBuilder.CreateCylinder(
          'poste',
          { height: 1.5, diameter: 0.1 },
          this.scene
        );
        poste.material = matMadera;
        poste.position = new BABYLON.Vector3(pos.x + i * 0.5, 0.75, pos.z);
      }

      const barra = BABYLON.MeshBuilder.CreateBox(
        'barra',
        { width: 1.5, height: 0.1, depth: 0.1 },
        this.scene
      );
      barra.material = matMadera;
      barra.position = new BABYLON.Vector3(pos.x + 0.5, 0.8, pos.z);
    };

    crearCerca(new BABYLON.Vector3(10, 0, 8));
    crearCerca(new BABYLON.Vector3(10, 0, 10));

    // Fogata con animación
    const fogataBase = BABYLON.MeshBuilder.CreateCylinder(
      'fogataBase',
      { height: 0.2, diameter: 1 },
      this.scene
    );
    fogataBase.material = matPiedraOscura;
    fogataBase.position = new BABYLON.Vector3(14, 0.1, 12);

    const llama = BABYLON.MeshBuilder.CreateSphere(
      'llama',
      { diameter: 0.6 },
      this.scene
    );
    llama.material = matFuego;
    llama.position = new BABYLON.Vector3(14, 0.5, 12);

    this.scene.registerBeforeRender(() => {
      llama.scaling.y = 1 + Math.sin(Date.now() * 0.005) * 0.2;
    });
  }

  /**
   * Carga todos los modelos GLTF decorativos
   */
  cargarModelosGLTF() {
    const cargarModelo = (
      nombre,
      posicion,
      escala = 1,
      rotacion = 0,
      radioColision = 1.5
    ) => {
      BABYLON.SceneLoader.ImportMesh(
        '',
        './src/assets/models/',
        nombre,
        this.scene,
        (meshes) => {
          if (meshes && meshes[0]) {
            const modelo = meshes[0];
            modelo.position = posicion;
            modelo.scaling = new BABYLON.Vector3(escala, escala, escala);
            modelo.rotation.y = rotacion;
            this.objetosConColision.push({
              mesh: modelo,
              radio: radioColision * escala,
            });
          }
        },
        null,
        (scene, message) => {
          console.warn(`No se pudo cargar ${nombre}: ${message}`);
        }
      );
    };

    // Árboles
    cargarModelo('Tree_1.gltf', new BABYLON.Vector3(-10, 0, 5), 0.8, 0, 1.2);
    cargarModelo(
      'Tree_1.gltf',
      new BABYLON.Vector3(-8, 0, -10),
      0.9,
      Math.PI / 4,
      1.2
    );
    cargarModelo(
      'Tree_1.gltf',
      new BABYLON.Vector3(8, 0, -8),
      0.7,
      Math.PI / 3,
      1.2
    );
    cargarModelo(
      'Tree_1.gltf',
      new BABYLON.Vector3(20, 0, 5),
      0.85,
      -Math.PI / 6,
      1.2
    );
    cargarModelo(
      'Tree_1.gltf',
      new BABYLON.Vector3(5, 0, 20),
      0.75,
      Math.PI / 2,
      1.2
    );
    cargarModelo(
      'Tree_1.gltf',
      new BABYLON.Vector3(-15, 0, 10),
      0.8,
      -Math.PI / 4,
      1.2
    );
    cargarModelo(
      'Tree_1.gltf',
      new BABYLON.Vector3(18, 0, -15),
      0.9,
      Math.PI,
      1.2
    );
    cargarModelo(
      'Tree_1.gltf',
      new BABYLON.Vector3(-5, 0, 18),
      0.7,
      Math.PI / 5,
      1.2
    );

    // Carros
    cargarModelo(
      'Debris_BrokenCar.gltf',
      new BABYLON.Vector3(-12, 0, -5),
      0.5,
      Math.PI / 6,
      2.0
    );
    cargarModelo(
      'Debris_BrokenCar.gltf',
      new BABYLON.Vector3(10, 0, -12),
      0.5,
      -Math.PI / 3,
      2.0
    );
    cargarModelo(
      'Debris_BrokenCar.gltf',
      new BABYLON.Vector3(15, 0, 8),
      0.5,
      Math.PI / 2,
      2.0
    );
    cargarModelo(
      'Debris_BrokenCar.gltf',
      new BABYLON.Vector3(-8, 0, 15),
      0.5,
      -Math.PI / 4,
      2.0
    );

    // Cercas metálicas
    cargarModelo(
      'MetalFence.gltf',
      new BABYLON.Vector3(-6, 0, -15),
      0.6,
      0,
      1.0
    );
    cargarModelo(
      'MetalFence.gltf',
      new BABYLON.Vector3(12, 0, -18),
      0.6,
      Math.PI / 2,
      1.0
    );
    cargarModelo(
      'MetalFence.gltf',
      new BABYLON.Vector3(22, 0, 0),
      0.6,
      -Math.PI / 4,
      1.0
    );
    cargarModelo(
      'MetalFence.gltf',
      new BABYLON.Vector3(-10, 0, 20),
      0.6,
      Math.PI / 3,
      1.0
    );
    cargarModelo(
      'MetalFence.gltf',
      new BABYLON.Vector3(0, 0, -20),
      0.6,
      Math.PI,
      1.0
    );

    // Barriles
    cargarModelo(
      'ExplodingBarrel.gltf',
      new BABYLON.Vector3(-16, 0, -8),
      0.5,
      0,
      0.7
    );
    cargarModelo(
      'ExplodingBarrel.gltf',
      new BABYLON.Vector3(7, 0, -20),
      0.5,
      Math.PI / 4,
      0.7
    );
    cargarModelo(
      'ExplodingBarrel.gltf',
      new BABYLON.Vector3(22, 0, 10),
      0.5,
      -Math.PI / 6,
      0.7
    );
    cargarModelo(
      'ExplodingBarrel.gltf',
      new BABYLON.Vector3(-2, 0, 19),
      0.5,
      Math.PI / 3,
      0.7
    );

    cargarModelo(
      'ExplodingBarrel_Spilled.gltf',
      new BABYLON.Vector3(-18, 0, 3),
      0.5,
      Math.PI / 5,
      0.7
    );
    cargarModelo(
      'ExplodingBarrel_Spilled.gltf',
      new BABYLON.Vector3(3, 0, -18),
      0.5,
      -Math.PI / 4,
      0.7
    );
    cargarModelo(
      'ExplodingBarrel_Spilled.gltf',
      new BABYLON.Vector3(16, 0, -6),
      0.5,
      Math.PI / 2,
      0.7
    );

    // Tanques
    cargarModelo(
      'Tank.gltf',
      new BABYLON.Vector3(-20, 0, 8),
      0.6,
      Math.PI / 4,
      3.0
    );
    cargarModelo(
      'Tank.gltf',
      new BABYLON.Vector3(10, 0, -20),
      0.6,
      -Math.PI / 3,
      3.0
    );
    cargarModelo(
      'Tank.gltf',
      new BABYLON.Vector3(20, 0, 18),
      0.6,
      Math.PI / 6,
      3.0
    );
  }

  /**
   * Configura los controles del juego (barra espaciadora)
   */
  setupGameControls() {
    this.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key === ' ') {
          if (!this.player.isReady()) return;

          const dragonPos = this.player.getPosition();
          const dragon = this.player.getDragon();

          // Recoger moneda
          if (!this.coinManager.getMonedaEnMano()) {
            const moneda = this.coinManager.intentarRecoger(dragonPos);
            if (moneda) {
              this.coinManager.recogerMoneda(moneda, dragon);
              this.uiManager.update(
                this.coinManager.getMonedasEntregadas(),
                this.TOTAL_MONEDAS,
                this.coinManager.getMonedaEnMano()
              );
            }
          }
          // Entregar moneda
          else {
            const entregada = this.coinManager.intentarEntregar(
              dragonPos,
              this.zonaEntrega.position
            );
            if (entregada) {
              this.uiManager.update(
                this.coinManager.getMonedasEntregadas(),
                this.TOTAL_MONEDAS,
                this.coinManager.getMonedaEnMano()
              );

              if (this.coinManager.haGanado()) {
                this.uiManager.showVictory();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Verifica colisiones con todos los objetos del mundo
   */
  verificarColision(nuevaPosicion) {
    const radioColision = this.player.getRadioColision();

    // Casas
    for (let casa of this.casas) {
      const distancia = BABYLON.Vector3.Distance(
        new BABYLON.Vector3(nuevaPosicion.x, 0, nuevaPosicion.z),
        new BABYLON.Vector3(casa.position.x, 0, casa.position.z)
      );
      if (distancia < 2.5) return true;
    }

    // Objetos decorativos
    for (let objeto of this.objetosConColision) {
      if (objeto.mesh && objeto.mesh.position) {
        const distancia = BABYLON.Vector3.Distance(
          new BABYLON.Vector3(nuevaPosicion.x, 0, nuevaPosicion.z),
          new BABYLON.Vector3(objeto.mesh.position.x, 0, objeto.mesh.position.z)
        );
        if (distancia < objeto.radio + radioColision) return true;
      }
    }

    // Paredes de cueva
    for (let pared of this.paredesCueva) {
      if (pared && pared.position) {
        const distancia = BABYLON.Vector3.Distance(
          new BABYLON.Vector3(nuevaPosicion.x, 0, nuevaPosicion.z),
          new BABYLON.Vector3(pared.position.x, 0, pared.position.z)
        );
        if (distancia < 6) return true;
      }
    }

    return false;
  }

  /**
   * Actualización principal del juego
   */
  update() {
    this.player.update((pos) => this.verificarColision(pos));
  }

  /**
   * Inicia el loop de renderizado
   */
  start() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
}
