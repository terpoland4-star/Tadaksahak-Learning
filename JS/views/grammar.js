import { I18n } from '../services/i18n.js';
import { eventBus } from '../core/event-bus.js';
import { Store } from '../core/store.js';
import { fetchJSON } from '../services/api.js';

let grammarBlocks = [];
let currentBlockIndex = 0;
let currentLang = localStorage.getItem('preferredLanguage') || 'fr';

export async function render() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section id="grammaire">
      <h2 data-i18n="grammar_title">📚 Grammaire Tadaksahak</h2>
      <div class="grammar-tabs">
        <button class="grammar-tab active" data-tab="causative">📖 Verbes causatifs/passifs</button>
        <button class="grammar-tab" data-tab="relatives">📖 Propositions relatives</button>
      </div>
      <div class="lang-selector-book">
        <button class="lang-btn active" data-lang="fr">🇫🇷 Français</button>
        <button class="lang-btn" data-lang="en">🇬🇧 English</button>
        <button class="lang-btn" data-lang="ar">🇸🇦 العربية</button>
      </div>
      <div class="book-spread" id="bookSpread">
        <div class="book-page page-left" id="pageLeft">...</div>
        <div class="book-page page-right" id="pageRight">...</div>
      </div>
      <div class="book-controls">
        <button class="nav-btn" id="prevBtn">←</button>
        <span class="page-indicator" id="pageIndicator">Bloc 1 / 30</span>
        <button class="nav-btn" id="nextBtn">→</button>
      </div>
      <div id="relativesContainer" class="relatives-container" hidden></div>
    </section>
  `;
  I18n.translatePage();

  // Charger les données du livre
  if (!grammarBlocks.length) {
    try {
      grammarBlocks = await fetchJSON('./data/grammaire.json');
    } catch (e) {
      console.error('Erreur grammaire.json', e);
      document.getElementById('bookSpread').innerHTML = '<p>Erreur chargement.</p>';
      return;
    }
  }

  // Initialiser le livre
  currentBlockIndex = 0;
  updateSpread();
  attachBookEvents();
  attachTabEvents();

  // Synchronisation langue
  currentLang = Store.state.lang;
  updateSpread();

  eventBus.on('language-changed', ({ lang }) => {
    currentLang = lang;
    updateSpread();
  });
}

function updateSpread() {
  const leftBlock = grammarBlocks[currentBlockIndex] || null;
  const rightBlock = (currentBlockIndex + 1 < grammarBlocks.length) ? grammarBlocks[currentBlockIndex + 1] : null;
  renderBookPage('left', leftBlock);
  renderBookPage('right', rightBlock);
  const total = grammarBlocks.length;
  const start = currentBlockIndex + 1;
  const end = Math.min(currentBlockIndex + 2, total);
  document.getElementById('pageIndicator').textContent = `Blocs ${start}–${end} / ${total}`;
  document.getElementById('prevBtn').disabled = (currentBlockIndex === 0);
  document.getElementById('nextBtn').disabled = (currentBlockIndex + 2 >= total);
}

function renderBookPage(side, block) {
  const elements = side === 'left' ? {
    title: document.getElementById('leftTitle'),
    content: document.getElementById('leftContent'),
    range: document.getElementById('leftRange'),
    keywords: document.getElementById('leftKeywords'),
    pageNum: document.getElementById('leftPageNum')
  } : {
    title: document.getElementById('rightTitle'),
    content: document.getElementById('rightContent'),
    range: document.getElementById('rightRange'),
    keywords: document.getElementById('rightKeywords'),
    pageNum: document.getElementById('rightPageNum')
  };
  if (!block) {
    elements.title.textContent = '';
    elements.content.innerHTML = '<p style="opacity:0.5;">— Fin du livre —</p>';
    elements.range.textContent = '';
    elements.keywords.innerHTML = '';
    elements.pageNum.textContent = '';
    return;
  }
  const title = block.titre_section[currentLang] || block.titre_section.fr || '';
  const content = block.contenu[currentLang] || block.contenu.fr || '';
  elements.title.textContent = title;
  elements.content.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
  elements.range.textContent = `📄 p. ${block.plage_pages || ''}`;
  elements.keywords.innerHTML = (block.mots_cles || []).map(k => `<span class="keyword-tag">${k}</span>`).join('');
  elements.pageNum.textContent = `Bloc ${block.bloc_id}`;
}

function attachBookEvents() {
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentBlockIndex > 0) {
      currentBlockIndex = Math.max(0, currentBlockIndex - 2);
      updateSpread();
    }
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentBlockIndex + 2 < grammarBlocks.length) {
      currentBlockIndex += 2;
      updateSpread();
    }
  });
  // Changement langue interne
  document.querySelectorAll('#grammaire .lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem('preferredLanguage', currentLang);
      updateSpread();
    });
  });
}

function attachTabEvents() {
  const tabs = document.querySelectorAll('.grammar-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (target === 'causative') {
        document.getElementById('bookSpread').style.display = '';
        document.getElementById('relativesContainer').hidden = true;
        updateSpread();
      } else {
        document.getElementById('bookSpread').style.display = 'none';
        document.getElementById('relativesContainer').hidden = false;
        loadAndShowRelatives();
      }
    });
  });
}

async function loadAndShowRelatives() {
  const container = document.getElementById('relativesContainer');
  if (!Store.state.relatives) {
    try {
      Store.state.relatives = await fetchJSON('./data/relatives.json');
    } catch (e) {
      container.innerHTML = '<p>Données relatives non disponibles.</p>';
      return;
    }
  }
  const data = Store.state.relatives;
  let html = '<h3>Stratégies de relativisation</h3>';
  data.strategies.forEach(strat => {
    const usage = currentLang === 'fr' ? strat.usage_fr : (currentLang === 'en' ? strat.usage_en : strat.usage_ar);
    html += `<div class="strategy-card">
      <strong>${strat.marqueur_sg || strat.marqueur || '∅'}</strong> - ${usage}
      <div class="examples">`;
    (strat.exemples || []).slice(0,2).forEach(ex => {
      const trad = currentLang === 'fr' ? ex.traduction_fr : (currentLang === 'en' ? ex.traduction_en : ex.traduction_ar);
      html += `<p><em>${ex.tadaksahak}</em> → ${trad}</p>`;
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
}
