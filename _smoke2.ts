import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
import { getCurrentActiveDasha, parseDashaDate } from './lib/dashas/vimshottari';
import { calculateCurrentTransits } from './lib/jyotisha/transits';
import { PHALITA_SECTIONS, getSection } from './lib/phalita/sections';

const chart: any = calculateFullJyotishaChart({
  year: 2009, month: 3, day: 3, hour: 23, minute: 51, second: 0,
  latitude: 26.637102, longitude: 91.19171, timezoneOffsetHours: 5.5,
  locationName: 'Baghmara, Assam', jaiminiScheme: '8_karaka',
} as any);

const now = new Date();
const active: any = getCurrentActiveDasha(chart.vimshottari.tree, now);
console.log('ACTIVE STACK:', active?.mahadasha?.lordName, '>', active?.antardasha?.lordName, '>', active?.pratyantardasha?.lordName);
console.log('antar ends:', active?.antardasha?.endDate);

// timeline sanity
const tree = chart.vimshottari.tree;
console.log('mahadashas:', tree.length, '| first:', tree[0].lordName, tree[0].startDate, '| last ends:', tree[tree.length-1].endDate);

// ingress detection (same algorithm as the panel)
const natalMoon = chart.planets.moon.rashiNumber, natalLagna = chart.lagna.rashiNumber;
const rashiOn = (ts: number, planet: any) => {
  const t = calculateCurrentTransits(natalMoon, natalLagna, 'lahiri', new Date(ts));
  return t.planets.find((x:any) => x.id === planet)!.transitRashi;
};
let found = 0;
for (const planet of ['saturn','jupiter','rahu']) {
  let prev = rashiOn(now.getTime(), planet);
  for (let d = 4; d <= 548; d += 4) {
    const ts = now.getTime() + d*86400000;
    const r = rashiOn(ts, planet);
    if (r !== prev) { console.log(`INGRESS ${planet}: rashi ${prev} -> ${r} near ${new Date(ts).toISOString().slice(0,10)}`); prev = r; found++; break; }
  }
}
console.log('ingresses found:', found);

// section wiring
console.log('sections:', PHALITA_SECTIONS.length, '| slugs:', PHALITA_SECTIONS.map(s=>s.slug).join(','));
const career = getSection('career')!;
console.log('career -> tab', career.workspaceTab, '| domains', career.domainIds.join(','));

// the crash that was fixed
const seventh = chart.bhavas[6];
console.log('7th bhava:', seventh.rashiNumber, seventh.rashiLord, '| houses key present?', 'houses' in chart);
console.log('planets carry latitude?', typeof chart.planets.saturn.latitude, chart.planets.saturn.latitude);
