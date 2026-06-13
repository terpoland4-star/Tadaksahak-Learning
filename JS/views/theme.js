import { Store } from '../core/store.js';
import { I18n } from '../services/i18n.js';
import { fetchJSON } from '../services/api.js';

export async function render() {
  if (!Store.state.themes.length) {
    try {
      Store.state.themes = await fetchJSON('./data/themes.json');
    } catch (e) { Store.state.themes = []; }
  }
  const themes = Store.state.themes;
  const lang = Store.state.lang;
  let html = `<section id="themes"><h2>📚 Vocabulaire thématique</h2><div class="themes-grid">`;
  themes.forEach(theme => {
    const titre = theme['titre_' + lang] || theme.titre_fr;
    html += `<div class="theme-card"><h3>${titre}</h3><p>${theme['description_' + lang] || theme.description_fr}</p>
      <ul>${(theme.mots || []).slice(0,5).map(m => `<li>${m.tad} - ${m[lang] || m.fr}</li>`).join('')}</ul>
    </div>`;
  });
  html += '</div></section>';
  document.getElementById('main-content').innerHTML = html;
  I18n.translatePage();
}
