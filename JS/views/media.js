import { I18n } from '../services/i18n.js';
import { Store } from '../core/store.js';
import { escapeHtml, showToast } from '../core/utils.js';

// Galerie photo intégrée (chemins mis à jour vers assets/images/)
const imagesGalerie = [
  {
    fichier: "assets/images/chef_idoguiritane_1.jpg",
    titre_fr: "Chef Idoguiritane à Tin Abaw",
    titre_ar: "الشيخ إيدوغيريتان في تين أبا",
    titre_en: "Chief Idoguiritane in Tin Abaw",
    legende_fr: "Portrait du chef historique de la fraction Idoguiritane.",
    legende_ar: "صورة للشيخ التاريخي لفصيلة إيدوغيريتان.",
    legende_en: "Portrait of the historical chief of the Idoguiritane fraction.",
    credit: "© Charles Grémont",
    categorie: "portraits"
  },
  {
    fichier: "assets/images/chef_idoguiritane_2.jpg",
    titre_fr: "Réunion traditionnelle à Tin Abaw",
    titre_ar: "اجتماع تقليدي في تين أبا",
    titre_en: "Traditional meeting in Tin Abaw",
    legende_fr: "Le chef entouré de notables.",
    legende_ar: "الشيخ وحوله الأعيان.",
    legende_en: "The chief surrounded by notables.",
    credit: "© Charles Grémont",
    categorie: "evenements"
  },
  {
    fichier: "assets/images/chef_idoguitirane_3.jpg",
    titre_fr: "Le chef et ses conseillers",
    titre_ar: "الشيخ ومستشاروه",
    titre_en: "The chief and his advisors",
    legende_fr: "Discussion des affaires de la communauté.",
    legende_ar: "مناقشة شؤون المجتمع.",
    legende_en: "Discussing community affairs.",
    credit: "© Charles Grémont",
    categorie: "evenements"
  },
  {
    fichier: "assets/images/Un jeune combattant Adaksahak, au nord de Ménaka, mars 1994. Photo C.G.jpeg",
    titre_fr: "Jeune combattant Idaksahak (1994)",
    titre_ar: "مقاتل شاب إدكساهق (١٩٩٤)",
    titre_en: "Young Idaksahak fighter (1994)",
    legende_fr: "Rébellion des années 1990, nord de Ménaka.",
    legende_ar: "تمرد التسعينيات، شمال مناكا.",
    legende_en: "1990s rebellion, north of Ménaka.",
    credit: "© Charles Grémont",
    categorie: "portraits"
  },
  {
    fichier: "assets/images/zone des idaksahak.jpeg",
    titre_fr: "Carte de la région des Idaksahak",
    titre_ar: "خريطة منطقة الإدكساهق",
    titre_en: "Map of the Idaksahak region",
    legende_fr: "Localisation dans le nord-est du Mali.",
    legende_ar: "الموقع في شمال شرق مالي.",
    legende_en: "Location in north-eastern Mali.",
    credit: "Charles Grémont",
    categorie: "geographie"
  },
  {
    fichier: "assets/images/idaksahak_square.png",
    titre_fr: "Logo de la communauté Idaksahak",
    titre_ar: "شعار مجتمع الإدكساهق",
    titre_en: "Logo of the Idaksahak community",
    legende_fr: "Symbole officiel : lecture, épée et dromadaires.",
    legende_ar: "الشعار الرسمي: القراءة، السيف والجمال.",
    legende_en: "Official symbol: reading, sword and dromedaries.",
    credit: "Communauté Idaksahak",
    categorie: "culture"
  }
];

// Placeholder SVG inline pour les images manquantes
function imgPlaceholder(alt = 'Image') {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <rect fill="%23ddd" width="300" height="200"/>
      <text fill="%23999" font-family="sans-serif" font-size="16" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${alt}</text>
    </svg>`
  )}`;
}

export async function render() {
  const path = window.location.pathname;
  const main = document.getElementById('main-content');
  let content = '';

  switch (path) {
    case '/photos':
      content = renderPhotos();
      break;
    case '/audio':
      content = renderAudio();
      break;
    case '/videos':
      content = renderVideos();
      break;
    case '/emissions':
      content = await renderEmissions();
      break;
    default:
      content = renderPhotos();
  }

  main.innerHTML = content;
  I18n.translatePage();

  // Attacher les événements après le rendu
  if (path === '/photos') {
    attachGalleryFilters();
  }
  if (path === '/emissions') {
    attachEmissionButtons();
  }
}

function renderPhotos() {
  const lang = Store.state.lang;
  let html = `
    <section id="photos">
      <h2 data-i18n="photos_title">🖼️ Galerie Photos</h2>
      <div class="album-header">
        <h3>📷 Album : Photos historiques</h3>
        <p>Clichés de Charles Grémont</p>
      </div>
      <div class="gallery-filters">
        <button class="gallery-filter active" data-category="all">📷 Toutes</button>
        <button class="gallery-filter" data-category="portraits">👤 Portraits</button>
        <button class="gallery-filter" data-category="evenements">📅 Événements</button>
        <button class="gallery-filter" data-category="geographie">🗺️ Géographie</button>
        <button class="gallery-filter" data-category="culture">🎭 Culture</button>
      </div>
      <div class="galerie-grid" id="galerieGrid">
  `;

  imagesGalerie.forEach(img => {
    const titre = img['titre_' + lang] || img.titre_fr;
    const legende = img['legende_' + lang] || img.legende_fr;
    html += `
      <div class="galerie-item animate-on-scroll" data-category="${img.categorie}">
        <img src="${img.fichier}" alt="${escapeHtml(titre)}" loading="lazy"
             onerror="this.onerror=null; this.src='${imgPlaceholder(titre)}';">
        <div class="galerie-caption">
          <strong>${escapeHtml(titre)}</strong>
          <p class="legende">${escapeHtml(legende)}</p>
          <small class="credit">${escapeHtml(img.credit)}</small>
        </div>
      </div>
    `;
  });

  html += `</div></section>`;
  return html;
}

