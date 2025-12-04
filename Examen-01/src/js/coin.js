// ============================================
// COIN MODULE - Gestión de monedas
// ============================================

/**
 * Crea la textura procedural para las monedas
 */
export function crearTexturaMoneda(scene) {
  const textura = new BABYLON.DynamicTexture('coin-texture', 256, scene);
  const ctx = textura.getContext();

  // Gradiente dorado
  const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  gradient.addColorStop(0, '#FFD700');
  gradient.addColorStop(0.5, '#FFA500');
  gradient.addColorStop(1, '#FF8C00');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  // Detalles de la moneda
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(128, 128, 100, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(128, 128, 80, 0, Math.PI * 2);
  ctx.stroke();

  textura.update();
  return textura;
}

export class CoinManager {
  constructor(scene, totalMonedas) {
    this.scene = scene;
    this.totalMonedas = totalMonedas;
    this.monedas = [];
    this.monedaEnMano = false;
    this.monedasEntregadas = 0;
    this.monedaActual = null;

    // Posiciones donde aparecen las monedas
    this.posicionesMonedas = [
      new BABYLON.Vector3(15, 0.3, 18),
      new BABYLON.Vector3(12, 0.3, 18),
      new BABYLON.Vector3(10, 0.3, 18),
    ];
  }

  /**
   * Crea todas las monedas en el escenario
   */
  crearMonedas() {
    const matMoneda = new BABYLON.StandardMaterial('matMoneda', this.scene);
    matMoneda.diffuseTexture = crearTexturaMoneda(this.scene);
    matMoneda.specularColor = new BABYLON.Color3(1, 0.8, 0);
    matMoneda.emissiveColor = new BABYLON.Color3(0.2, 0.15, 0);

    for (let i = 0; i < this.totalMonedas; i++) {
      const moneda = BABYLON.MeshBuilder.CreateCylinder(
        `moneda${i}`,
        {
          height: 0.2,
          diameter: 0.8,
        },
        this.scene
      );
      moneda.material = matMoneda;
      moneda.position = this.posicionesMonedas[i].clone();
      moneda.metadata = { recogida: false, enCueva: false };
      this.monedas.push(moneda);

      // Animación de rotación y levitación
      this.scene.registerBeforeRender(() => {
        if (!moneda.metadata.recogida) {
          moneda.rotation.y += 0.02;
          moneda.position.y =
            this.posicionesMonedas[i].y +
            Math.sin(Date.now() * 0.003 + i) * 0.1;
        }
      });
    }
  }

  /**
   * Intenta recoger una moneda cercana al dragón
   */
  intentarRecoger(dragonPosition) {
    if (this.monedaEnMano) return false;

    for (let moneda of this.monedas) {
      if (!moneda.metadata.recogida && !moneda.metadata.enCueva) {
        let dist = BABYLON.Vector3.Distance(dragonPosition, moneda.position);
        if (dist < 3) {
          console.log('💰 ¡Moneda recogida!');
          return moneda;
        }
      }
    }
    return null;
  }

  /**
   * Recoge una moneda y la asocia al dragón
   */
  recogerMoneda(moneda, dragon) {
    moneda.parent = dragon;
    moneda.position = new BABYLON.Vector3(0, 2, 0);
    moneda.metadata.recogida = true;
    this.monedaEnMano = true;
    this.monedaActual = moneda;
  }

  /**
   * Intenta entregar la moneda en la cueva
   */
  intentarEntregar(dragonPosition, zonaEntregaPosition) {
    if (!this.monedaEnMano) return false;

    let dist = BABYLON.Vector3.Distance(dragonPosition, zonaEntregaPosition);
    if (dist < 5) {
      console.log('🏆 ¡Moneda entregada en la cueva!');
      this.monedaActual.parent = null;
      this.monedaActual.position = new BABYLON.Vector3(
        zonaEntregaPosition.x + (Math.random() - 0.5) * 4,
        0.3,
        zonaEntregaPosition.z + (Math.random() - 0.5) * 4
      );
      this.monedaActual.metadata.enCueva = true;
      this.monedaEnMano = false;
      this.monedasEntregadas++;
      this.monedaActual = null;
      return true;
    }
    return false;
  }

  /**
   * Verifica si se han entregado todas las monedas
   */
  haGanado() {
    return this.monedasEntregadas === this.totalMonedas;
  }

  // Getters
  getMonedaEnMano() {
    return this.monedaEnMano;
  }

  getMonedasEntregadas() {
    return this.monedasEntregadas;
  }
}
