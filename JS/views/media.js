import { I18n } from '../services/i18n.js';

export async function render() {
  const path = window.location.pathname;
  let content = '';
  if (path === '/photos') {
    content = await renderPhotos();
  } else if (path === '/audio') {
    content = '<p>Albums audio à venir...</p>';
  } else if (path === '/videos') {
    content = '<p>Vidéos à venir...</p>';
  } else if (path === '/emissions') {
    content = await renderEmissions();
  }
  document.getElementById('main-content').innerHTML = content;
  I18n.translatePage();
}

async function renderPhotos() { /* utilise les imagesGalerie */ }
async function renderEmissions() { /* charge emission.json et affiche */ }
