import { Store } from '../core/store.js';
import { fetchJSON } from '../services/api.js';
import { I18n } from '../services/i18n.js';

export async function render() {
  if (!Store.state.timeline.length) {
    try {
      Store.state.timeline = await fetchJSON('./data/timeline.json');
    } catch (e) {
      Store.state.timeline = [];
    }
  }
  const events = Store.state.timeline.filter(e => e.lang === Store.state.lang);
  let html = '<section id="timeline"><h2>📅 Ligne du temps</h2><div class="timeline">';
  events.forEach(ev => {
    html += `<div class="timeline-item"><div class="date">${ev.date}</div><div class="content"><h4>${ev.title}</h4><p>${ev.description}</p></div></div>`;
  });
  html += '</div></section>';
  document.getElementById('main-content').innerHTML = html;
  I18n.translatePage();
}
