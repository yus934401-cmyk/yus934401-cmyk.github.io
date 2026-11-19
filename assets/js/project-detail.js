document.addEventListener('DOMContentLoaded', () => {
  const staticView = new URLSearchParams(location.search).get('static') === '1';
  if (staticView) document.documentElement.style.scrollBehavior = 'auto';

  const slides = [...document.querySelectorAll('[data-gallery-index]')];
  const projectName = document.body.dataset.projectName || '闪小白';
  const dialog = document.getElementById('image-viewer');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.viewer__image');
  const title = dialog.querySelector('.viewer__title');
  const status = dialog.querySelector('.viewer__status');
  const stage = dialog.querySelector('.viewer__stage');
  const zoom = dialog.querySelector('[data-zoom]');
  const previous = dialog.querySelector('[data-previous]');
  const next = dialog.querySelector('[data-next]');
  const save = dialog.querySelector('.viewer__save');
  let current = 0;
  let loadToken = 0;
  let trigger = null;
  let dragging = null;

  function resetZoom() {
    dialog.classList.remove('is-zoomed', 'is-dragging');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = '放大细节';
    stage.scrollTo(0, 0);
  }

  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    const slide = slides[current];
    resetZoom();
    title.textContent = `${current + 1} / ${slides.length} · ${slide.dataset.title}`;
    image.alt = slide.querySelector('img').alt;
    status.textContent = '正在加载高清图片…';
    const preview = slide.querySelector('img');
    image.src = preview.currentSrc || preview.src;
    const token = ++loadToken;
    const full = new Image();
    full.decoding = 'async';
    full.onload = () => {
      if (token !== loadToken || !dialog.open) return;
      image.src = full.src;
      status.textContent = dialog.classList.contains('is-zoomed')
        ? '可拖动图片或滚动查看，手机可左右滑动。'
        : '可放大查看细节；按 Esc 关闭。';
    };
    full.onerror = () => {
      if (token === loadToken && dialog.open) status.textContent = '高清图片暂不可用，当前显示预览图。';
    };
    full.src = slide.href;
    save.href = slide.href;
    save.download = `${projectName}-${slide.dataset.title}.webp`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
  }

  slides.forEach((slide, index) => {
    slide.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      trigger = slide;
      show(index);
      dialog.showModal();
      document.body.classList.add('viewer-open');
    });
  });

  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  zoom.addEventListener('click', () => {
    const enlarged = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? '适应屏幕' : '放大细节';
    stage.scrollTo(0, 0);
    if (enlarged) status.textContent = '可拖动图片或滚动查看，手机可左右滑动。';
    else status.textContent = '可放大查看细节；按 Esc 关闭。';
  });
  dialog.addEventListener('keydown', (event) => {
    if (dialog.classList.contains('is-zoomed') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' && current > 0) { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight' && current < slides.length - 1) { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    resetZoom();
    if (trigger) trigger.focus({ preventScroll: true });
  });
  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !dialog.classList.contains('is-zoomed')) return;
    dragging = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    stage.setPointerCapture(event.pointerId);
    dialog.classList.add('is-dragging');
    event.preventDefault();
  });
  stage.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    stage.scrollLeft = dragging.left - event.clientX + dragging.x;
    stage.scrollTop = dragging.top - event.clientY + dragging.y;
  });
  const stopDragging = () => { dragging = null; dialog.classList.remove('is-dragging'); };
  stage.addEventListener('pointerup', stopDragging);
  stage.addEventListener('pointercancel', stopDragging);
  stage.addEventListener('lostpointercapture', stopDragging);
});
