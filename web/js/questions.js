/**
 * PHALITA — the question catalogue, on its own page.
 *
 * Built once, on arrival, for the chart in the query string. Nothing here runs
 * on the reading page: the 250 answers used to be produced for every visitor
 * whether they wanted them or not.
 */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var FIELDS = ['date', 'time', 'lat', 'lon', 'tz'];

  function readQuery() {
    var q = new URLSearchParams(window.location.search);
    var dparts = String(q.get('date') || '1990-08-15').split('-').map(Number);
    var tparts = String(q.get('time') || '06:45').split(':').map(Number);
    return {
      year: dparts[0], month: dparts[1], day: dparts[2],
      hour: tparts[0], minute: tparts[1], second: 0,
      latitude: Number(q.get('lat') || 26.1844),
      longitude: Number(q.get('lon') || 91.7458),
      timezoneOffsetHours: Number(q.get('tz') || 5.5),
      locationName: '—',
      jaiminiScheme: '8_karaka'
    };
  }

  function render(items) {
    var groups = {};
    items.forEach(function (q) {
      (groups[q.domain] = groups[q.domain] || []).push(q);
    });

    var blocks = Object.keys(groups).map(function (d) {
      var rows = groups[d].map(function (q) {
        return '<details class="q" data-t="' + esc(q.question.toLowerCase()) + '">' +
          '<summary>' + esc(q.question) + '</summary>' +
          '<p>' + esc(q.answer) + '</p>' +
          (q.factors && q.factors.length
            ? '<ul class="qf">' + q.factors.map(function (f) {
                return '<li class="' + (f.side === 'a' ? 'pos' : 'neg') + '">' + esc(f.label) + '</li>';
              }).join('') + '</ul>'
            : '') +
          '</details>';
      }).join('');
      return '<div class="qgroup"><p class="qdomain">' + esc(d) + '</p>' + rows + '</div>';
    }).join('');

    return '<input class="qfilter" type="search" placeholder="Search ' + items.length + ' questions…" />' +
      '<div class="qlist">' + blocks + '</div>';
  }

  function wire(input, root) {
    input.addEventListener('input', function () {
      var needle = input.value.trim().toLowerCase();
      Array.prototype.forEach.call(root.querySelectorAll('details.q'), function (el) {
        var t = el.getAttribute('data-t') || '';
        el.style.display = !needle || t.indexOf(needle) !== -1 ? '' : 'none';
      });
      Array.prototype.forEach.call(root.querySelectorAll('.qgroup'), function (g) {
        var any = Array.prototype.some.call(g.querySelectorAll('details.q'), function (el) {
          return el.style.display !== 'none';
        });
        g.style.display = any ? '' : 'none';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var out = document.getElementById('qout');
    if (!out) return;

    if (!window.Phalita) {
      out.innerHTML = '<p class="quiet">The engine has not loaded.</p>';
      return;
    }

    try {
      var chart = window.Phalita.calculateFullJyotishaChart(readQuery());
      var items = window.Phalita.buildCatalogue(chart);
      out.innerHTML = render(items);
      var input = out.querySelector('.qfilter');
      if (input) wire(input, out);
    } catch (e) {
      out.innerHTML = '<p class="quiet">Could not read this chart: ' +
        esc(e && e.message ? e.message : e) + '</p>';
    }
  });
})();
