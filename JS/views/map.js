import { I18n } from '../services/i18n.js';

export async function render() {
  document.getElementById('main-content').innerHTML = `<section id="map"><h2>🗺️ Carte</h2><div id="mapContainer" style="height:400px;"></div></section>`;
  I18n.translatePage();
  // Chargement dynamique de Leaflet si nécessaire
  if (!window.L) {
    await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  const map = L.map('mapContainer').setView([16.0, 0.0], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
  // Ajout de marqueurs...
}
