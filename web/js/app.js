/**
 * PHALITA — the reading page. Vanilla JS, no dependencies.
 *
 * The reading is the reading: masthead, period shifts, ten chapter cards, the
 * verse sections. The 250-question catalogue is not built here — it lives on
 * questions.html and runs only when someone asks for it.
 */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var DAY = 86400000;
  var TAG = { strong: 'Held', mixed: 'Mixed', strained: 'Strained' };

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

  function shifts(chart) {
    var P = window.Phalita;
    var tree = (chart.vimshottari && chart.vimshottari.tree) || [];
    var now = Date.now();
    var upcoming = [];

    tree.forEach(function (maha) {
      (maha.subPeriods || []).forEach(function (sub) {
        var t = new Date(sub.startDate).getTime();
        if (!isNaN(t) && t > now) upcoming.push({ maha: maha, sub: sub, t: t });
      });
    });
    upcoming.sort(function (a, b) { return a.t - b.t; });
    upcoming = upcoming.slice(0, 4);
    if (!upcoming.length) return '';

    var items = upcoming.map(function (u) {
      var days = Math.round((u.t - now) / DAY);
      var tone = days <= 7 ? 'orange' : days <= 30 ? 'blue' : 'grey';
      var when = days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
      var date = new Date(u.t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      var phala = '';
      try {
        var d = P.buildDashaPhala(chart, new Date(u.t));
        phala = d && d.statement ? d.statement.phala : (d && d.unstated) || '';
      } catch (e) { phala = ''; }

      return '<li class="tl-item">' +
        '<span class="ring ' + tone + '"></span>' +
        '<div class="tl-body">' +
          '<div class="tl-meta"><span class="pill ' + tone + '">' + esc(when) + '</span>' +
          '<span class="tl-date">' + esc(date) + '</span></div>' +
          '<b>' + esc(u.sub.lordName) + ' antardaśā begins</b>' +
          (phala ? '<p>' + esc(phala) + '</p>' : '') +
        '</div></li>';
    }).join('');

    return '<section class="shifts"><div class="narrow">' +
      '<h2>Period shifts</h2>' +
      '<p class="cardsub">Upcoming antardaśā, read from Phaladīpikā 19</p>' +
      '<ul class="tl">' + items + '</ul>' +
      '<a class="tl-cta" href="#verses">View the daśā phala below</a>' +
      '</div></section>';
  }

  /** One chapter, as a collapsible card. */
  function chapter(c) {
    var gives = (c.gives || []).map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('');
    var costs = (c.costs || []).map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('');

    return '<details class="ch ' + c.standing + '"' + (c.open ? ' open' : '') + '>' +
      '<summary class="ch-head">' +
        '<span class="disc"><span class="emoji">' + esc(c.emoji) + '</span></span>' +
        '<div class="ch-title"><h2>' + esc(c.title) + '</h2>' +
          '<p class="strap">' + esc(c.strap) + '</p></div>' +
        '<span class="tag ' + c.standing + '">' + (TAG[c.standing] || '') + '</span>' +
      '</summary>' +
      '<div class="ch-body">' +
      '<p class="ch-lead">' + esc(c.lead) + '</p>' +
      (gives ? '<div class="grp good"><span class="glabel">What it gives</span><ul>' + gives + '</ul></div>' : '') +
      (costs ? '<div class="grp bad"><span class="glabel">What it costs</span><ul>' + costs + '</ul></div>' : '') +
      (c.when ? '<div class="when"><span class="ric">⏳</span><div><span class="rlabel">Most active</span><b>' + esc(c.when) + '</b></div></div>' : '') +
      '<p class="ch-advice">' + esc(c.advice) + '</p>' +
      '</div></details>';
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

  function query(b) {
    return 'date=' + encodeURIComponent(
      String(b.year).padStart(4, '0') + '-' + String(b.month).padStart(2, '0') + '-' + String(b.day).padStart(2, '0')
    ) + '&time=' + encodeURIComponent(
      String(b.hour).padStart(2, '0') + ':' + String(b.minute).padStart(2, '0')
    ) + '&lat=' + b.latitude + '&lon=' + b.longitude + '&tz=' + b.timezoneOffsetHours;
  }

  var FIELDS = ['date', 'time', 'lat', 'lon', 'tz'];

  function prefill(form) {
    var q = new URLSearchParams(window.location.search);
    var touched = false;
    FIELDS.forEach(function (name) {
      var v = q.get(name);
      var el = form.elements.namedItem(name);
      if (v && el) { el.value = v; touched = true; }
    });
    return touched;
  }

  function draw(chart, birth, out) {
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

    html += shifts(chart);

    html += '<div class="narrow chapters">' +
      P.buildNarrative(chart).map(function (c, i) {
        c.open = i === 0;
        return chapter(c);
      }).join('') +
      '</div>';

    html += '<div class="narrow verses-wrap" id="verses"><p class="kicker">From the verses</p>' +
      reading.sections.filter(function (s) { return s.id !== 'gochara'; }).map(section).join('') +
      '</div>';

    html += '<div class="narrow more">' +
      '<a class="tl-cta" href="./questions.html?' + query(birth) + '">Answer every question about this chart →</a>' +
      '<p class="more-note">250 questions across 25 domains. Built only if you open it.</p>' +
      '</div>';

    out.innerHTML = html;
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
      var birth = readForm(form);
      out.innerHTML = '<div class="narrow"><p class="quiet">Reading…</p></div>';
      try {
        draw(window.Phalita.calculateFullJyotishaChart(birth), birth, out);
      } catch (e) {
        out.innerHTML = '<div class="narrow"><p class="quiet">Could not read this chart: ' + esc(e && e.message ? e.message : e) + '</p></div>';
      }
    };

    var fromHome = prefill(form);
    form.addEventListener('submit', function (ev) { ev.preventDefault(); run(); });
    run();

    if (fromHome) {
      var target = out.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  });
})();
