export const Store = new Proxy({
  state: {
    lang: localStorage.getItem('app_language') || 'fr',
    theme: localStorage.getItem('app_theme') || 'dark',
    dictionary: [],
    books: [],
    quiz: [],
    media: { photos: [], audio: [], videos: [] },
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
      quizProgress: JSON.parse(localStorage.getItem('quizProgress') || '{}'),
      flashcardsProgress: JSON.parse(localStorage.getItem('flashcardsProgress') || '{}')
    }
  },
  _subscribers: new Map(),

  subscribe(key, callback) {
    if (!this._subscribers.has(key)) this._subscribers.set(key, new Set());
    this._subscribers.get(key).add(callback);
    return () => this._subscribers.get(key)?.delete(callback);
  },

  _notify(key, value) {
    const subs = this._subscribers.get(key);
    if (subs) subs.forEach(cb => cb(value));
  }
}, {
  set(target, key, value) {
    target[key] = value;
    target._notify(key, value);
    return true;
  }
});

// Chargement initial des données critiques (ne plante jamais)
Store.loadInitialData = async function() {
  // On utilise allSettled pour qu'un seul échec ne bloque pas tout
  const results = await Promise.allSettled([
    fetch('./data/mots.json').then(r => r.ok ? r.json() : Promise.reject()),
    fetch('./data/livres.json').then(r => r.ok ? r.json() : Promise.reject()),
    fetch('./data/quiz.json').then(r => r.ok ? r.json() : Promise.reject()),
    fetch('./data/media.json').then(r => r.ok ? r.json() : Promise.reject()),
    fetch('./data/partenaires.json').then(r => r.ok ? r.json() : Promise.reject()),
  ]);

  this.state.dictionary = results[0].status === 'fulfilled' ? results[0].value : getFallbackDictionary();
  this.state.books       = results[1].status === 'fulfilled' ? results[1].value : [];
  this.state.quiz        = results[2].status === 'fulfilled' ? results[2].value : {};
  this.state.media       = results[3].status === 'fulfilled' ? results[3].value : { photos: [], audio: [], videos: [] };
  this.state.partners    = results[4].status === 'fulfilled' ? results[4].value : [];

  console.log('📦 Données chargées :', {
    dictionnaire: this.state.dictionary.length + ' mots',
    livres: this.state.books.length,
    quiz: Object.keys(this.state.quiz).length + ' langues',
  });
};

function getFallbackDictionary() {
  return [
    { mot: "Báy", cat: "vt.", fr: "Pouvoir (faire)", en: "Able, to be", ar: "قدر على" },
    { mot: "Yiddár", cat: "vi.", fr: "Être en vie", en: "Alive, to be", ar: "يكون حياً" },
    { mot: "ayo", cat: "pron.", fr: "qui, que (relatif sg)", en: "who, which, that", ar: "الذي" },
    { mot: "Aryén", cat: "npl.", fr: "Eau", en: "Water", ar: "ماء" },
    { mot: "Kaarád", cat: "num.", fr: "Trois", en: "Three", ar: "ثلاثة" }
  ];
}

// Méthodes de chargement paresseux (pour les autres sections)
Store.loadContes = async function() {
  if (this.state.contes.length) return;
  try {
    const r = await fetch('./data/conte.json');
    if (r.ok) this.state.contes = await r.json();
  } catch (e) { /* silencieux */ }
};

Store.loadEmissions = async function() {
  if (this.state.emissions.length) return;
  try {
    const r = await fetch('./data/emission.json');
    if (r.ok) this.state.emissions = await r.json();
  } catch (e) {}
};

Store.loadThemes = async function() {
  if (this.state.themes.length) return;
  try {
    const r = await fetch('./data/themes.json');
    if (r.ok) this.state.themes = await r.json();
  } catch (e) {}
};

Store.loadTimeline = async function() {
  if (this.state.timeline.length) return;
  try {
    const r = await fetch('./data/timeline.json');
    if (r.ok) this.state.timeline = await r.json();
  } catch (e) {}
};

Store.loadRelatives = async function() {
  if (this.state.relatives) return;
  try {
    const r = await fetch('./data/relatives.json');
    if (r.ok) this.state.relatives = await r.json();
  } catch (e) {}
};

Store.loadLivresConnaissance = async function() {
  if (this.state.livresConnaissance) return;
  try {
    const r = await fetch('./data/livres_connaissance.json');
    if (r.ok) this.state.livresConnaissance = await r.json();
  } catch (e) {}
};

// Synchronisation automatique avec localStorage
Store.subscribe('user', user => {
  localStorage.setItem('historiqueTadaksahak', JSON.stringify(user.history));
  localStorage.setItem('favorisTadaksahak', JSON.stringify(user.favorites));
  localStorage.setItem('quizProgress', JSON.stringify(user.quizProgress));
  localStorage.setItem('flashcardsProgress', JSON.stringify(user.flashcardsProgress));
});
