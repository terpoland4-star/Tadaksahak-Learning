import { escapeHtml } from '../core/utils.js';

/**
 * Crée un élément DOM pour afficher une fiche de mot.
 * @param {Object} word - objet mot du dictionnaire
 * @param {Function} t - fonction de traduction i18n
 * @param {boolean} isFavorite - si le mot est dans les favoris
 * @param {Function} onShare - callback partage
 * @param {Function} onToggleFavorite - callback pour ajouter/supprimer favori
 * @returns {DocumentFragment}
 */
export function createWordCard(word, t, isFavorite, onShare, onToggleFavorite) {
  const template = document.getElementById('word-card-template');
  if (!template) {
    // Fallback si le template n'existe pas
    const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${escapeHtml(word.mot)}</h3>
      <p>${escapeHtml(word.fr)}</p>
      <button class="share-btn">${t('share')}</button>
      <button class="fav-btn">${isFavorite ? t('remove_favorite') : t('add_favorite')}</button>
    `;
    div.querySelector('.share-btn').addEventListener('click', onShare);
    div.querySelector('.fav-btn').addEventListener('click', onToggleFavorite);
    frag.appendChild(div);
    return frag;
  }
  const clone = template.content.cloneNode(true);
  clone.querySelector('.mot').textContent = word.mot;
  clone.querySelector('.definition').textContent = word.fr || word.en || '';
  const shareBtn = clone.querySelector('.share-btn');
  const favBtn = clone.querySelector('.fav-btn');
  favBtn.textContent = isFavorite ? t('remove_favorite') : t('add_favorite');
  shareBtn.addEventListener('click', onShare);
  favBtn.addEventListener('click', onToggleFavorite);
  return clone;
}
