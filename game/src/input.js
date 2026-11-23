// Ashfall Pact — mouse and keyboard, no game rules in it.
export function createInput(canvas, handlers) {
  function pos(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }
  canvas.addEventListener('click', (event) => {
    const p = pos(event);
    handlers.onClick(p.x, p.y);
  });
  canvas.addEventListener('mousemove', (event) => {
    const p = pos(event);
    handlers.onHover(p.x, p.y);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlers.onConfirm();
    } else if (event.key === 'Escape') {
      handlers.onCancel();
    } else if (event.key === 'm' || event.key === 'M') {
      handlers.onMute();
    }
  });
}