function attachGalleryFilters() {
  const filters = document.querySelectorAll('.gallery-filter');
  const items = document.querySelectorAll('.galerie-item');

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      const category = filter.dataset.category;
      items.forEach(item => {
        item.style.display = (category === 'all' || item.dataset.category === category) ? '' : 'none';
      });
    });
  });
}

function renderAudio() {
  return `
    <section id="audio">
      <h2 data-i18n="audio_title">🎧 Albums Audio</h2>
      <p class="info-message">🎵 Pistes audio à venir prochainement...</p>
    </section>
  `;
}

function renderVideos() {
  return `
    <section id="videos">
      <h2 data-i18n="videos_title">🎥 Vidéos</h2>
      <p class="info-message">🎥 Vidéos à venir prochainement...</p>
    </section>
  `;
}

async function renderEmissions() {
  await Store.loadEmissions();
  const emissions = Array.isArray(Store.state.emissions) ? Store.state.emissions : [];
  const lang = Store.state.lang;

  if (!emissions.length) {
    return `
      <section id="emissions">
        <h2 data-i18n="emissions_title">🎙️ Émissions radio</h2>
        <p class="info-message">🎙️ Aucune émission disponible pour le moment.</p>
      </section>
    `;
  }

  let html = `
    <section id="emissions">
      <h2 data-i18n="emissions_title">🎙️ Émissions radio</h2>
      <div class="emissions-premium-intro">
        <div class="premium-icon">🎙️</div>
        <h3>${I18n.t('emissions_title')}</h3>
        <p>Découvrez les archives radiophoniques sur la langue et la culture Idaksahak</p>
      </div>
      <div class="emissions-premium-grid">
  `;

  emissions.forEach((emission, idx) => {
    const titre = emission['titre_' + lang] || emission.titre_fr || 'Sans titre';
    const contexte = emission['contexte_' + lang] || emission.contexte_fr || '';
    const orateur = emission.orateur || 'Inconnu';
    const lieu = emission.lieu || '';
    const date = emission.date || '';

    html += `
      <div class="emission-premium-card animate-on-scroll">
        <div class="emission-card-header">
          <div class="emission-icon">🎙️</div>
          <div class="emission-info">
            <h4>${escapeHtml(titre)}</h4>
            <div class="emission-meta-premium">
              ${date ? `<span>📅 ${escapeHtml(date)}</span>` : ''}
              <span>🗣️ ${escapeHtml(orateur)}</span>
              ${lieu ? `<span>📍 ${escapeHtml(lieu)}</span>` : ''}
            </div>
          </div>
        </div>
        <p class="emission-contexte-premium">${escapeHtml(contexte.substring(0, 200))}${contexte.length > 200 ? '...' : ''}</p>
        <button class="btn-emission-premium" data-emission-idx="${idx}">
          🎧 Lire la transcription
        </button>
        <div class="emission-transcription" id="emissionTrans-${idx}" style="display:none;"></div>
      </div>
    `;
  });

  html += `</div></section>`;
  return html;
}

function attachEmissionButtons() {
  const emissions = Array.isArray(Store.state.emissions) ? Store.state.emissions : [];
  const lang = Store.state.lang;

  document.querySelectorAll('.btn-emission-premium').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.emissionIdx);
      const emission = emissions[idx];
      const transDiv = document.getElementById(`emissionTrans-${idx}`);

      if (transDiv.style.display === 'none' || !transDiv.style.display) {
        let transHtml = '';
        if (emission.versets && emission.versets.length) {
          emission.versets.forEach(verset => {
            transHtml += `
              <div class="verset">
                <div class="verset-num">${verset.numero || ''}</div>
                <div class="verset-tad"><strong>${escapeHtml(verset.tadaksahak || '')}</strong></div>
                <div class="verset-gloss">${escapeHtml(verset.glose_fr || '')}</div>
                <div class="verset-trans">${escapeHtml(verset['traduction_' + lang] || verset.traduction_fr || '')}</div>
              </div>
            `;
          });
        } else if (emission.texte) {
          transHtml = `<p style="line-height:1.8;">${escapeHtml(emission.texte).replace(/\n/g, '<br>')}</p>`;
        } else {
          transHtml = '<p>Aucune transcription disponible.</p>';
        }
        transDiv.innerHTML = transHtml;
        transDiv.style.display = 'block';
        btn.innerHTML = '📖 Masquer la transcription';
      } else {
        transDiv.style.display = 'none';
        btn.innerHTML = '🎧 Lire la transcription';
      }
    });
  });
}
