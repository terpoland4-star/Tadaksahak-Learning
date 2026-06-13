export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

export function normalizeText(s) {
  return s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
}

export function levenshtein(a, b) { /* ... identique à l'original ... */ }

export function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast-${type}`;
  toast.hidden = false;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.hidden = true, 3000);
}

export function showLoader() {
  const el = document.getElementById('loadingOverlay');
  if (el) { el.hidden = false; el.style.display = 'flex'; }
}
export function hideLoader() {
  const el = document.getElementById('loadingOverlay');
  if (el) { el.hidden = true; el.style.display = 'none'; }
}
