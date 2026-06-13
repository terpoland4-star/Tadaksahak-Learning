import { Store } from '../core/store.js';

export const ThemeManager = {
  init() {
    // Applique le thème sauvegardé
    this.apply(Store.state.theme);
    // Écoute des boutons
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        Store.state.theme = theme;
        this.apply(theme);
      });
    });
    // Options supplémentaires (police, contraste)
    document.getElementById('fontFamilySelect')?.addEventListener('change', e => {
      document.documentElement.style.setProperty('--font-family', e.target.value);
      localStorage.setItem('app_font_family', e.target.value);
    });
    document.getElementById('fontSizeSelect')?.addEventListener('change', e => {
      document.documentElement.style.setProperty('--font-size-scale', e.target.value + '%');
      localStorage.setItem('app_font_size', e.target.value);
    });
    document.getElementById('highContrastCheck')?.addEventListener('change', e => {
      document.body.classList.toggle('high-contrast', e.target.checked);
      localStorage.setItem('app_high_contrast', e.target.checked);
    });
    // Récupération des préférences sauvegardées
    const fontFamily = localStorage.getItem('app_font_family');
    if (fontFamily) document.documentElement.style.setProperty('--font-family', fontFamily);
    const fontSize = localStorage.getItem('app_font_size');
    if (fontSize) document.documentElement.style.setProperty('--font-size-scale', fontSize + '%');
    const highContrast = localStorage.getItem('app_high_contrast') === 'true';
    if (highContrast) document.body.classList.add('high-contrast');
  },

  apply(theme) {
    document.body.classList.remove('dark', 'light', 'sepia');
    document.body.classList.add(theme);
    localStorage.setItem('app_theme', theme);
  }
};
