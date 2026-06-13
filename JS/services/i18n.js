import { Store } from '../core/store.js';
import { eventBus } from '../core/event-bus.js';

const SUPPORTED = ['fr', 'en', 'ar'];

export const I18n = {
  translations: {},

  async init() {
    // Chargement des trois fichiers de langue
    for (const lang of SUPPORTED) {
      try {
        const res = await fetch(`./i18n/${lang}.json`);
        this.translations[lang] = await res.json();
      } catch (e) {
        console.warn(`i18n/${lang}.json manquant`);
        this.translations[lang] = this._fallback(lang);
      }
    }
    // Appliquer la langue sauvegardée
    this.setLanguage(Store.state.lang, false);
    this._bindSwitcher();
    Store.subscribe('lang', (lang) => this.setLanguage(lang, true));
  },

  _fallback(lang) {
    // Fallback minimal (copie des clés essentielles)
    return {}; // Sera complété par les vrais fichiers
  },

  t(key, params = {}) {
    const lang = Store.state.lang;
    const val = this.translations[lang]?.[key] || this.translations['fr']?.[key] || key;
    return val.replace(/\{(\w+)\}/g, (_, p) => params[p] ?? '');
  },

  translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
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
    // Mise à jour des placeholders spécifiques
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
  },

  setLanguage(lang, updateStore = true) {
    if (!SUPPORTED.includes(lang)) return;
    if (updateStore) Store.state.lang = lang;
    document.documentElement.lang = lang === 'ar' ? 'ar' : (lang === 'en' ? 'en' : 'fr');
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.translatePage();
    eventBus.emit('language-changed', { lang });
  },

  _bindSwitcher() {
    document.querySelectorAll('.lang-flag').forEach(btn => {
      btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
    });
  }
};
