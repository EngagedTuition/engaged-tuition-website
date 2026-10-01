/* Scroll reveal: content fades up as it scrolls into view and fades away
   as it scrolls off, in both directions. Anything on screen at load shows
   straight away, so there is no flash on arrival. Without JS (or with
   reduced motion) everything simply shows. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SELECTORS = [
    // homepage
    '.about-left', '.about-right',
    '.why-intro', '.why-card', '.why-side',
    '.subjects-top', '.subjects-grid > .subject-pill', '.subject-guides', '.playbook-banner',
    '.tutors-intro', '.tutors-carousel-panel',
    '.pricing-top', '.pricing-card',
    '.contact-left', '.contact-right', '.review-form-section',
    // subject pages
    '.subject-body .card', '.subject-body .quote', '.playbook-strip',
    '.cta-band .container', '.other-subjects',
    // playbook
    '.guide-section > :not(.tips):not(.timeline)', '.tip', '.timeline > li', '.small-print'
  ].join(',');

  // Elements positioned with their own transform: fade only, no slide,
  // or the animation would knock them out of place.
  var FADE_ONLY = '.why-side';

  // Share of an element that must be inside the viewing band to count as shown.
  var SHOW_RATIO = 0.15;

  var style = document.createElement('style');
  style.textContent =
    '.reveal{animation-duration:.7s;animation-timing-function:cubic-bezier(.22,.61,.36,1)}' +
    '.reveal:not(.is-visible){opacity:0;pointer-events:none}' +
    '.reveal.is-visible{animation-name:revealIn;animation-fill-mode:backwards;animation-delay:var(--reveal-delay,0s)}' +
    '.reveal.is-visible.reveal-instant{animation:none}' +
    '.reveal.out-up{animation-name:revealOutUp;animation-fill-mode:forwards;animation-duration:.5s}' +
    '.reveal.out-down{animation-name:revealOutDown;animation-fill-mode:forwards;animation-duration:.5s}' +
    '.reveal-fade.is-visible{animation-name:revealFadeIn}' +
    '.reveal-fade.out-up,.reveal-fade.out-down{animation-name:revealFadeOut}' +
    '@keyframes revealFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes revealFadeOut{from{opacity:1}to{opacity:0}}' +
    '@keyframes revealIn{from{opacity:0;transform:translateY(var(--reveal-from,24px))}to{opacity:1;transform:none}}' +
    '@keyframes revealOutUp{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-20px)}}' +
    '@keyframes revealOutDown{from{opacity:1;transform:none}to{opacity:0;transform:translateY(24px)}}';
  document.head.appendChild(style);

  function show(el, delay, fromAbove) {
    el.classList.remove('out-up', 'out-down', 'reveal-instant');
    el.style.setProperty('--reveal-delay', delay + 's');
    el.style.setProperty('--reveal-from', fromAbove ? '-20px' : '24px');
    el.classList.add('is-visible');
  }

  function hide(el, wentUp) {
    if (!el.classList.contains('is-visible')) return;
    el.classList.remove('is-visible', 'reveal-instant');
    el.classList.add(wentUp ? 'out-up' : 'out-down');
  }

  function init() {
    var els = document.querySelectorAll(SELECTORS);
    var fold = window.innerHeight;

    var io = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (e) {
        var el = e.target;
        var above = e.boundingClientRect.top < e.rootBounds.top;
        if (e.isIntersecting && e.intersectionRatio >= SHOW_RATIO) {
          if (!el.classList.contains('is-visible')) {
            // Stagger items that arrive together, e.g. a row of cards.
            show(el, Math.min(shown * 0.08, 0.4), above);
            shown++;
          }
        } else if (el.dataset.revealSeen) {
          hide(el, above);
        }
        el.dataset.revealSeen = '1';
      });
    }, { rootMargin: '-10% 0px -8% 0px', threshold: [0, SHOW_RATIO, 0.5] });

    Array.prototype.forEach.call(els, function (el) {
      el.classList.add('reveal');
      if (el.matches(FADE_ONLY)) el.classList.add('reveal-fade');
      // Already on screen at load: show without animating.
      var r = el.getBoundingClientRect();
      if (r.top < fold && r.bottom > 0) el.classList.add('is-visible', 'reveal-instant');
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
