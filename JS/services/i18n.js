import { Store } from '../core/store.js';
import { eventBus } from '../core/event-bus.js';

const SUPPORTED = ['fr', 'en', 'ar'];

export const I18n = {
  translations: {},

  async init() {
    await this.loadAllLanguages();
    this.setLanguage(Store.state.lang, false);
    this._bindSwitcher();
    Store.subscribe('lang', (lang) => this.setLanguage(lang, true));
  },

  async loadAllLanguages() {
    for (const lang of SUPPORTED) {
      try {
        const res = await fetch(`./i18n/${lang}.json`);
        if (res.ok) {
          this.translations[lang] = await res.json();
        } else {
          this.translations[lang] = this._getFallback(lang);
        }
      } catch (e) {
        console.warn(`i18n/${lang}.json non trouvé, utilisation du fallback`);
        this.translations[lang] = this._getFallback(lang);
      }
    }
  },

  _getFallback(lang) {
    if (lang === 'fr') return {
      loading: "Chargement...",
      subtitle: "Langue et culture Idaksahak",
      nav_home: "🏠 Accueil",
      nav_dictionary: "📖 Dictionnaire",
      nav_grammar: "📚 Grammaire",
      nav_contes: "📖 Contes",
      nav_emissions: "🎙️ Émissions",
      nav_chat: "💬 Chat Bot",
      nav_audio: "🎧 Audio",
      nav_photos: "🖼️ Photos",
      nav_videos: "🎥 Vidéos",
      nav_books: "📚 Livres",
      nav_reports: "📄 Rapports",
      nav_actualites: "📰 Actualités",
      nav_quiz: "❓ Quiz",
      nav_flashcards: "🃏 Flashcards",
      nav_themes: "📚 Thèmes",
      nav_timeline: "📅 Ligne du temps",
      nav_map: "🗺️ Carte",
      nav_search: "🔍 Recherche livres",
      nav_dashboard: "📊 Tableau de bord",
      nav_ressources: "📚 Ressources",
      welcome_title: "Bienvenue",
      welcome_subtitle: "Une plateforme dédiée à la langue et à la culture Tadaksahak.",
      go_dico: "📖 Accéder au dictionnaire",
      stat_words: "mots",
      stat_audios: "audios",
      stat_books: "livres",
      stat_users: "utilisateurs",
      dictionary_title: "📖 Dictionnaire",
      prev: "⬅️ Précédent",
      next: "Suivant ➡️",
      alphabet_index: "Index alphabétique",
      share: "Partager",
      add_favorite: "Ajouter aux favoris",
      remove_favorite: "Retirer des favoris",
      word_of_day: "🌟 Mot du jour",
      footer_quicklinks: "Liens rapides",
      footer_contact: "Contact",
      footer_follow: "Suivez-nous"
    };
    // Pour l'anglais et l'arabe, on renvoie un objet minimal (clés principales en anglais/arabe basique)
    return {};
  },

  t(key, params = {}) {
    const lang = Store.state.lang;
    const val = this.translations[lang]?.[key] || this.translations['fr']?.[key] || key;
    return String(val).replace(/\{(\w+)\}/g, (_, p) => params[p] ?? '');
  },

  translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!key) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = this.t(key);
      } else if (el.tagName === 'SELECT') {
        [...el.options].forEach(opt => {
          const optKey = opt.getAttribute('data-i18n');
          if (optKey) opt.textContent = this.t(optKey);
        });
      } else {
        el.textContent = this.t(key);
      }
    });
  },

  setLanguage(lang, updateStore = true) {
    if (!SUPPORTED.includes(lang)) return;
    if (updateStore) Store.state.lang = lang;
    document.documentElement.lang = lang === 'ar' ? 'ar' : (lang === 'en' ? 'en' : 'fr');
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.translatePage();
    eventBus.emit('language-changed', { lang });
    document.querySelectorAll('.lang-flag').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  },

  _bindSwitcher() {
    document.querySelectorAll('.lang-flag').forEach(btn => {
      btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
    });
  }
};
