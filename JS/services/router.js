import { showLoader, hideLoader } from '../core/utils.js';
import { eventBus } from '../core/event-bus.js';

// Table des vues (lazy loading)
const routes = {
  '/accueil': () => import('../views/home.js'),
  '/dictionnaire': () => import('../views/dictionary.js'),
  '/grammaire': () => import('../views/grammar.js'),
  '/contes': () => import('../views/stories.js'),
  '/emissions': () => import('../views/media.js'), // media gère aussi émissions
  '/chat': () => import('../views/chat.js'),
  '/audio': () => import('../views/media.js'),
  '/photos': () => import('../views/media.js'),
  '/videos': () => import('../views/media.js'),
  '/livres': () => import('../views/books.js'),
  '/rapports': () => import('../views/books.js'),
  '/actualites': () => import('../views/actualites.js'),
  '/quiz': () => import('../views/quiz.js'),
  '/flashcards': () => import('../views/flashcards.js'),
  '/themes': () => import('../views/themes.js'),
  '/timeline': () => import('../views/timeline.js'),
  '/map': () => import('../views/map.js'),
  '/search-books': () => import('../views/search-books.js'),
  '/dashboard': () => import('../views/dashboard.js'),
  '/ressources': () => import('../views/ressources.js'),
};

function getRouteFromPath() {
  const path = window.location.pathname;
  return routes[path] ? path : '/accueil';
}

export async function initRouter() {
  // Clic sur les liens avec data-link
  document.body.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      navigate(link.getAttribute('data-link'));
    }
  });

  // Popstate (boutons précédent/suivant)
  window.addEventListener('popstate', () => {
    renderRoute(getRouteFromPath());
  });

  // Première vue
  await renderRoute(getRouteFromPath());
}

export function navigate(url) {
  history.pushState(null, '', url);
  renderRoute(getRouteFromPath());
}

async function renderRoute(route) {
  showLoader();
  try {
    const view = await routes[route]();
    await view.render();
    eventBus.emit('route-changed', { route });
  } catch (err) {
    console.error('Erreur chargement vue:', err);
    document.getElementById('main-content').innerHTML = '<p>Erreur de chargement.</p>';
  } finally {
    hideLoader();
  }
}
