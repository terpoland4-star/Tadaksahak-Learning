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
      grammar_title: "📚 Grammaire",
      contes_title: "📖 Contes et légendes",
      emissions_title: "🎙️ Émissions radio",
      chat_title: "💬 Chat Bot Hamadine",
      audio_title: "🎧 Albums Audio",
      photos_title: "🖼️ Galerie Photos",
      videos_title: "🎥 Vidéos",
      books_title: "📚 Bibliothèque",
      reports_title: "📄 Rapports et Documents",
      actualites_title: "📰 Actualités",
      quiz_title: "❓ Quiz Culturel",
      flashcards_title: "🃏 Flashcards",
      themes_title: "📚 Vocabulaire thématique",
      timeline_title: "📅 Ligne du temps historique",
      map_title: "🗺️ Carte des zones Idaksahak",
      search_books_title: "🔍 Recherche dans les livres",
      dashboard_title: "📊 Tableau de bord",
      ressources_title: "📚 Ressources académiques",
      prev: "⬅️ Précédent",
      next: "Suivant ➡️",
      alphabet_index: "Index alphabétique",
      share: "Partager",
      add_favorite: "Ajouter aux favoris",
      remove_favorite: "Retirer des favoris",
      word_of_day: "🌟 Mot du jour",
      footer_quicklinks: "Liens rapides",
      footer_contact: "Contact",
      footer_follow: "Suivez-nous",
      theme_dark: "Thème sombre",
      theme_light: "Thème clair",
      theme_sepia: "Thème sépia",
      cookies_message: "Ce site utilise des cookies pour améliorer votre expérience.",
      cookies_accept: "J'accepte",
      cookies_reject: "Refuser",
      error_loading: "Erreur de chargement",
      no_results: "Aucun résultat trouvé",
    };
    if (lang === 'en') return {
      loading: "Loading...",
      subtitle: "Idaksahak language and culture",
      nav_home: "🏠 Home",
      nav_dictionary: "📖 Dictionary",
      nav_grammar: "📚 Grammar",
      nav_contes: "📖 Tales",
      nav_emissions: "🎙️ Broadcasts",
      nav_chat: "💬 Chat Bot",
      nav_audio: "🎧 Audio",
      nav_photos: "🖼️ Photos",
      nav_videos: "🎥 Videos",
      nav_books: "📚 Books",
      nav_reports: "📄 Reports",
      nav_actualites: "📰 News",
      nav_quiz: "❓ Quiz",
      nav_flashcards: "🃏 Flashcards",
      nav_themes: "📚 Themes",
      nav_timeline: "📅 Timeline",
      nav_map: "🗺️ Map",
      nav_search: "🔍 Search books",
      nav_dashboard: "📊 Dashboard",
      nav_ressources: "📚 Resources",
      welcome_title: "Welcome",
      welcome_subtitle: "A platform dedicated to the Tadaksahak language and culture.",
      go_dico: "📖 Go to dictionary",
      stat_words: "words",
      stat_audios: "audios",
      stat_books: "books",
      stat_users: "users",
      dictionary_title: "📖 Dictionary",
      grammar_title: "📚 Grammar",
      contes_title: "📖 Tales and legends",
      emissions_title: "🎙️ Radio broadcasts",
      chat_title: "💬 Hamadine Chat Bot",
      audio_title: "🎧 Audio Albums",
      photos_title: "🖼️ Photo Gallery",
      videos_title: "🎥 Videos",
      books_title: "📚 Library",
      reports_title: "📄 Reports and Documents",
      actualites_title: "📰 News",
      quiz_title: "❓ Cultural Quiz",
      flashcards_title: "🃏 Flashcards",
      themes_title: "📚 Thematic vocabulary",
      timeline_title: "📅 Historical Timeline",
      map_title: "🗺️ Map of Idaksahak areas",
      search_books_title: "🔍 Search in books",
      dashboard_title: "📊 Dashboard",
      ressources_title: "📚 Academic Resources",
      prev: "⬅️ Previous",
      next: "Next ➡️",
      alphabet_index: "Alphabetical index",
      share: "Share",
      add_favorite: "Add to favorites",
      remove_favorite: "Remove from favorites",
      word_of_day: "🌟 Word of the day",
      footer_quicklinks: "Quick links",
      footer_contact: "Contact",
      footer_follow: "Follow us",
      theme_dark: "Dark theme",
      theme_light: "Light theme",
      theme_sepia: "Sepia theme",
      cookies_message: "This site uses cookies to improve your experience.",
      cookies_accept: "I accept",
      cookies_reject: "Reject",
      error_loading: "Loading error",
      no_results: "No results found",
    };
    if (lang === 'ar') return {
      loading: "جاري التحميل...",
      subtitle: "لغة وثقافة إدكساهق",
      nav_home: "🏠 الرئيسية",
      nav_dictionary: "📖 القاموس",
      nav_grammar: "📚 قواعد اللغة",
      nav_contes: "📖 حكايات",
      nav_emissions: "🎙️ برامج إذاعية",
      nav_chat: "💬 الدردشة",
      nav_audio: "🎧 الصوتيات",
      nav_photos: "🖼️ الصور",
      nav_videos: "🎥 الفيديوهات",
      nav_books: "📚 الكتب",
      nav_reports: "📄 التقارير",
      nav_actualites: "📰 الأخبار",
      nav_quiz: "❓ اختبار",
      nav_flashcards: "🃏 بطاقات التعلم",
      nav_themes: "📚 المواضيع",
      nav_timeline: "📅 الخط الزمني",
      nav_map: "🗺️ الخريطة",
      nav_search: "🔍 بحث في الكتب",
      nav_dashboard: "📊 لوحة التحكم",
      nav_ressources: "📚 الموارد",
      welcome_title: "مرحباً",
      welcome_subtitle: "منصة مخصصة للغة والثقافة التدكساهقية.",
      go_dico: "📖 الذهاب إلى القاموس",
      stat_words: "كلمات",
      stat_audios: "صوتيات",
      stat_books: "كتب",
      stat_users: "مستخدمين",
      dictionary_title: "📖 القاموس",
      grammar_title: "📚 القواعد",
      contes_title: "📖 حكايات وأساطير",
      emissions_title: "🎙️ برامج إذاعية",
      chat_title: "💬 محادثة حمدين",
      audio_title: "🎧 ألبومات صوتية",
      photos_title: "🖼️ معرض الصور",
      videos_title: "🎥 فيديوهات",
      books_title: "📚 المكتبة",
      reports_title: "📄 التقارير والوثائق",
      actualites_title: "📰 الأخبار",
      quiz_title: "❓ اختبار ثقافي",
      flashcards_title: "🃏 بطاقات التعلم",
      themes_title: "📚 مفردات موضوعية",
      timeline_title: "📅 الخط الزمني التاريخي",
      map_title: "🗺️ خريطة مناطق إدكساهق",
      search_books_title: "🔍 بحث في الكتب",
      dashboard_title: "📊 لوحة التحكم",
      ressources_title: "📚 الموارد الأكاديمية",
      prev: "⬅️ السابق",
      next: "التالي ➡️",
      alphabet_index: "الفهرس الأبجدي",
      share: "مشاركة",
      add_favorite: "أضف إلى المفضلة",
      remove_favorite: "إزالة من المفضلة",
      word_of_day: "🌟 كلمة اليوم",
      footer_quicklinks: "روابط سريعة",
      footer_contact: "اتصل بنا",
      footer_follow: "تابعنا",
      theme_dark: "المظهر الداكن",
      theme_light: "المظهر الفاتح",
      theme_sepia: "المظهر البني",
      cookies_message: "يستخدم هذا الموقع ملفات تعريف الارتباط.",
      cookies_accept: "موافق",
      cookies_reject: "رفض",
      error_loading: "خطأ في التحميل",
      no_results: "لا توجد نتائج",
    };
    return {}; // fallback ultime
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
