import { Store } from './core/store.js';
import { initRouter } from './services/router.js';
import { I18n } from './services/i18n.js';
import { ThemeManager } from './services/theme.js';
import { showLoader, hideLoader, showToast } from './core/utils.js';

(async () => {
  showLoader();
  try {
    // Initialisation des services globaux (ne bloquent pas)
    ThemeManager.init();
    
    // Internationalisation avec fallback intégré
    await I18n.init();
    
    // Chargement des données critiques avec fallback
    await Store.loadInitialData();
    
    // Démarrage du routeur (charge la première vue)
    await initRouter();
  } catch (error) {
    console.error('Erreur fatale:', error);
    // Afficher un message d'erreur minimal dans le main
    const main = document.getElementById('main-content');
    if (main) {
      main.innerHTML = `<p style="color:red;text-align:center;padding:2rem;">❌ Erreur de chargement. Vérifiez la console (F12).</p>`;
    }
  } finally {
    // TOUJOURS cacher le loader
    hideLoader();
  }
})();
