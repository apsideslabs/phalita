/**
 * PHALITA — the reading page. Vanilla JS, no dependencies.
 *
 * Reads the form, calls the bundled engine on window.Phalita, and renders the
 * reading as HTML strings. Each renderer is a small function; nothing here
 * knows about a framework.
 */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  function masthead(m) {
    var antar = m.antar ? ', with ' + esc(m.antar) + ' inside it' : '';
    return '<section class="rd-mast"><div class="narrow">' +
      '<p class="kicker">फल · the reading</p>' +
      '<h1>' + esc(m.rashi) + ' · ' + esc(m.nakshatra) + '</h1>' +
      '<p class="sub">janma rāśi, read from Phaladīpikā</p>' +
      '<p class="dasha">' + esc(m.dasha) + ' runs from ' + esc(m.start) +
      ' to ' + esc(m.end) + antar + '. ' + esc(m.note) + '</p>' +
      '</div></section>';
  }

  function chapter(c) {
    var paras = c.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    return '<section class="chapter ' + c.standing + '">' +
      '<h2>' + esc(c.title) + '</h2>' +
      '<p class="strap">' + esc(c.strap) + '</p>' +
      '<div class="body">' + paras + '</div></section>';
  }

  function verse(s) {
    if (!s.citation || !s.citation.mula) return '';
    return '<details class="verse"><summary>' + esc(s.citation.short) + '</summary>' +
      '<p class="mula">' + esc(s.citation.mula) + '</p>' +
      '<p class="ref">' + esc(s.citation.sourceTitle) + ' · ' +
      esc(s.citation.adhyaya) + '.' + esc(s.citation.shloka) + '</p></details>';
  }

  function section(sec) {
    var body = sec.statements.length
      ? sec.statements.map(function (s) {
          return '<div class="statement"><p>' + esc(s.phala) + '</p>' + verse(s) + '</div>';
        }).join('')
      : '<p class="quiet">' + esc(sec.note || 'Nothing in the text applied to this chart.') + '</p>';
    return '<section class="verses"><h2>' + esc(sec.title) + '</h2>' + body + '</section>';
  }

  function catalogue(items) {
    var groups = {};
    items.forEach(function (q) {
      (groups[q.domain] = groups[q.domain] || []).push(q);
    });
    var blocks = Object.keys(groups).map(function (d) {
      var rows = groups[d].map(function (q) {
        return '<details class="q" data-t="' + esc(q.question.toLowerCase()) + '">' +
          '<summary>' + esc(q.question) + '</summary><p>' + esc(q.answer) + '</p></details>';
      }).join('');
      return '<div class="qgroup"><p class="qdomain">' + esc(d) + '</p>' + rows + '</div>';
    }).join('');
    return '<details class="cat"><summary>All ' + items.length +
      ' questions, answered from this chart</summary>' +
      '<input class="qfilter" type="search" placeholder="Search the questions…" />' +
      '<div class="qlist">' + blocks + '</div></details>';
  }

  function wireFilter(root) {
    var input = root.querySelector('.qfilter');
    if (!input) return;
    input.addEventListener('input', function () {
      var needle = input.value.trim().toLowerCase();
      Array.prototype.forEach.call(root.querySelectorAll('details.q'), function (el) {
        var t = el.getAttribute('data-t') || '';
        el.style.display = !needle || t.indexOf(needle) !== -1 ? '' : 'none';
      });
    });
  }

  function readForm(form) {
    var f = new FormData(form);
    var dparts = String(f.get('date')).split('-').map(Number);
    var tparts = String(f.get('time')).split(':').map(Number);
    return {
      year: dparts[0], month: dparts[1], day: dparts[2],
      hour: tparts[0], minute: tparts[1], second: 0,
      latitude: Number(f.get('lat')),
      longitude: Number(f.get('lon')),
      timezoneOffsetHours: Number(f.get('tz')),
      locationName: '—',
      jaiminiScheme: '8_karaka'
    };
  }

  function draw(chart, out) {
    var P = window.Phalita;
    var now = new Date();
    var d = P.buildDashaPhala(chart, now);
    var reading = P.buildReading(chart, now, 'lahiri');

    var html = masthead({
      rashi: chart.planets.moon.rashiName,
      nakshatra: chart.planets.moon.nakshatraName,
      dasha: d.mahadasha.name,
      start: d.mahadasha.start,
      end: d.mahadasha.end,
      antar: d.antardasha && d.antardasha.name,
      note: d.strength.note
    });

    html += '<div class="narrow">' +
      P.buildNarrative(chart).map(chapter).join('') +
      '</div>';

    html += '<div class="narrow verses-wrap"><p class="kicker">From the verses</p>' +
      reading.sections.filter(function (s) { return s.id !== 'gochara'; }).map(section).join('') +
      '</div>';

    html += '<div class="narrow">' + catalogue(P.buildCatalogue(chart)) + '</div>';

    out.innerHTML = html;
    wireFilter(out);
    window.scrollTo({ top: out.offsetTop - 20, behavior: 'smooth' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('birth');
    var out = document.getElementById('out');
    if (!form || !out) return;

    var run = function () {
      if (!window.Phalita) {
        out.innerHTML = '<div class="narrow"><p class="quiet">The engine has not loaded. Check that js/engine.js was built.</p></div>';
        return;
      }
      out.innerHTML = '<div class="narrow"><p class="quiet">Reading…</p></div>';
      try {
        draw(window.Phalita.calculateFullJyotishaChart(readForm(form)), out);
      } catch (e) {
        out.innerHTML = '<div class="narrow"><p class="quiet">Could not read this chart: ' + esc(e && e.message ? e.message : e) + '</p></div>';
      }
    };

    form.addEventListener('submit', function (ev) { ev.preventDefault(); run(); });
    run();
  });
})();
