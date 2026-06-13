export function showModal(contentHtml, closeCallback = null) {
  const modal = document.getElementById('modal');
  if (modal) modal.remove();
  const div = document.createElement('div');
  div.id = 'modal';
  div.className = 'modal';
  div.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <div class="modal-body">${contentHtml}</div>
    </div>
  `;
  document.body.appendChild(div);
  div.querySelector('.modal-close').addEventListener('click', () => {
    div.remove();
    if (closeCallback) closeCallback();
  });
  div.addEventListener('click', e => { if (e.target === div) { div.remove(); if (closeCallback) closeCallback(); } });
}
