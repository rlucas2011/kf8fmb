(function(){
  console.debug('lightbox.js initializing');
  function createOverlay(){
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML = '<div class="inner"><img id="lightbox-image" src="" alt=""><div class="caption" id="lightbox-caption"></div></div>';
    document.body.appendChild(overlay);
    console.debug('lightbox overlay created');

    overlay.addEventListener('click', function(e){
      // If the click was directly on the image, just hide the lightbox
      if (e.target.closest('#lightbox-image')) {
        hide();
        return;
      }

      // Click anywhere else in the overlay: navigate back when possible,
      // otherwise fall back to hiding the lightbox.
      // Try to navigate to the recorded origin if it's an HTML page
      const origin = overlay.dataset.origin || document.referrer || '';
      try {
        const originUrl = origin ? new URL(origin, window.location.href) : null;
        if (originUrl && /\.html?$/.test(originUrl.pathname)) {
          // If origin is same as current page, just hide instead of reloading.
          if (originUrl.href === window.location.href) {
            hide();
          } else {
            window.location.href = originUrl.href;
          }
          return;
        }
      } catch (err) {
        // ignore and fall back
      }

      if (history.length > 1) {
        history.back();
      } else {
        hide();
      }
    });

    document.addEventListener('keydown', function(e){
      console.debug('key event in lightbox:', e.key);
      if(e.key === 'Escape') hide();
    });

    return overlay;
  }

  let overlay = null;
  function show(img){
    if(!overlay) overlay = createOverlay();
    const imgEl = overlay.querySelector('#lightbox-image');
    const cap = overlay.querySelector('#lightbox-caption');
    imgEl.src = img.src;
    cap.textContent = img.alt || '';
    console.debug('showing image in lightbox:', img.src);
    // Determine the most likely "origin" page for this image:
    // 1. If the image is wrapped in a link, use that link's href (resolved).
    // 2. Otherwise, prefer the current page (`window.location.href`) so
    //    clicking the overlay returns to the post containing the image.
    // 3. Fall back to `document.referrer` only if necessary.
    let origin = '';
    const anchor = img.closest('a');
    try {
      if (anchor && anchor.getAttribute('href')) {
        origin = new URL(anchor.getAttribute('href'), window.location.href).href;
      } else if (window && window.location && window.location.href) {
        origin = window.location.href;
      } else if (document.referrer) {
        origin = document.referrer;
      } else {
        origin = '';
      }
    } catch (err) {
      origin = (window && window.location && window.location.href) || document.referrer || '';
    }
    overlay.dataset.origin = origin;
    overlay.classList.add('active');
    document.documentElement.classList.add('lightbox-hide-scroll');
  }

  function hide(){
    if(!overlay) return;
    overlay.classList.remove('active');
    document.documentElement.classList.remove('lightbox-hide-scroll');
  }

  function shouldEnable(img){
    if(!img) return false;
    if(img.closest('nav') || img.closest('header') || img.closest('footer')) return false;
    const small = img.naturalWidth && img.naturalWidth < 150;
    return !small;
  }

  document.addEventListener('click', function(e){
    console.debug('document click detected, target:', e.target);
    const img = e.target.closest('img');
    if(!img) return;
    console.debug('image click detected:', img.src);
    if(!shouldEnable(img)) return;
    show(img);
  });
})();
