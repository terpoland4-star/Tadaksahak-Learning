import { Store } from '../core/store.js';
import { I18n } from '../services/i18n.js';
import { escapeHtml } from '../core/utils.js';

export async function render() {
  const main = document.getElementById('main-content');
  const isRapports = window.location.pathname === '/rapports';
  const books = Store.state.books;
  const langueCible = Store.state.lang === 'fr' ? 'Français' : (Store.state.lang === 'ar' ? 'Arabe' : 'English');
  const filtered = books.filter(b => (isRapports ? b.type === 'rapport' : b.type !== 'rapport') && b.langue === langueCible);
  let html = `<section><h2>${isRapports ? '📄 Rapports' : '📚 Livres'}</h2><div class="books-grid">`;
  filtered.forEach(book => {
    html += `
      <div class="book-card">
        <h3>${escapeHtml(book.titre)}</h3>
        <p>${escapeHtml(book.auteur)}</p>
        <a href="livre-viewer.html?id=${book.id}" target="_blank">Lire</a>
      </div>`;
  });
  html += '</div></section>';
  main.innerHTML = html;
  I18n.translatePage();
}
