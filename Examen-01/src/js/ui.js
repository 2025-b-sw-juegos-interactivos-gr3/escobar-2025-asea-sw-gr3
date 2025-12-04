// ============================================
// UI MODULE - Manejo de la interfaz de usuario
// ============================================

export class UIManager {
  constructor() {
    this.coinsDeliveredElement = document.getElementById('coins-delivered');
    this.totalCoinsElement = document.getElementById('total-coins');
    this.statusLight = document.getElementById('status-light');
    this.statusText = document.getElementById('status-text');
    this.victoryScreen = document.getElementById('victory-screen');
  }

  /**
   * Actualiza el contador de monedas y el estado del jugador
   */
  update(monedasEntregadas, totalMonedas, monedaEnMano) {
    this.coinsDeliveredElement.textContent = monedasEntregadas;
    this.totalCoinsElement.textContent = totalMonedas;

    if (monedaEnMano) {
      this.statusLight.className = 'status-indicator status-carrying';
      this.statusText.textContent = 'Llevando moneda 🪙';
    } else {
      this.statusLight.className = 'status-indicator status-empty';
      this.statusText.textContent = 'Sin moneda';
    }
  }

  /**
   * Muestra la pantalla de victoria
   */
  showVictory() {
    this.victoryScreen.style.display = 'block';
  }

  /**
   * Oculta la pantalla de victoria
   */
  hideVictory() {
    this.victoryScreen.style.display = 'none';
  }
}
