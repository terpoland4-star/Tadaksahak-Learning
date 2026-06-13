import { Store } from './core/store.js';
import { initRouter } from './services/router.js';
import { I18n } from './services/i18n.js';
import { ThemeManager } from './services/theme.js';
import { showLoader, hideLoader } from './core/utils.js';

(async () => {
  showLoader();
  try {
    // Initialisation des services globaux
    ThemeManager.init();
    await I18n.init();

    // Chargement des données critiques (dictionnaire, etc.)
    await Store.loadInitialData();

    // Démarrage du routeur (charge la première vue)
    await initRouter();
  } catch (error) {
    console.error('Erreur fatale:', error);
  } finally {
    hideLoader();
  }
})();
