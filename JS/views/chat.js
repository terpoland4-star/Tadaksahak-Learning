import { I18n } from '../services/i18n.js';
import { Store } from '../core/store.js';
import { eventBus } from '../core/event-bus.js';
import { escapeHtml, showToast } from '../core/utils.js';
import { deepseekAPI } from '../services/deepseek-api.js';
import { ConversationManager } from '../services/conversation-manager.js';

// Instance du gestionnaire de conversation
const conversation = new ConversationManager();

// Patterns locaux pour réponses rapides
const localPatterns = [
  // Salutations
  { pattern: /bonjour|salut|salam|hello|cc|coucou|hi\b/i, 
    response: () => getRandomResponse([
      '👋 Salam aleikum ! Comment puis-je t\'aider aujourd\'hui ?',
      'Bonjour ! 🌟 Je suis là pour t\'aider avec le tadaksahak.',
      'Salam ! Que souhaites-tu apprendre ?'
    ])},
  
  // Remerciements
  { pattern: /merci|thanks|thank you|شكرا|choukrane/i,
    response: () => getRandomResponse([
      '🙏 De rien ! La connaissance se partage.',
      'Avec plaisir ! N\'hésite pas si tu as d\'autres questions.',
      'Je suis là pour ça ! Que puis-je faire d\'autre pour toi ?'
    ])},
  
  // Au revoir
  { pattern: /au revoir|bye|salut|à plus|adieu|bslama|بسلامة/i,
    response: () => getRandomResponse([
      'Au revoir ! Reviens quand tu veux apprendre ! 👋',
      'À bientôt ! Que la sagesse t\'accompagne 🌟',
      'Bslamah ! N\'oublie pas de pratiquer le tadaksahak !'
    ])},
  
  // Aide
  { pattern: /aide|help|مساعدة|que.*faire|what.*do/i,
    response: () => `🤖 **Ce que je peux faire pour toi :**

📖 **Dictionnaire** : Chercher des mots et leurs définitions
📚 **Grammaire** : Expliquer les verbes causatifs, passifs et les propositions relatives
📖 **Contes** : Raconter des histoires traditionnelles
🎙️ **Culture** : Parler de l'histoire et des traditions Idaksahak
💡 **Questions linguistiques** : Analyser des mots ou expressions

Pose-moi n'importe quelle question !`},
  
  // Qui es-tu ?
  { pattern: /qui.*tu|qui.*vous|présente|introduce/i,
    response: () => `Je suis **Hamadine**, ton guide pour la langue et la culture Tadaksahak ! 🎓

Je suis un assistant IA entraîné pour :
- Comprendre et expliquer le tadaksahak
- T'aider à apprendre cette langue
- Partager la riche culture Idaksahak
- Répondre à tes questions linguistiques et culturelles

J'utilise une combinaison d'intelligence locale et de connexion à DeepSeek pour te fournir les meilleures réponses !`},
];

/**
 * Obtient une réponse aléatoire parmi plusieurs options
 */
