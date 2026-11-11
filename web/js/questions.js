/**
 * PHALITA — ask the chart.
 *
 * Nothing is rendered until someone types. The 250-question catalogue is built
 * once, lazily, on the first keystroke, then filtered. Showing the whole list
 * made the page read as a quiz.
 */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var MAX = 8;
  var cache = null;

  function readQuery() {
    var q = new URLSearchParams(window.location.search);
    var d = String(q.get('date') || '1990-08-15').split('-').map(Number);
    var t = String(q.get('time') || '06:45').split(':').map(Number);
    return {
      year: d[0], month: d[1], day: d[2],
      hour: t[0], minute: t[1], second: 0,
      latitude: Number(q.get('lat') || 26.1844),
      longitude: Number(q.get('lon') || 91.7458),
      timezoneOffsetHours: Number(q.get('tz') || 5.5),
      locationName: '—',
      jaiminiScheme: '8_karaka'
    };
  }

  function catalogue() {
    if (cache) return cache;
    if (!window.Phalita) return [];
    var chart = window.Phalita.calculateFullJyotishaChart(readQuery());
    cache = window.Phalita.buildCatalogue(chart);
    return cache;
  }

  function card(q) {
    var factors = (q.factors || []).slice(0, 4).map(function (f) {
      return '<li class="' + (f.side === 'a' ? 'pos' : 'neg') + '">' + esc(f.label) + '</li>';
    }).join('');

    return '<article class="acard-q">' +
      '<p class="qk">' + esc(q.domain) + '</p>' +
      '<p class="qq">' + esc(q.question) + '</p>' +
      '<p class="qa">' + esc(q.answer) + '</p>' +
      (factors ? '<ul class="qf">' + factors + '</ul>' : '') +
      '</article>';
  }

  function search(term, out) {
    var needle = term.trim().toLowerCase();
    if (needle.length < 2) {
      out.innerHTML = '<p class="hintline">Two letters is enough to start.</p>';
      return;
    }

    var items = catalogue();
    if (!items.length) {
      out.innerHTML = '<p class="hintline">The engine has not loaded.</p>';
      return;
    }

    var hits = items.filter(function (q) {
      return q.question.toLowerCase().indexOf(needle) !== -1 ||
             q.domain.toLowerCase().indexOf(needle) !== -1;
    });

    if (!hits.length) {
      out.innerHTML = '<p class="hintline">Nothing in the catalogue matches “' + esc(term) + '”. Try marriage, money, career, health.</p>';
      return;
    }

    out.innerHTML = '<p class="hintline">' + hits.length + ' answer' + (hits.length === 1 ? '' : 's') +
      (hits.length > MAX ? ', showing the first ' + MAX : '') + '</p>' +
      hits.slice(0, MAX).map(card).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('askinput');
    var out = document.getElementById('qout');
    var sugg = document.getElementById('sugg');
    var form = document.getElementById('askform');
    if (!input || !out) return;

    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { search(input.value, out); }, 140);
    });

    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      search(input.value, out);
    });

    if (sugg) sugg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]');
      if (!b) return;
      input.value = b.getAttribute('data-q');
      search(input.value, out);
      input.focus();
    });
  });
})();
