/**
 * PHALITA — ask the chart, by domain.
 *
 * Arrival shows the twenty-five domains. Opening one evaluates only that
 * domain's rows, then renders the result as a reading: a verdict, a lead
 * paragraph, the conditions behind it, and the questions collapsed at the foot.
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
      latitude: Number(q.get('lat') || 26.1445),
      longitude: Number(q.get('lon') || 91.7362),
      timezoneOffsetHours: Number(q.get('tz') || 5.5),
      locationName: 'Guwahati',
      jaiminiScheme: '8_karaka'
    };
  }

  function ensureChart() {
    if (!chart && window.Phalita) chart = window.Phalita.calculateFullJyotishaChart(readQuery());
    return chart;
  }

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Aggregate the ten answers into one verdict for the domain. */
  function verdictOf(items) {
    var pos = 0, neg = 0, fav = 0;
    items.forEach(function (q) {
      pos += q.aScore || 0;
      neg += q.bScore || 0;
      if ((q.aScore || 0) > (q.bScore || 0)) fav += 1;
    });
    var standing = pos > neg * 1.25 ? 'held' : neg > pos * 1.25 ? 'strained' : 'mixed';
    return { standing: standing, pos: pos, neg: neg, favourable: fav, total: items.length };
  }

  var LABEL = { held: 'Held', mixed: 'Mixed', strained: 'Strained' };

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
    if (!items.length) {
      out.innerHTML = '<button class="dback" id="dback">← All domains</button>' +
        '<h2 class="dtitle">' + esc(name) + '</h2>' +
        '<p class="hintline">Nothing in this domain could be read from the chart.</p>';
      bindBack(out);
      return;
    }

    var v = verdictOf(items);

    // Lead paragraph: the strongest answer in the domain, stated as a conclusion.
    var sorted = items.slice().sort(function (a, b) {
      return Math.abs((b.aScore || 0) - (b.bScore || 0)) - Math.abs((a.aScore || 0) - (a.bScore || 0));
    });
    var lead = sorted[0] && sorted[0].answer ? sorted[0].answer : '';

    // Conditions: dedupe across the domain's answers so one planet is not
    // printed ten times.
    var seen = {};
    var facts = [];
    items.forEach(function (q) {
      (q.factors || []).forEach(function (f) {
        var key = f.label + '|' + f.side;
        if (seen[key]) return;
        seen[key] = 1;
        facts.push(f);
      });
    });
    facts = facts.sort(function (a, b) { return (b.weight || 0) - (a.weight || 0); }).slice(0, 8);

    var factRows = facts.map(function (f) {
      return '<li class="fact ' + (f.side === 'a' ? 'pos' : 'neg') + '">' +
        '<span class="flabel">' + esc(f.label) + '</span>' +
        (f.ground ? '<span class="fground">' + esc(f.ground) + '</span>' : '') +
        '</li>';
    }).join('');

    var rows = items.map(function (q) {
      return '<details class="dq">' +
        '<summary>' + esc(q.question) + '</summary>' +
        '<p class="danswer">' + esc(q.answer) + '</p>' +
        '</details>';
    }).join('');

    out.innerHTML =
      '<button class="dback" id="dback">← All domains</button>' +
      '<div class="rep">' +
        '<p class="rkicker">Domain reading</p>' +
        '<h2 class="dtitle">' + esc(name) + '</h2>' +
        '<div class="vband ' + v.standing + '">' +
          '<span class="vpill">' + LABEL[v.standing] + '</span>' +
          '<span class="vmeta">' + v.favourable + ' of ' + v.total + ' read favourable</span>' +
          '<span class="vscore">' + v.pos.toFixed(1) + ' — ' + v.neg.toFixed(1) + '</span>' +
        '</div>' +
        (lead ? '<p class="vlead">' + esc(lead) + '</p>' : '') +
        (factRows ? '<p class="fhead">What the chart shows</p><ul class="facts">' + factRows + '</ul>' : '') +
        '<details class="qsec"><summary>All ' + items.length + ' questions in this domain</summary>' +
          '<div class="dlist">' + rows + '</div></details>' +
      '</div>';

    bindBack(out);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindBack(out) {
    var back = document.getElementById('dback');
    if (back) back.addEventListener('click', function () { domains(out); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var out = document.getElementById('qout');
    if (!out) return;
    domains(out);
    out.addEventListener('click', function (e) {
      var tile = e.target.closest('.dtile');
      if (tile) domain(tile.getAttribute('data-d'), out);
    });
    var pre = new URLSearchParams(window.location.search).get('domain');
    if (pre) domain(pre, out);
  });
})();