function getRandomResponse(options) {
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Recherche dans la base de connaissances locale
 */
function searchLocalKnowledge(query) {
  const results = {
    dictionaryWords: [],
    grammarInfo: [],
    relativeInfo: null,
    booksInfo: []
  };

  // Recherche dans le dictionnaire
  if (Store.state.dictionary.length) {
    const words = Store.state.dictionary.filter(w => 
      query.toLowerCase().includes(w.mot.toLowerCase()) ||
      (w.fr && query.toLowerCase().includes(w.fr.toLowerCase())) ||
      (w.en && query.toLowerCase().includes(w.en.toLowerCase()))
    );
    results.dictionaryWords = words.slice(0, 5);
  }

  // Recherche dans les livres de connaissance
  if (Store.state.livresConnaissance?.livres) {
    for (const livre of Store.state.livresConnaissance.livres) {
      for (const chunk of livre.chunks) {
        if (chunk.texte?.toLowerCase().includes(query.toLowerCase()) ||
            chunk.mots_cles?.some(k => query.toLowerCase().includes(k.toLowerCase()))) {
          results.booksInfo.push({
            titre: livre.titre,
            auteur: livre.auteur,
            texte: chunk.texte.substring(0, 500)
          });
        }
      }
    }
  }

  return results;
}

/**
 * Classe l'intention de l'utilisateur
 */
function classifyIntent(query) {
  const lower = query.toLowerCase();
  
  if (lower.match(/défini|signifie|tradui|comment.*dire|what.*mean|translate|معنى|ترجم/)) {
    return 'definition';
  }
  if (lower.match(/grammaire|grammar|verbe|verb|causatif|causative|passi|relative|proposition|قواعد|فعل/)) {
    return 'grammar';
  }
  if (lower.match(/conte|histoire|légende|story|tale|حكاية|قصة/)) {
    return 'story';
  }
  if (lower.match(/culture|tradition|custom|histoire|history|تاريخ|ثقافة/)) {
    return 'culture';
  }
  if (lower.match(/apprendre|learn|étudier|study|تعلم|درس/)) {
    return 'learning';
  }
  
  return 'general';
}

/**
 * Vérifie si la question nécessite DeepSeek
 */
function needsDeepSeek(query, localResults) {
  // Questions complexes nécessitant une compréhension approfondie
  if (query.length > 100) return true;
  if (query.match(/explique|analyse|compare|différence|pourquoi|comment.*fonctionne|explain|analyze|compare|difference|why|how.*works|اشرح|حلل|قارن|لماذا|كيف.*يعمل/)) return true;
  if (query.match(/contexte|origine|étymologie|histoire.*mot|context|origin|etymology/)) return true;
  if (query.match(/peux-tu|pourrais-tu|est-ce que|can you|could you|هل يمكنك/)) return true;
  
  // Si on n'a pas trouvé assez d'infos locales
  if (!localResults.dictionaryWords.length && !localResults.booksInfo.length) return true;
  
  return false;
}

/**
 * Formate la réponse locale
 */
function formatLocalResponse(query, localResults) {
  let response = '';
  
  if (localResults.dictionaryWords.length) {
    response += '📖 **Mots trouvés dans le dictionnaire :**\n\n';
    for (const word of localResults.dictionaryWords) {
      response += `🔹 **${word.mot}** (${word.cat || ''})\n`;
      if (word.fr) response += `   🇫🇷 ${word.fr}\n`;
      if (word.en) response += `   🇬🇧 ${word.en}\n`;
      if (word.ar) response += `   🇸🇦 ${word.ar}\n`;
      response += '\n';
    }
  }
  
  if (localResults.booksInfo.length) {
    response += '📚 **Informations trouvées dans la bibliothèque :**\n\n';
    for (const book of localResults.booksInfo) {
      response += `📖 *${book.titre}* (${book.auteur})\n`;
      response += `"${book.texte.substring(0, 300)}..."\n\n`;
    }
  }
  
  if (!response) {
    response = '🤔 Je n\'ai pas trouvé d\'information locale précise. Laisse-moi consulter DeepSeek pour une réponse plus complète...';
  }
  
  return response;
}

/**
 * Envoie un message et traite la réponse
 */
async function processMessage(userMessage) {
  const query = userMessage.trim();
  if (!query) return;

  // Afficher le message utilisateur
  appendMessage('user', escapeHtml(query));
  
  // Mettre à jour le gestionnaire de conversation
  conversation.addMessage('user', query);
  conversation.analyzeMessage(query);
  
  // Afficher l'indicateur de saisie
  showTypingIndicator();

  try {
    let response = '';
    
    // Étape 1 : Vérifier les patterns locaux (réponses rapides)
    let matchedPattern = false;
    for (const pattern of localPatterns) {
      if (pattern.pattern.test(query)) {
        response = typeof pattern.response === 'function' ? pattern.response() : pattern.response;
        matchedPattern = true;
        break;
      }
    }
    
    if (!matchedPattern) {
      // Étape 2 : Recherche dans la base locale
      const localResults = searchLocalKnowledge(query);
      
      // Étape 3 : Décider si on utilise DeepSeek
      if (needsDeepSeek(query, localResults) && deepseekAPI.isAvailable()) {
        // Mode DeepSeek
        const systemPrompt = conversation.generateSystemPrompt();
        const history = conversation.getHistoryForAPI(systemPrompt);
        
        // Ajouter les résultats locaux comme contexte
        if (localResults.dictionaryWords.length || localResults.booksInfo.length) {
          history.push({
            role: 'system',
            content: `Informations locales trouvées :\n${JSON.stringify(localResults, null, 2)}`
          });
        }
        
        history.push({ role: 'user', content: query });
        
        // Utiliser le streaming pour une réponse progressive
        response = '';
        removeTypingIndicator();
        const messageDiv = appendMessage('bot', '', true);
        
        await deepseekAPI.chatStream(history, (chunk) => {
          response += chunk;
          messageDiv.innerHTML = formatMarkdown(response);
          scrollToBottom();
        });
        
      } else if (localResults.dictionaryWords.length || localResults.booksInfo.length) {
        // Mode local avec résultats
        response = formatLocalResponse(query, localResults);
      } else {
        // Mode local sans résultats
        response = `🤔 Je n'ai pas trouvé de réponse précise à ta question sur le tadaksahak.

**Suggestions :**
- Essaie de chercher un mot spécifique dans le 📖 **Dictionnaire**
- Consulte la 📚 **Grammaire** pour les règles linguistiques
- Demande-moi un exemple concret de mot ou d'expression

Si tu souhaites des réponses plus approfondies, tu peux configurer une clé API DeepSeek dans les paramètres.`;
      }
    }
    
    // Supprimer l'indicateur de saisie
    removeTypingIndicator();
    
    // Afficher la réponse
    if (!document.querySelector('.message.bot.streaming')) {
      appendMessage('bot', formatMarkdown(response));
    }
    
    // Sauvegarder dans l'historique
    conversation.addMessage('assistant', response);
    
  } catch (error) {
    removeTypingIndicator();
    console.error('Erreur chatbot:', error);
    
    let errorMessage = '❌ **Erreur de communication**\n\n';
    if (error.message.includes('Clé API')) {
      errorMessage += 'La clé API DeepSeek n\'est pas configurée. Pour activer les réponses intelligentes :\n\n';
      errorMessage += '1. Obtiens une clé API sur [platform.deepseek.com](https://platform.deepseek.com)\n';
      errorMessage += '2. Utilise la commande `/apikey TA_CLE_API` pour la configurer';
    } else {
      errorMessage += 'Je rencontre des difficultés techniques. Réessaie dans un moment.\n\n';
      errorMessage += `_Erreur : ${escapeHtml(error.message)}_`;
    }
    
    appendMessage('bot', errorMessage);
    conversation.addMessage('assistant', errorMessage);
  }
}

/**
 * Formate le texte avec un markdown simple
 */
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br>');
}

