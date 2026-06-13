import { I18n } from '../services/i18n.js';
import { Store } from '../core/store.js';
import { navigate } from '../services/router.js';

export async function render() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section id="accueil">
      <div class="hero">
        <h2 data-i18n="welcome_title">Bienvenue</h2>
        <p data-i18n="welcome_subtitle">Une plateforme dédiée à la langue et à la culture Tadaksahak.</p>
        <button id="btnGoDico" class="btn btn-primary" data-i18n="go_dico">📖 Accéder au dictionnaire</button>
      </div>
      <!-- Statistiques, bio, mot du jour... -->
    </section>
  `;
  I18n.translatePage();
  document.getElementById('btnGoDico').addEventListener('click', () => navigate('/dictionnaire'));
  // Mot du jour
  const wordOfDay = getWordOfDay();
  if (wordOfDay) {
    document.getElementById('wordOfDayContainer').innerHTML = `🌟 Mot du jour : <strong>${wordOfDay.mot}</strong> — ${wordOfDay.fr}`;
  }
}

function getWordOfDay() {
  const dict = Store.state.dictionary;
  if (!dict.length) return null;
  const today = new Date().toISOString().slice(0,10);
  let stored = JSON.parse(localStorage.getItem('word_of_day') || '{}');
  if (stored.date === today) return dict.find(w => w.mot === stored.word) || dict[0];
  const random = dict[Math.floor(Math.random() * dict.length)];
  localStorage.setItem('word_of_day', JSON.stringify({ date: today, word: random.mot }));
  return random;
}
