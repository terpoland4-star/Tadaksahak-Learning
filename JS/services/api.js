/**
 * Client pour l'API DeepSeek
 * Supporte les modèles : deepseek-chat (conversation) et deepseek-reasoner (raisonnement)
 * 
 * La clé API par défaut est intégrée pour un usage immédiat.
 * Elle peut être modifiée via la commande /apikey dans le chat.
 */
export class DeepSeekAPI {
  constructor(apiKey = null) {
    // Clé par défaut intégrée pour faciliter l'usage communautaire
    const DEFAULT_KEY = 'sk-ddcaee427287468689b3fb0a83e19b44';
    this.apiKey = apiKey || localStorage.getItem('deepseek_api_key') || DEFAULT_KEY;
    this.baseURL = 'https://api.deepseek.com/v1';
    this.models = {
      chat: 'deepseek-chat',
      reasoner: 'deepseek-reasoner'
    };
  }

  /**
   * Configure la clé API
   */
  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('deepseek_api_key', key);
  }

  /**
   * Vérifie si l'API est disponible
   */
  isAvailable() {
    return !!this.apiKey;
  }

  /**
   * Appel à l'API DeepSeek Chat (mode conversation)
   * @param {Array} messages - Historique des messages [{role: 'user'|'assistant'|'system', content: '...'}]
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('Clé API DeepSeek non configurée');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.models.chat,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erreur DeepSeek: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }

  /**
   * Appel à l'API DeepSeek Chat avec streaming
   * @param {Array} messages - Historique des messages
   * @param {Function} onChunk - Callback pour chaque morceau de texte
   * @param {Object} options - Options supplémentaires
   */
  async chatStream(messages, onChunk, options = {}) {
    if (!this.apiKey) {
      throw new Error('Clé API DeepSeek non configurée');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.models.chat,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erreur DeepSeek: ${error.error?.message || response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) onChunk(content);
            } catch (e) {
              // Ignorer les lignes non parsables
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Appel à l'API DeepSeek Reasoner (mode raisonnement approfondi)
   * @param {string} question - Question à analyser
   * @param {Object} context - Contexte supplémentaire (données locales)
   * @returns {Promise<Object>}
   */
  async reason(question, context = {}) {
    if (!this.apiKey) {
      throw new Error('Clé API DeepSeek non configurée');
    }

    const systemPrompt = this._buildReasonerPrompt(context);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ];

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.models.reasoner,
        messages: messages,
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erreur DeepSeek Reasoner: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  /**
   * Construit le prompt système pour le mode raisonnement
   */
  _buildReasonerPrompt(context) {
    let prompt = `Tu es un assistant spécialisé dans la langue et la culture Tadaksahak (Idaksahak). 
Tu es un expert linguistique et culturel de ce peuple du Sahara.

La langue Tadaksahak est une langue songhay du Nord, influencée par le berbère (tamasheq) et l'arabe.
Elle est parlée principalement dans la région de Ménaka au Mali.

Ton rôle est de :
1. Répondre avec précision aux questions linguistiques sur le tadaksahak
2. Expliquer les concepts grammaticaux (causatifs, passifs, propositions relatives)
3. Fournir des informations culturelles et historiques
4. Analyser des mots et expressions en tadaksahak

Contexte supplémentaire fourni :
`;

    if (context.relatedWords && context.relatedWords.length) {
      prompt += `\nMots tadaksahak pertinents :\n${context.relatedWords.map(w => `- ${w.mot} : ${w.fr || w.en}`).join('\n')}`;
    }

    if (context.grammarBlocks && context.grammarBlocks.length) {
      prompt += `\nInformations grammaticales :\n${context.grammarBlocks.map(b => `${b.titre_section?.fr || ''}: ${b.contenu?.fr?.substring(0, 500) || ''}`).join('\n')}`;
    }

    if (context.relativeClauses) {
      prompt += `\nDonnées sur les propositions relatives :\n${JSON.stringify(context.relativeClauses, null, 2).substring(0, 1000)}`;
    }

    prompt += `\n\nRéponds de manière conversationnelle, précise et utile. Si la question n'est pas liée au tadaksahak ou à la culture Idaksahak, oriente poliment l'utilisateur vers ces sujets.`;

    return prompt;
  }
}

// Instance singleton
export const deepseekAPI = new DeepSeekAPI();
