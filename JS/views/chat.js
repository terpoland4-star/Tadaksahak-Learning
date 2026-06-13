import { I18n } from '../services/i18n.js';
import { escapeHtml } from '../core/utils.js';

export async function render() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section id="chat">
      <h2 data-i18n="chat_title">💬 Chat Bot Hamadine</h2>
      <div id="chatWindow" class="chatbox"></div>
      <div class="chat-input">
        <input id="chatInput" type="text" placeholder="Votre message...">
        <button id="btnEnvoyer">${I18n.t('send')}</button>
      </div>
      <div class="chat-suggestions">
        <button class="chat-suggestion" data-i18n="sugg_word">📖 Mot</button>
        <button class="chat-suggestion" data-i18n="sugg_history">📚 Histoire</button>
        <button class="chat-suggestion" data-i18n="sugg_culture">🎵 Culture</button>
      </div>
    </section>
  `;
  I18n.translatePage();
  document.getElementById('btnEnvoyer').addEventListener('click', sendMessage);
  document.getElementById('chatInput').addEventListener('keypress', e => e.key === 'Enter' && sendMessage());
  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chatInput').value = btn.textContent;
      sendMessage();
    });
  });
  afficheMsg('bot', I18n.t('bot_greeting'));
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  afficheMsg('user', escapeHtml(msg));
  input.value = '';
  // Logique du bot (similaire à l'ancien reponseBot)
  setTimeout(() => {
    const reponse = generateResponse(msg);
    afficheMsg('bot', reponse);
  }, 400);
}

function generateResponse(msg) { /* ... */ }
function afficheMsg(who, html) { /* ... */ }
