/**
 * Gestionnaire de conversation avec mémoire et contexte
 */
export class ConversationManager {
  constructor() {
    this.messages = [];           // Historique complet
    this.contextMemory = {        // Mémoire à long terme (session)
      topics: [],                 // Sujets abordés
      wordsAsked: [],             // Mots demandés
      lastSection: null,          // Dernière section visitée
      userPreferences: {},        // Préférences utilisateur
      conversationStage: 'greeting' // Étape de la conversation
    };
    this.maxHistoryTokens = 4000; // Limite de tokens pour l'historique
    this.loadFromStorage();
  }

  /**
   * Ajoute un message à l'historique
   */
  addMessage(role, content) {
    this.messages.push({
      role,
      content,
      timestamp: Date.now()
    });
    this._trimHistory();
    this.saveToStorage();
  }

  /**
   * Obtient l'historique formaté pour l'API
   */
  getHistoryForAPI(systemPrompt, maxMessages = 20) {
    const history = [];
    
    // Toujours inclure le prompt système en premier
    if (systemPrompt) {
      history.push({ role: 'system', content: systemPrompt });
    }

    // Limiter aux derniers messages
    const recentMessages = this.messages.slice(-maxMessages);
    for (const msg of recentMessages) {
      history.push({ role: msg.role, content: msg.content });
    }

    return history;
  }

  /**
   * Analyse et met à jour le contexte
   */
  analyzeMessage(content) {
    const lower = content.toLowerCase();
    
    // Détection des sujets
    if (lower.includes('dictionnaire') || lower.includes('mot') || lower.includes('traduction')) {
      this.contextMemory.topics.push('dictionary');
    }
    if (lower.includes('grammaire') || lower.includes('verbe') || lower.includes('causatif') || lower.includes('passif')) {
      this.contextMemory.topics.push('grammar');
    }
    if (lower.includes('relative') || lower.includes('proposition')) {
      this.contextMemory.topics.push('relative_clauses');
    }
    if (lower.includes('histoire') || lower.includes('culture') || lower.includes('tradition')) {
      this.contextMemory.topics.push('culture');
    }

    // Limiter la taille des topics
    if (this.contextMemory.topics.length > 20) {
      this.contextMemory.topics = this.contextMemory.topics.slice(-10);
    }

    // Détection du stade de conversation
    if (lower.match(/bonjour|salut|salam|hello|cc|coucou/)) {
      this.contextMemory.conversationStage = 'greeted';
    }
    if (lower.match(/merci|thanks|شكرا/)) {
      this.contextMemory.conversationStage = 'thanked';
    }
    if (lower.match(/au revoir|bye|salut|à plus|adieu/)) {
      this.contextMemory.conversationStage = 'goodbye';
    }
  }

  /**
   * Extrait les mots tadaksahak mentionnés dans un message
   */
  extractTadaksahakWords(content, dictionary) {
    const words = [];
    if (!dictionary || !dictionary.length) return words;
    
    for (const entry of dictionary) {
      if (content.toLowerCase().includes(entry.mot.toLowerCase())) {
        words.push(entry);
      }
    }
    return words;
  }

  /**
   * Génère un prompt système contextuel
   */
  generateSystemPrompt() {
    let prompt = `Tu es Hamadine, un assistant conversationnel spécialisé dans la langue et la culture Tadaksahak (Idaksahak).

Tu parles couramment le français, l'anglais et l'arabe.
Tu es chaleureux, patient et pédagogue.
Tu tutoies l'utilisateur de manière amicale.

Contexte actuel de la conversation :
- Sujets récents : ${[...new Set(this.contextMemory.topics)].slice(-5).join(', ') || 'aucun'}
- Stade de la conversation : ${this.contextMemory.conversationStage}

Si l'utilisateur te salue, réponds chaleureusement.
Si l'utilisateur te remercie, réponds avec humilité.
Si l'utilisateur te dit au revoir, réponds avec bienveillance.

Tu es un expert de la langue tadaksahak. Tu peux :
- Donner des définitions de mots
- Expliquer la grammaire (causatifs, passifs, relatives)
- Raconter des contes et légendes
- Parler de l'histoire et de la culture Idaksahak
- Aider à l'apprentissage de la langue

Reste toujours dans le contexte de la langue et culture Tadaksahak.`;

    return prompt;
  }

  /**
   * Nettoie l'historique pour éviter de dépasser les limites de tokens
   */
  _trimHistory() {
    // Estimation simple : 1 token ≈ 4 caractères
    let totalChars = 0;
    const trimmed = [];
    
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msgChars = this.messages[i].content.length;
      if (totalChars + msgChars > this.maxHistoryTokens * 4) break;
      trimmed.unshift(this.messages[i]);
      totalChars += msgChars;
    }
    
    this.messages = trimmed;
  }

  /**
   * Sauvegarde dans localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem('chat_history', JSON.stringify({
        messages: this.messages.slice(-50), // Garder les 50 derniers messages
        context: this.contextMemory
      }));
    } catch (e) {
      // localStorage plein ou indisponible
    }
  }

  /**
   * Charge depuis localStorage
   */
  loadFromStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem('chat_history') || '{}');
      if (saved.messages) this.messages = saved.messages;
      if (saved.context) this.contextMemory = { ...this.contextMemory, ...saved.context };
    } catch (e) {
      // Données corrompues, on garde les valeurs par défaut
    }
  }

  /**
   * Réinitialise la conversation
   */
  reset() {
    this.messages = [];
    this.contextMemory = {
      topics: [],
      wordsAsked: [],
      lastSection: null,
      userPreferences: {},
      conversationStage: 'greeting'
    };
    localStorage.removeItem('chat_history');
  }
}