/**
 * Ajoute un message dans la fenêtre de chat
 */
function appendMessage(role, content, isStreaming = false) {
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return null;
  
  const div = document.createElement('div');
  div.className = `message ${role}${isStreaming ? ' streaming' : ''}`;
  
  const avatar = role === 'user' ? '👤' : '🤖';
  const name = role === 'user' ? 'Vous' : 'Hamadine';
  
  div.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-header">${name}</div>
      <div class="message-body">${content}</div>
    </div>
  `;
  
  chatWindow.appendChild(div);
  scrollToBottom();
  
  return div.querySelector('.message-body');
}

/**
 * Affiche l'indicateur de saisie
 */
function showTypingIndicator() {
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return;
  
  const indicator = document.createElement('div');
  indicator.className = 'message bot typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="message-header">Hamadine</div>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatWindow.appendChild(indicator);
  scrollToBottom();
}

/**
 * Supprime l'indicateur de saisie
 */
function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

/**
 * Défile vers le bas du chat
 */
function scrollToBottom() {
  const chatWindow = document.getElementById('chatWindow');
  if (chatWindow) {
    setTimeout(() => {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 50);
  }
}

/**
 * Traite les commandes spéciales
 */
function handleCommand(command) {
  const parts = command.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  
  switch (cmd) {
    case '/apikey':
      if (args) {
        deepseekAPI.setApiKey(args);
        return '✅ **Clé API configurée avec succès !**\n\nJe peux maintenant utiliser DeepSeek pour des réponses plus intelligentes.';
      }
      return 'ℹ️ Utilisation : `/apikey TA_CLE_API`\n\nObtiens ta clé sur [platform.deepseek.com](https://platform.deepseek.com)';
    
    case '/clear':
    case '/reset':
      conversation.reset();
      document.getElementById('chatWindow').innerHTML = '';
      return '🔄 **Conversation réinitialisée.**';
    
    case '/help':
      return `📋 **Commandes disponibles :**
- \`/apikey [clé]\` - Configurer la clé API DeepSeek
- \`/clear\` - Réinitialiser la conversation
- \`/help\` - Afficher cette aide`;
    
    default:
      return null;
  }
}

/**
 * Fonction principale de rendu de la vue chat
 */
