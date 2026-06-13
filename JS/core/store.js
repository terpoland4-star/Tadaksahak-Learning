// Store réactif central avec Proxy
export const Store = new Proxy({
  state: {
    lang: localStorage.getItem('app_language') || 'fr',
    theme: localStorage.getItem('app_theme') || 'dark',
    dictionary: [],
    books: [],
    quiz: [],
    media: [],
    partners: [],
    contes: [],
    emissions: [],
    themes: [],
    timeline: [],
    relatives: null,
    livresConnaissance: null,
    user: {
      history: JSON.parse(localStorage.getItem('historiqueTadaksahak') || '[]'),
      favorites: JSON.parse(localStorage.getItem('favorisTadaksahak') || '[]'),
    }
  },
  _subscribers: new Map(),

  subscribe(key, callback) {
    if (!this._subscribers.has(key)) {
      this._subscribers.set(key, new Set());
    }
    this._subscribers.get(key).add(callback);
    // Retourner une fonction de désabonnement
    return () => this._subscribers.get(key)?.delete(callback);
  },

  _notify(key, value) {
    const subs = this._subscribers.get(key);
    if (subs) {
      subs.forEach(cb => cb(value));
    }
  }
}, {
  set(target, key, value) {
    target[key] = value;
    target._notify(key, value);
    return true;
  }
});

// Méthodes pratiques
Store.loadInitialData = async function() {
  try {
    const [dictionary, books, quiz, media, partners] = await Promise.all([
      fetch('./data/mots.json').then(r => r.json()),
      fetch('./data/livres.json').then(r => r.json()),
      fetch('./data/quiz.json').then(r => r.json()),
      fetch('./data/media.json').then(r => r.json()),
      fetch('./data/partenaires.json').then(r => r.json()),
    ]);
    this.state.dictionary = dictionary;
    this.state.books = books;
    this.state.quiz = quiz;
    this.state.media = media;
    this.state.partners = partners;
  } catch (e) {
    console.warn('Fallback données', e);
  }
};

Store.loadContes = async function() {
  try {
    const data = await fetch('./data/conte.json').then(r => r.json());
    this.state.contes = Array.isArray(data) ? data : [data];
  } catch (e) { console.warn(e); }
};

Store.loadEmissions = async function() { /* similaire */ };
Store.loadThemes = async function() { /* ... */ };
Store.loadRelatives = async function() { /* ... */ };
Store.loadLivresConnaissance = async function() { /* ... */ };

// Synchronisation avec localStorage pour l'historique et favoris
Store.subscribe('user', (user) => {
  localStorage.setItem('historiqueTadaksahak', JSON.stringify(user.history));
  localStorage.setItem('favorisTadaksahak', JSON.stringify(user.favorites));
});
