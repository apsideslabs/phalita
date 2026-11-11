/**
 * PHALITA — ask the chart, by domain.
 *
 * Arrival shows the twenty-five domains and nothing else. Opening one evaluates
 * only that domain's rows. The 250-question catalogue is never built whole.
 */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var chart = null;
  var cache = {};

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

  function ensureChart() {
    if (!chart && window.Phalita) chart = window.Phalita.calculateFullJyotishaChart(readQuery());
    return chart;
  }

  /** The domain list. Rendered without touching the engine. */
  function domains(out) {
    var list = (window.Phalita && window.Phalita.DOMAINS) || [];
    var tiles = list.map(function (d, i) {
      return '<button class="dtile" data-d="' + esc(d) + '">' +
        '<span class="dnum">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="dname">' + esc(d) + '</span>' +
        '<span class="dcount">10 questions</span>' +
        '</button>';
    }).join('');

    out.innerHTML = '<p class="dhead">Twenty-five domains</p><div class="dgrid">' + tiles + '</div>';
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** One domain: its ten questions, answer behind a disclosure. */
  function domain(name, out) {
    if (!window.Phalita) {
      out.innerHTML = '<p class="hintline">The engine has not loaded.</p>';
      return;
    }

    if (!cache[name]) {
      out.innerHTML = '<p class="hintline">Reading ' + esc(name) + '…</p>';
      try {
        cache[name] = window.Phalita.buildCatalogue(ensureChart(), name);
      } catch (e) {
        out.innerHTML = '<p class="hintline">Could not read this chart: ' +
          esc(e && e.message ? e.message : e) + '</p>';
        return;
      }
    }

    var items = cache[name] || [];
    var rows = items.map(function (q) {
      var factors = (q.factors || []).slice(0, 4).map(function (f) {
        return '<li class="' + (f.side === 'a' ? 'pos' : 'neg') + '">' + esc(f.label) + '</li>';
      }).join('');
      return '<details class="dq">' +
        '<summary>' + esc(q.question) + '</summary>' +
        '<p class="danswer">' + esc(q.answer) + '</p>' +
        (factors ? '<ul class="qf">' + factors + '</ul>' : '') +
        '</details>';
    }).join('');

    out.innerHTML =
      '<button class="dback" id="dback">← All domains</button>' +
      '<h2 class="dtitle">' + esc(name) + '</h2>' +
      '<p class="dsub">' + items.length + ' questions, answered from this chart</p>' +
      '<div class="dlist">' + rows + '</div>';

    out.scrollIntoView({ behavior: 'smooth', block: 'start' });

    var back = document.getElementById('dback');
    if (back) back.addEventListener('click', function () { domains(out); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var out = document.getElementById('qout');
    if (!out) return;

    domains(out);

    out.addEventListener('click', function (e) {
      var tile = e.target.closest('.dtile');
      if (tile) { domain(tile.getAttribute('data-d'), out); }
    });

    // Deep link: ?domain=Marriage%20and%20romantic%20relationships
    var pre = new URLSearchParams(window.location.search).get('domain');
    if (pre) domain(pre, out);
  });
})();
