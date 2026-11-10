'use client';

/**
 * PHALITA — Event Timing & Life-Period Analysis
 *
 * A prediction without a period is only half a prediction. This panel assembles
 * the timing evidence for one chart:
 *
 *   1. the running mahā / antar / pratyantar stack, with days remaining;
 *   2. the life-period timeline from birth, with the native's age at each
 *      mahādaśā boundary;
 *   3. the antardaśā transitions inside the coming window;
 *   4. the Saturn, Jupiter and Rāhu ingresses ahead, refined to the day, with
 *      the natal house each one activates (counted from the Moon).
 *
 * Everything here is computed from the calculated chart. Nothing is stored,
 * nothing is guessed, and no date is asserted that the ephemeris did not
 * produce.
 */

import React, { useMemo, useState } from 'react';
import { JyotishaChart, PlanetId, RashiNumber } from '@/lib/jyotisha/types';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { getCurrentActiveDasha, parseDashaDate } from '@/lib/dashas/vimshottari';
import { calculateCurrentTransits } from '@/lib/jyotisha/transits';
import { GRAHA_PROPERTIES, RASHIS } from '@/lib/jyotisha/constants';
import {
  CalendarDays,
  Clock,
  ArrowRight,
  Orbit,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface EventTimingPanelProps {
  chart: JyotishaChart;
  ayanamshaType: AyanamshaType;
}

const DAY = 86400000;
const SLOW_PLANETS: PlanetId[] = ['saturn', 'jupiter', 'rahu'];

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtSpan(ms: number): string {
  const days = Math.max(0, Math.round(ms / DAY));
  if (days < 45) return `${days} days`;
  const months = Math.round(days / 30.44);
  if (months < 24) return `${months} months`;
  const years = (days / 365.2425).toFixed(1);
  return `${years} years`;
}

export function EventTimingPanel({ chart, ayanamshaType }: EventTimingPanelProps) {
  const [now] = useState<Date>(() => new Date());

  const natalMoon = chart.planets.moon.rashiNumber as RashiNumber;
  const natalLagna = chart.lagna.rashiNumber as RashiNumber;

  const birth = chart.meta.birthDetails;
  const birthTs = useMemo(
    () =>
      new Date(
        birth.year,
        birth.month - 1,
        birth.day,
        birth.hour,
        birth.minute,
        birth.second
      ).getTime(),
    [birth]
  );

  // ---- 1. Running daśā stack ------------------------------------------------
  const active = useMemo(
    () => getCurrentActiveDasha(chart.vimshottari.tree, now),
    [chart.vimshottari.tree, now]
  );

  // ---- 2. Life-period timeline ---------------------------------------------
  const timeline = useMemo(() => {
    const ageAt = (ts: number) => ((ts - birthTs) / (365.2425 * DAY)).toFixed(1);
    return chart.vimshottari.tree.map((p) => {
      const start = parseDashaDate(p.startDate);
      const end = parseDashaDate(p.endDate);
      return {
        lord: p.lord,
        lordName: p.lordName,
        start,
        end,
        ageStart: ageAt(start),
        ageEnd: ageAt(end),
        isCurrent: now.getTime() >= start && now.getTime() < end,
        isPast: now.getTime() >= end,
      };
    });
  }, [chart.vimshottari.tree, now, birthTs]);

  // ---- 3. Antardaśā transitions ahead --------------------------------------
  const transitions = useMemo(() => {
    const horizon = now.getTime() + 24 * 30.44 * DAY;
    const out: Array<{ maha: string; lord: string; start: number; end: number }> = [];
    for (const maha of chart.vimshottari.tree) {
      const subs = maha.subPeriods ?? [];
      for (const antar of subs) {
        const start = parseDashaDate(antar.startDate);
        const end = parseDashaDate(antar.endDate);
        if (start > now.getTime() && start <= horizon) {
          out.push({ maha: maha.lordName, lord: antar.lordName, start, end });
        }
      }
    }
    return out.sort((a, b) => a.start - b.start).slice(0, 8);
  }, [chart.vimshottari.tree, now]);

  // ---- 4. Slow-planet ingresses ahead --------------------------------------
  const ingresses = useMemo(() => {
    const rashiOn = (ts: number, planet: PlanetId): number => {
      const t = calculateCurrentTransits(natalMoon, natalLagna, ayanamshaType, new Date(ts));
      const p = t.planets.find((x) => x.id === planet);
      return p ? p.transitRashi : 0;
    };

    const horizonDays = 18 * 30.44;
    const step = 4;
    const out: Array<{
      planet: PlanetId;
      name: string;
      date: number;
      fromRashi: number;
      toRashi: number;
      houseFromMoon: number;
      houseFromLagna: number;
    }> = [];

    for (const planet of SLOW_PLANETS) {
      let prevTs = now.getTime();
      let prevRashi = rashiOn(prevTs, planet);
      for (let d = step; d <= horizonDays; d += step) {
        const ts = now.getTime() + d * DAY;
        const rashi = rashiOn(ts, planet);
        if (rashi !== prevRashi) {
          // Bisect to the day.
          let lo = prevTs;
          let hi = ts;
          for (let i = 0; i < 12; i++) {
            const mid = (lo + hi) / 2;
            if (rashiOn(mid, planet) === prevRashi) lo = mid;
            else hi = mid;
          }
          out.push({
            planet,
            name: GRAHA_PROPERTIES[planet]?.name ?? planet,
            date: hi,
            fromRashi: prevRashi,
            toRashi: rashi,
            houseFromMoon: ((rashi - natalMoon + 12) % 12) + 1,
            houseFromLagna: ((rashi - natalLagna + 12) % 12) + 1,
          });
          prevRashi = rashi;
        }
        prevTs = ts;
      }
    }
    return out.sort((a, b) => a.date - b.date).slice(0, 8);
  }, [natalMoon, natalLagna, ayanamshaType, now]);

  const sadeSati = useMemo(
    () => calculateCurrentTransits(natalMoon, natalLagna, ayanamshaType, now).sadeSati,
    [natalMoon, natalLagna, ayanamshaType, now]
  );

  const stack = active
    ? [
        { level: 'Mahādaśā', period: active.mahadasha },
        { level: 'Antardaśā', period: active.antardasha },
        { level: 'Pratyantardaśā', period: active.pratyantardasha },
      ]
    : [];

  return (
    <div id="event-timing-panel" className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight">
            Event Timing &amp; Life-Period Analysis
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            काल विचार
          </span>
        </div>
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-3xl">
          A window, never a date. The daśā stack says what the chart is capable of now; the
          ingresses say when the environment changes. Read them together, and read the domain
          section for what the period is capable of producing.
        </p>
      </div>

      {/* Running stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {stack.length === 0 && (
          <div className="lg:col-span-3 p-6 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
            The daśā tree does not cover today’s date. Check the birth data.
          </div>
        )}
        {stack.map(({ level, period }) => {
          const end = parseDashaDate(period.endDate);
          const start = parseDashaDate(period.startDate);
          const remaining = end - now.getTime();
          const total = end - start;
          const pct = total > 0 ? Math.min(100, Math.max(0, ((now.getTime() - start) / total) * 100)) : 0;
          return (
            <div key={level} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  {level}
                </span>
                <Clock className="w-3.5 h-3.5 text-[#8C2D19]" />
              </div>
              <div className="mt-1 font-serif font-bold text-xl text-slate-900">
                {period.lordName}
              </div>
              <div className="mt-1 text-[11px] font-mono text-slate-500">
                {fmtDate(start)} → {fmtDate(end)}
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#8C2D19]" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                {remaining > 0 ? `${fmtSpan(remaining)} remaining` : 'Period complete'}
              </div>
            </div>
          );
        })}
      </div>

      {active?.isSandhiActive && active.sandhiDetails && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Daśā sandhi active.</span>{' '}
            {active.sandhiDetails.warning}
          </div>
        </div>
      )}

      {/* Timeline + transitions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#8C2D19]" />
            <h3 className="text-sm font-serif font-bold text-slate-900">Life-period timeline</h3>
            <span className="ml-auto text-[10px] font-mono text-slate-400">Viṃśottarī</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {timeline.map((row, i) => (
              <li
                key={i}
                className={`px-5 py-2.5 flex items-center justify-between gap-3 text-xs ${
                  row.isCurrent ? 'bg-amber-50/60' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      row.isCurrent ? 'bg-[#8C2D19]' : row.isPast ? 'bg-slate-300' : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      row.isCurrent ? 'text-[#8C2D19]' : row.isPast ? 'text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {row.lordName}
                  </span>
                  {row.isCurrent && (
                    <span className="text-[9px] font-mono uppercase tracking-wider bg-[#8C2D19] text-white px-1.5 py-0.5 rounded">
                      running
                    </span>
                  )}
                </div>
                <div className="text-right font-mono text-[10.5px] text-slate-500 shrink-0">
                  <div>
                    {fmtDate(row.start)} → {fmtDate(row.end)}
                  </div>
                  <div className="text-slate-400">
                    age {row.ageStart}–{row.ageEnd}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[#8C2D19]" />
              <h3 className="text-sm font-serif font-bold text-slate-900">
                Antardaśā transitions ahead
              </h3>
              <span className="ml-auto text-[10px] font-mono text-slate-400">next 24 months</span>
            </div>
            {transitions.length === 0 ? (
              <p className="px-5 py-4 text-xs text-slate-500">
                No antardaśā change falls inside the next 24 months.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {transitions.map((t, i) => (
                  <li key={i} className="px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-800">
                      <span className="font-semibold">{t.maha}</span>
                      <span className="text-slate-400 mx-1">›</span>
                      <span className="font-semibold text-[#8C2D19]">{t.lord}</span>
                    </span>
                    <span className="font-mono text-[10.5px] text-slate-500 shrink-0">
                      {fmtDate(t.start)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Orbit className="w-4 h-4 text-[#8C2D19]" />
              <h3 className="text-sm font-serif font-bold text-slate-900">Transit gates ahead</h3>
              <span className="ml-auto text-[10px] font-mono text-slate-400">next 18 months</span>
            </div>
            {ingresses.length === 0 ? (
              <p className="px-5 py-4 text-xs text-slate-500">
                Saturn, Jupiter and Rāhu stay in their current signs for the whole window.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {ingresses.map((g, i) => (
                  <li key={i} className="px-5 py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-800">
                        <span className="font-semibold">{g.name}</span> enters{' '}
                        <span className="font-serif text-[#8C2D19]">
                          {RASHIS[g.toRashi as RashiNumber]?.name ?? `rāśi ${g.toRashi}`}
                        </span>
                      </span>
                      <span className="font-mono text-[10.5px] text-slate-500 shrink-0">
                        {fmtDate(g.date)}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      house {g.houseFromMoon} from the Moon, {g.houseFromLagna} from the lagna
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Sade sati */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex items-start gap-2.5">
        {sadeSati.isActive ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold">Śani Sāḍhē Sātī: </span>
          {sadeSati.phase}
          {sadeSati.isActive && ` — ${sadeSati.dhairyaDescription}`}
          {sadeSati.ashtamaShani && ' Aṣṭama Śani is also running.'}
          {sadeSati.kantakaShani && ' Kaṇṭaka Śani is also running.'}
        </div>
      </div>

      <div className="flex items-start gap-2 px-1 text-[11px] text-slate-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          Ingress dates are found by bisection on the computed sidereal longitude and are accurate
          to the day. Daśā boundaries follow the year length used in the calculation and can shift by
          a day or two against other implementations.
        </p>
      </div>
    </div>
  );
}
