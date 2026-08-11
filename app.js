/* Space Race Cannabis — age gate, navigation, catalogue filtering. */
(function () {
  'use strict';

  var root = document.documentElement;
  var gate = document.getElementById('age-gate');
  var main = document.querySelector('main');

  function releasePage() {
    if (main) main.removeAttribute('inert');
  }

  /* ---------------------------------------------------------- age gate */
  if (gate && root.className.indexOf('age-ok') === -1) {
    var select = document.getElementById('age-province');
    var confirm = document.getElementById('age-confirm');
    var note = document.getElementById('age-note');

    select.addEventListener('change', function () {
      var opt = select.options[select.selectedIndex];
      var age = opt && opt.getAttribute('data-age');
      if (age) {
        note.textContent = 'You must be ' + age + ' or older in ' + opt.value + ' to enter this site.';
        confirm.disabled = false;
      } else {
        note.textContent = 'You must be of legal age where you live to enter this site.';
        confirm.disabled = true;
      }
    });

    confirm.addEventListener('click', function () {
      if (confirm.disabled) return;
      try {
        localStorage.setItem('sr-age-verified', 'yes');
        localStorage.setItem('sr-age-province', select.value);
      } catch (e) { /* private mode — gate simply returns next visit */ }
      root.className += ' age-ok';
      releasePage();
      var focusable = document.querySelector('main a, main button');
      if (focusable) focusable.focus();
    });

    // Keep focus inside the gate while it is up.
    gate.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var items = gate.querySelectorAll('select, button:not([disabled]), a[href]');
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    select.focus();
  } else {
    releasePage();
  }

  /* ------------------------------------------------------------- mobile nav */
  var menuButton = document.querySelector('.menu-button');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      if (open) mobileMenu.setAttribute('hidden', ''); else mobileMenu.removeAttribute('hidden');
    });
  }

  /* -------------------------------------------------------- catalogue filter */
  var grid = document.getElementById('catalogue');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.catalogue-card'));
  var count = document.getElementById('result-count');
  var empty = document.getElementById('empty');
  var provinceSelect = document.getElementById('filter-province');
  var strainSelect = document.getElementById('filter-strain');
  var formatButtons = Array.prototype.slice.call(document.querySelectorAll('.format-filters button'));
  var state = { format: 'all', province: 'all', strain: 'all' };

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var okFormat = state.format === 'all' || card.getAttribute('data-format') === state.format;
      var okStrain = state.strain === 'all' || card.getAttribute('data-strain') === state.strain;
      var okProvince = state.province === 'all' ||
        card.getAttribute('data-provinces').split(' ').indexOf(state.province) !== -1;
      var visible = okFormat && okStrain && okProvince;
      if (visible) { card.removeAttribute('hidden'); shown++; } else { card.setAttribute('hidden', ''); }
    });
    count.textContent = shown + (shown === 1 ? ' system found' : ' systems found');
    if (shown === 0) { empty.removeAttribute('hidden'); grid.setAttribute('hidden', ''); }
    else { empty.setAttribute('hidden', ''); grid.removeAttribute('hidden'); }
  }

  formatButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      formatButtons.forEach(function (b) { b.className = ''; });
      button.className = 'active';
      state.format = button.getAttribute('data-format');
      apply();
    });
  });
  provinceSelect.addEventListener('change', function () { state.province = provinceSelect.value; apply(); });
  strainSelect.addEventListener('change', function () { state.strain = strainSelect.value; apply(); });

  var reset = document.getElementById('reset-filters');
  if (reset) {
    reset.addEventListener('click', function () {
      state.province = 'all'; state.strain = 'all';
      provinceSelect.value = 'all'; strainSelect.value = 'all';
      apply();
    });
  }

  // Deep links: /products/?format=pre-rolls and /products/?province=ON
  var params = new URLSearchParams(window.location.search);
  var qFormat = params.get('format');
  var qProvince = params.get('province');
  if (qFormat) {
    formatButtons.forEach(function (b) {
      if (b.getAttribute('data-format') === qFormat) {
        formatButtons.forEach(function (x) { x.className = ''; });
        b.className = 'active';
        state.format = qFormat;
      }
    });
  }
  if (qProvince && provinceSelect.querySelector('option[value="' + qProvince + '"]')) {
    provinceSelect.value = qProvince;
    state.province = qProvince;
  }
  if (qFormat || qProvince) apply();
})();
