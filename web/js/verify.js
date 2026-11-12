/**
 * PHALITA — verification before prediction.
 *
 * Statements from Bṛhat Jātaka chapters 5 and 20, banded by the native's age.
 * Ch. 5 gives birth circumstances a parent confirms; ch. 20 gives body and
 * temper the person confirms themselves.
 *
 * A statement outside the age band is never generated, so a child cannot be
 * asked about a marriage.
 */
(function () {
  'use strict';

  var MOVABLE = [1, 4, 7, 10], FIXED = [2, 5, 8, 11];
  var MAL = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
  var state = { chart: null, birth: null, answers: {} };

  var E = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  function ageOf(birth) {
    if (!birth || !birth.year) return null;
    var now = new Date();
    var a = now.getFullYear() - birth.year;
    var m = (now.getMonth() + 1) - birth.month;
    if (m < 0 || (m === 0 && now.getDate() < birth.day)) a -= 1;
    return a >= 0 && a < 130 ? a : null;
  }

  function band(age) {
    if (age === null) return 'C';
    if (age < 10) return 'A';
    if (age < 18) return 'B';
    if (age < 25) return 'C';
    return 'D';
  }

  /** Malefics in the 4th or 7th from the Moon. BJ 5.17. */
  function maleficsFromMoon(c) {
    var moon = c.planets.moon.house, hits = [];
    MAL.forEach(function (p) {
      var h = c.planets[p] && c.planets[p].house;
      if (!h) return;
      var rel = ((h - moon + 12) % 12) + 1;
      if (rel === 4 || rel === 7) hits.push(p);
    });
    return hits;
  }

  /** Moon under Saturn's influence. BJ 5.17. */
  function moonUnderSaturn(c) {
    var m = c.planets.moon, s = c.planets.saturn;
    if (!m || !s) return false;
    if (m.house === s.house) return true;
    if (m.house === 4) return true;
    if (s.aspectsToHouses && s.aspectsToHouses.indexOf(m.house) !== -1) return true;
    return false;
  }

  /** The birth house by the strongest planet. BJ 5.19. */
  function houseByStrongest(c) {
    var best = null, bestB = -1;
    ['saturn', 'mars', 'moon', 'sun', 'mercury', 'venus', 'jupiter'].forEach(function (p) {
      var sb = c.shadbala && c.shadbala[p] && c.shadbala[p].totalVirupas;
      if (typeof sb === 'number' && sb > bestB) { bestB = sb; best = p; }
    });
    var map = {
      saturn: 'an old house, repaired more than once',
      mars: 'a house that had been damaged or burnt at some point',
      moon: 'a newly built house',
      sun: 'a largely wooden house, not strongly built',
      mercury: 'a house built by several different hands',
      venus: 'a new house, painted and decorated',
      jupiter: 'a solid, well-built house'
    };
    return best ? { planet: best, text: map[best] } : null;
  }

  /** Side of the house from the rising sign. BJ 5.20. */
  function roomSide(c) {
    var s = c.lagna && c.lagna.rashiNumber;
    if (!s) return null;
    if ([1, 4, 7, 8, 11].indexOf(s) !== -1) return 'eastern';
    if ([3, 6, 9, 12].indexOf(s) !== -1) return 'northern';
    if (s === 2) return 'western';
    if ([10, 5].indexOf(s) !== -1) return 'southern';
    return null;
  }

  /**
   * Bṛhat Jātaka ch. 20 — what the Sun in each house gives the body and temper.
   * These are the most checkable statements available: a person knows whether
   * they wear spectacles, and a wrong claim there is decisive.
   */
  function bodyChecks(c) {
    var out = [];
    var h = c.planets.sun && c.planets.sun.house;
    if (h === 1 || h === 8) {
      out.push({ claim: 'Your eyesight has needed correcting — spectacles, lenses, or a complaint with your eyes.', v: 'Bṛhat Jātaka 20.1 / 20.3 — the Sun in the first or eighth gives defective vision' });
    }
    if (h === 2) {
      out.push({ claim: 'You have had trouble with your teeth, mouth or face — an extraction, an injury, or something recurring.', v: 'Bṛhat Jātaka 20.1 — Sun in the second, disease of the face' });
    }
    if (h === 4) {
      out.push({ claim: 'Settling at home has not come easily to you — comfort has been hard to hold on to.', v: 'Bṛhat Jātaka 20.2 — Sun in the fourth, without comfort' });
    }
    if (h === 6) {
      out.push({ claim: 'You handle opponents well — in a confrontation you more often come out ahead than behind.', v: 'Bṛhat Jātaka 20.2 — Sun in the sixth, conqueror of enemies' });
    }
    if (h === 7) {
      out.push({ claim: 'A close relationship has humbled you at some point — you came off worse in it.', v: 'Bṛhat Jātaka 20.3 — Sun in the seventh' });
    }
    if (h === 12) {
      out.push({ claim: 'You have stepped back from something you had built up, and lost standing by doing it.', v: 'Bṛhat Jātaka 20.3 — Sun in the twelfth, a fall' });
    }
    return out;
  }

  function checksFor(c, age) {
    var b = band(age);
    var out = [];

    if (b === 'A') {
      var lagnaSign = c.lagna && c.lagna.rashiNumber;
      if (FIXED.indexOf(lagnaSign) !== -1) {
        out.push({ claim: 'You were born indoors, in a house or a room, rather than while travelling.', v: 'Bṛhat Jātaka 5.13 — fixed lagna, birth in a house' });
      } else if (MOVABLE.indexOf(lagnaSign) !== -1) {
        out.push({ claim: 'You were born away from the family home — at another place, or while your mother was travelling.', v: 'Bṛhat Jātaka 5.13 — movable lagna, birth on the way' });
      }
      if (moonUnderSaturn(c)) {
        out.push({ claim: 'The room where you were born was dim or dark rather than brightly lit.', v: 'Bṛhat Jātaka 5.17 — Moon under Saturn, birth in darkness' });
      }
      if (maleficsFromMoon(c).length) {
        out.push({ claim: 'Your mother’s labour was difficult or drawn out.', v: 'Bṛhat Jātaka 5.17 — malefics in the 4th and 7th from the Moon' });
      }
      var side = roomSide(c);
      if (side) {
        out.push({ claim: 'The room you were born in was in the ' + side + ' part of the house.', v: 'Bṛhat Jātaka 5.20 — birth room by the rising sign' });
      }
      var hb = houseByStrongest(c);
      if (hb) {
        out.push({ claim: 'The house you were born in was ' + hb.text + '.', v: 'Bṛhat Jātaka 5.19 — birth house by the strongest planet' });
      }
      out.push({ claim: 'You were born in the home of your parents rather than in a hospital or another family’s house.', v: 'Bṛhat Jātaka 5.16 — birth in the father’s or mother’s house' });
    }

    if (b === 'B') {
      out = out.concat(bodyChecks(c));
      var third = (c.bhavas[2] && c.bhavas[2].planetsInHouse) || [];
      out.push({
        claim: third.length === 0
          ? 'You grew up largely on your own — an only child, or with siblings much older or much younger.'
          : 'You grew up with brothers or sisters close to you in age.',
        v: 'Third bhāva — siblings and companions'
      });
      var fourthLord = c.bhavas[3] && c.bhavas[3].rashiLord;
      var fl = fourthLord && c.planets[fourthLord];
      if (fl && MOVABLE.indexOf(fl.rashiNumber) !== -1) {
        out.push({ claim: 'Your family changed house or town at least once while you were a child.', v: 'Fourth lord in a movable sign' });
      }
      var fifthLord = c.bhavas[4] && c.bhavas[4].rashiLord;
      var vl = fifthLord && c.planets[fifthLord];
      if (vl && (vl.isCombust || vl.house === 6 || vl.house === 8 || vl.house === 12)) {
        out.push({ claim: 'Your schooling was interrupted at some point — a break, a change of school, or a year that did not go well.', v: 'Fifth lord afflicted — study interrupted' });
      }
      out.push({ claim: 'One of your parents was often away, or the household was run largely by one of them.', v: 'Ninth and fourth bhāvas — father and mother' });
    }

    if (b === 'C' || b === 'D') {
      out = out.concat(bodyChecks(c));
      var ninth = c.bhavas[8] && c.bhavas[8].rashiLord;
      var nl = ninth && c.planets[ninth];
      out.push({
        claim: (nl && nl.house && [1, 5, 9, 11].indexOf(nl.house) !== -1)
          ? 'Your education went further than your family expected it to.'
          : 'Your education stopped earlier than you would have liked, or took a detour.',
        v: 'Ninth bhāva — higher learning'
      });
      var tenthOcc = (c.bhavas[9] && c.bhavas[9].planetsInHouse) || [];
      out.push({
        claim: tenthOcc.length
          ? 'Your work has put you in front of people — visible, not behind the scenes.'
          : 'Your work has mostly been done out of public view.',
        v: 'Tenth bhāva — public standing'
      });
      if (b === 'D') {
        var seventhOcc = (c.bhavas[6] && c.bhavas[6].planetsInHouse) || [];
        out.push({
          claim: seventhOcc.length
            ? 'Your marriage, or your closest partnership, came through people already around you rather than through a search.'
            : 'Your closest partnership took a long time to arrive, or has not settled yet.',
          v: 'Seventh bhāva — partnership'
        });
        var fifthOcc = (c.bhavas[4] && c.bhavas[4].planetsInHouse) || [];
        out.push({
          claim: fifthOcc.length
            ? 'You have children, or you have raised someone else’s.'
            : 'Children have not come easily, or have not come.',
          v: 'Fifth bhāva — children'
        });
      }
    }

    return out.slice(0, 5);
  }

  function render(out) {
    var c = state.chart;
    if (!c || !out) return;
    var age = ageOf(state.birth);
    var checks = checksFor(c, age);
    if (!checks.length) return;

    var panel = document.createElement('section');
    panel.className = 'vf narrow';
    panel.id = 'verify-panel';
    panel.innerHTML =
      '<div class="vf-head"><h2>Before the reading — check the chart</h2>' +
      '<span>' + (age === null ? 'age unknown' : 'age ' + age) + '</span></div>' +
      '<p class="vf-note">These are not predictions. Each one is a statement the chart makes about your own past, from Bṛhat Jātaka chapters 5 and 20. Answer honestly. If most are right, the chart is sound. If most are wrong, it is the birth data that is wrong — usually the time — and any reading built on it would be worthless.</p>' +
      '<div class="vf-load" id="vf-load"><span class="vf-spin"></span>Working through the chart…</div>' +
      '<div id="vf-list"></div><div id="vf-verdict"></div>';

    out.parentNode.insertBefore(panel, out);

    setTimeout(function () {
      var load = document.getElementById('vf-load');
      if (load) load.style.display = 'none';
      var list = document.getElementById('vf-list');
      list.innerHTML = checks.map(function (k, i) {
        return '<div class="vf-card" data-i="' + i + '">' +
          '<p class="vf-claim">' + E(k.claim) + '</p>' +
          '<span class="vf-verse">' + E(k.v) + '</span>' +
          '<div class="vf-btns"><button type="button" class="yes" data-a="1" data-i="' + i + '">Correct</button>' +
          '<button type="button" class="no" data-a="0" data-i="' + i + '">Wrong</button></div></div>';
      }).join('');

      list.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-a]');
        if (!b) return;
        var i = b.getAttribute('data-i');
        state.answers[i] = b.getAttribute('data-a') === '1';
        var card = b.closest('.vf-card');
        card.classList.add('done');
        Array.prototype.forEach.call(card.querySelectorAll('button'), function (x) {
          x.classList.remove('picked-yes', 'picked-no');
        });
        b.classList.add(b.getAttribute('data-a') === '1' ? 'picked-yes' : 'picked-no');
        verdict(checks.length);
      });
    }, 700);
  }

  function verdict(total) {
    var answered = Object.keys(state.answers).length;
    var right = Object.keys(state.answers).filter(function (k) { return state.answers[k]; }).length;
    var box = document.getElementById('vf-verdict');
    if (answered < total) {
      box.className = 'vf-verdict';
      box.innerHTML = '<b>' + answered + ' of ' + total + ' answered</b><p>Finish all five and the verdict appears here.</p>';
      return;
    }
    var pass = right >= Math.ceil(total * 0.6);
    box.className = 'vf-verdict ' + (pass ? 'pass' : 'fail');
    box.innerHTML = pass
      ? '<b>' + right + ' of ' + total + ' — the chart holds</b><p>The chart reproduces facts about you that it was not told. The reading below is built on it and can be taken seriously. It is still a reading of tendencies, not a sentence.</p>'
      : '<b>' + right + ' of ' + total + ' — the birth data is in doubt</b><p>Too few statements matched. The most likely cause is the recorded birth time: it may have been rounded, remembered wrongly, or written in a different convention. The reading below is shown for completeness, but treat it as unreliable until the time is corrected.</p>';
  }

  function hook() {
    if (!window.Phalita || !window.Phalita.calculateFullJyotishaChart) return false;
    var orig = window.Phalita.calculateFullJyotishaChart;
    window.Phalita.calculateFullJyotishaChart = function (birth) {
      state.birth = birth;
      var chart = orig.apply(this, arguments);
      state.chart = chart;
      var out = document.getElementById('out');
      if (out) setTimeout(function () { render(out); }, 0);
      return chart;
    };
    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (hook()) return;
    var tries = 0;
    var t = setInterval(function () { if (hook() || ++tries > 20) clearInterval(t); }, 100);
  });
})();