export async function render() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section id="chat">
      <h2 data-i18n="chat_title">💬 Chat Bot Hamadine</h2>
      
      <div class="chat-status">
        <span class="status-indicator ${deepseekAPI.isAvailable() ? 'online' : 'local'}"></span>
        <span class="status-text">
          ${deepseekAPI.isAvailable() ? '🧠 Mode DeepSeek actif' : '📚 Mode local (sans IA)'}
        </span>
        ${!deepseekAPI.isAvailable() ? `
          <button id="configureAPIKey" class="btn-small" title="Configurer DeepSeek">
            ⚙️ Configurer DeepSeek
          </button>
        ` : ''}
      </div>
      
      <div id="chatWindow" class="chatbox" aria-live="polite" aria-label="Conversation"></div>
      
      <div class="chat-input">
        <input id="chatInput" type="text" 
               placeholder="${I18n.t('send') || 'Écrivez votre message...'}" 
               aria-label="Votre message"
               maxlength="2000">
        <button id="btnEnvoyer" class="btn-send">
          ${I18n.t('send') || 'Envoyer 📤'}
        </button>
      </div>
      
      <div class="chat-suggestions">
        <button class="chat-suggestion" data-query="Donne-moi un mot tadaksahak avec sa définition">
          📖 Mot aléatoire
        </button>
        <button class="chat-suggestion" data-query="Explique-moi les verbes causatifs en tadaksahak">
          📚 Grammaire
        </button>
        <button class="chat-suggestion" data-query="Raconte-moi quelque chose sur la culture Idaksahak">
          🎵 Culture
        </button>
        <button class="chat-suggestion" data-query="Comment dit-on 'merci' en tadaksahak ?">
          💬 Expression
        </button>
      </div>
    </section>
  `;
  
  I18n.translatePage();
  
  // Message de bienvenue
  const welcomeMsg = deepseekAPI.isAvailable() 
    ? `👋 **Salam aleikum !**\n\nJe suis Hamadine, ton guide pour la langue et la culture Tadaksahak.\n\nJe suis connecté à DeepSeek pour des réponses intelligentes. Que souhaites-tu apprendre aujourd'hui ?`
    : `👋 **Salam aleikum !**\n\nJe suis Hamadine, ton guide pour la langue et la culture Tadaksahak.\n\n💡 **Astuce :** Configure une clé API DeepSeek avec la commande \`/apikey\` pour débloquer des réponses plus intelligentes !\n\nEn attendant, je peux t'aider avec le dictionnaire et la base de connaissances locale.`;
  
  appendMessage('bot', formatMarkdown(welcomeMsg));
  conversation.addMessage('assistant', welcomeMsg);
  
  // Événements
  document.getElementById('btnEnvoyer').addEventListener('click', sendMessage);
  document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Suggestions de chat
  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query;
      document.getElementById('chatInput').value = query;
      sendMessage();
    });
  });
  
  // Bouton de configuration API
  document.getElementById('configureAPIKey')?.addEventListener('click', showAPIConfigDialog);
  
  // Focus sur l'input
  setTimeout(() => document.getElementById('chatInput')?.focus(), 500);
  
  function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    // Vérifier si c'est une commande
    if (message.startsWith('/')) {
      const cmdResponse = handleCommand(message);
      if (cmdResponse) {
        appendMessage('user', escapeHtml(message));
        appendMessage('bot', formatMarkdown(cmdResponse));
        input.value = '';
        return;
      }
    }
    
    input.value = '';
    input.disabled = true;
    
    processMessage(message).finally(() => {
      input.disabled = false;
      input.focus();
    });
  }
}

/**
 * Affiche la boîte de dialogue de configuration API
 */
function showAPIConfigDialog() {
  const key = prompt(
    '🔑 Configuration DeepSeek\n\n' +
    '1. Va sur platform.deepseek.com\n' +
    '2. Crée un compte et obtiens ta clé API\n' +
    '3. Colle ta clé ici :\n\n' +
    'Ou utilise la commande /apikey TA_CLE dans le chat.'
  );
  
  if (key && key.trim()) {
    deepseekAPI.setApiKey(key.trim());
    showToast('✅ Clé API configurée !', 'success');
    // Recharger la vue pour mettre à jour l'interface
    render();
  }
}

// Écouter les changements de langue pour mettre à jour les suggestions
eventBus.on('language-changed', () => {
  if (document.getElementById('chat') && !document.getElementById('chat').hidden) {
    I18n.translatePage();
  }
});
