import { Store } from './core/store.js';
import { initRouter } from './services/router.js';
import { I18n } from './services/i18n.js';
import { ThemeManager } from './services/theme.js';
import { showToast } from './core/utils.js';

(async () => {
  try {
    // Initialisation des services globaux
    ThemeManager.init();

    // Internationalisation avec fallback intégré
    await I18n.init().catch(err => {
      console.error('Erreur i18n:', err);
      showToast('Erreur de chargement des langues', 'warning');
    });

    // Chargement des données critiques (dictionnaire, etc.)
    await Store.loadInitialData().catch(err => {
      console.error('Erreur chargement données:', err);
      showToast('Certaines données sont indisponibles', 'warning');
    });

    // Démarrage du routeur (charge la première vue)
    await initRouter();
  } catch (error) {
    console.error('Erreur fatale:', error);
    showToast('Erreur critique - Rechargez la page', 'error');
  }
})();
