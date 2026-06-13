import { Store } from '../core/store.js';
import { eventBus } from '../core/event-bus.js';
import { I18n } from '../services/i18n.js';
import { escapeHtml, normalizeText, levenshtein, showToast } from '../core/utils.js';
import { createWordCard } from '../components/word-card.js';

let state = {
  words: [],
  filtered: [],
  currentIndex: 0,
  searchQuery: ''
};

export async function render() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section id="dictionnaire">
      <h2 data-i18n="dictionary_title">📖 Dictionnaire Tadaksahak</h2>
      <div class="share-section" id="dictionaryShareSection" hidden>
        <button class="share-btn unified" id="shareWordBtn">🔗 Partager</button>
      </div>
      <div class="search-section">
        <div class="search-wrapper">
          <input id="searchBar" type="search" placeholder="Rechercher un mot..." autocomplete="off">
          <button id="clearSearch" class="clear-search" hidden>✖</button>
        </div>
        <ul id="suggestions" class="suggestions-list" role="listbox"></ul>
      </div>
      <div id="ficheMot"></div>
      <div class="navigation-mots">
        <button id="btnPrev" class="nav-btn" disabled data-i18n="prev">⬅️ Précédent</button>
        <span id="compteurMot" class="compteur">0 / 0</span>
        <button id="btnNext" class="nav-btn" disabled data-i18n="next">Suivant ➡️</button>
      </div>
      <div class="alphabet-section">
        <h3 data-i18n="alphabet_index">Index alphabétique</h3>
        <div id="alphabetIndex" class="alphabet-buttons"></div>
        <div id="wordList" class="word-list"></div>
      </div>
    </section>
  `;
  I18n.translatePage();

  state.words = Store.state.dictionary;
  state.filtered = [...state.words];
  state.currentIndex = 0;

  // Écouteurs
  document.getElementById('searchBar').addEventListener('input', onSearch);
  document.getElementById('clearSearch').addEventListener('click', clearSearch);
  document.getElementById('btnPrev').addEventListener('click', () => navigate(-1));
  document.getElementById('btnNext').addEventListener('click', () => navigate(1));
  document.getElementById('shareWordBtn').addEventListener('click', shareCurrentWord);
  buildAlphabetIndex();

  // Réafficher si la langue change
  eventBus.on('language-changed', () => {
    if (Store.state.dictionary.length) {
      state.words = Store.state.dictionary;
      state.filtered = [...state.words];
      state.currentIndex = 0;
      buildAlphabetIndex();
      showWord(0);
      document.getElementById('searchBar').value = '';
    }
  });

  // Afficher premier mot
  if (state.filtered.length) showWord(0);
  else document.getElementById('ficheMot').innerHTML = '<p>Aucun mot disponible.</p>';
}

function onSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  document.getElementById('clearSearch').hidden = !query;
  if (!query) {
    state.filtered = [...state.words];
  } else {
    state.filtered = search(query);
  }
  state.currentIndex = 0;
  showWord(0);
}

function search(query) {
  const norm = normalizeText(query);
  const maxDist = Math.max(2, Math.floor(norm.length * 0.4));
  const results = [];
  for (const item of state.words) {
    let score = Infinity;
    const motNorm = normalizeText(item.mot);
    if (motNorm.includes(norm)) score = motNorm.startsWith(norm) ? 0 : 1;
    else if (item.fr && normalizeText(item.fr).includes(norm)) score = 2;
    else if (item.en && normalizeText(item.en).includes(norm)) score = 3;
    else if (item.ar && normalizeText(item.ar).includes(norm)) score = 4;
    else if (levenshtein(motNorm, norm) <= maxDist) score = 5 + levenshtein(motNorm, norm);
    if (score < Infinity) results.push({ item, score });
  }
  return results.sort((a,b) => a.score - b.score).slice(0,15).map(r => r.item);
}

function showWord(index) {
  if (!state.filtered.length) {
    document.getElementById('ficheMot').innerHTML = '<p>Aucun mot trouvé.</p>';
    return;
  }
  const word = state.filtered[index];
  const isFav = Store.state.user.favorites.includes(word.mot);
  const fiche = document.getElementById('ficheMot');
  fiche.innerHTML = '';
  fiche.appendChild(createWordCard(word, I18n.t, isFav,
    () => shareWord(word),
    () => toggleFavorite(word)
  ));
  document.getElementById('compteurMot').textContent = `${index+1} / ${state.filtered.length}`;
  document.getElementById('btnPrev').disabled = index <= 0;
  document.getElementById('btnNext').disabled = index >= state.filtered.length-1;
  document.getElementById('dictionaryShareSection').hidden = false;
  state.currentIndex = index;
  // Historique
  Store.state.user.history = [word.mot, ...Store.state.user.history.filter(m => m !== word.mot)].slice(0,20);
}

function navigate(delta) {
  const newIndex = state.currentIndex + delta;
  if (newIndex >= 0 && newIndex < state.filtered.length) {
    showWord(newIndex);
  }
}

function shareWord(word) {
  const text = `${word.mot} : ${word.fr || word.en || ''}`;
  if (navigator.share) {
    navigator.share({ title: 'Mot Tadaksahak', text, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
    showToast('📋 Copié dans le presse-papier', 'success');
  }
}

function toggleFavorite(word) {
  const favs = Store.state.user.favorites;
  if (favs.includes(word.mot)) {
    Store.state.user.favorites = favs.filter(m => m !== word.mot);
  } else {
    Store.state.user.favorites = [...favs, word.mot];
  }
  showWord(state.currentIndex); // Rafraîchit l'affichage
}

function buildAlphabetIndex() {
  const container = document.getElementById('alphabetIndex');
  if (!container) return;
  const letters = [...new Set(state.words.map(w => w.mot?.[0]?.toUpperCase()).filter(Boolean))].sort();
  container.innerHTML = '';
  letters.forEach(l => {
    const btn = document.createElement('button');
    btn.textContent = l;
    btn.className = 'alphabet-btn';
    btn.addEventListener('click', () => {
      state.filtered = state.words.filter(w => w.mot?.toUpperCase().startsWith(l));
      state.currentIndex = 0;
      showWord(0);
    });
    container.appendChild(btn);
  });
}

function clearSearch() {
  document.getElementById('searchBar').value = '';
  document.getElementById('clearSearch').hidden = true;
  state.filtered = [...state.words];
  state.currentIndex = 0;
  showWord(0);
}
