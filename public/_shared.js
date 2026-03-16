// Language switcher
(function() {
  var LANG_KEY = 'jungle_lang';
  var lang = localStorage.getItem(LANG_KEY) || 'pl';

  function applyLang(l) {
    lang = l;
    localStorage.setItem(LANG_KEY, l);
    document.querySelectorAll('[data-lang]').forEach(function(el) {
      el.classList.toggle('lang-visible', el.dataset.lang === l);
    });
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.set === l);
    });
    // Update nav links to keep lang param
    document.querySelectorAll('.nav-links a, .footer-links a').forEach(function(a) {
      var href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      // strip existing ?lang
      href = href.split('?')[0];
      a.setAttribute('href', href);
    });
  }

  window.setLang = function(l) { applyLang(l); };

  document.addEventListener('DOMContentLoaded', function() {
    applyLang(lang);
  });
})();

// Scroll reveal
document.addEventListener('DOMContentLoaded', function() {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e, i) {
      if (e.isIntersecting) {
        setTimeout(function() { e.target.classList.add('in'); }, i * 55);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });
});
