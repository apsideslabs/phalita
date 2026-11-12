/**
 * PHALITA — place picker.
 *
 * A real combobox, not a <datalist>: options added after the native dropdown
 * opens do not refresh on Android Chrome.
 *
 * Three sources, in order of reach:
 *   ./cities.json     70k towns worldwide (CI-built)
 *   ./in/<letter>.json 5.5 lakh Indian villages, sharded by first letter
 *   built-in list     ~60 major cities, works with no network at all
 */
(function () {
  'use strict';

  var DATA = [
    'Delhi|India|28.6139|77.2090|5.5','Mumbai|Maharashtra|19.0760|72.8777|5.5',
    'Kolkata|West Bengal|22.5726|88.3639|5.5','Chennai|Tamil Nadu|13.0827|80.2707|5.5',
    'Bengaluru|Karnataka|12.9716|77.5946|5.5','Hyderabad|Telangana|17.3850|78.4867|5.5',
    'Ahmedabad|Gujarat|23.0225|72.5714|5.5','Pune|Maharashtra|18.5204|73.8567|5.5',
    'Jaipur|Rajasthan|26.9124|75.7873|5.5','Lucknow|Uttar Pradesh|26.8467|80.9462|5.5',
    'Kanpur|Uttar Pradesh|26.4499|80.3319|5.5','Nagpur|Maharashtra|21.1458|79.0882|5.5',
    'Indore|Madhya Pradesh|22.7196|75.8577|5.5','Bhopal|Madhya Pradesh|23.2599|77.4126|5.5',
    'Patna|Bihar|25.5941|85.1376|5.5','Varanasi|Uttar Pradesh|25.3176|82.9739|5.5',
    'Guwahati|Assam|26.1445|91.7362|5.5','Silchar|Assam|24.8333|92.7789|5.5',
    'Dibrugarh|Assam|27.4728|94.9120|5.5','Jorhat|Assam|26.7509|94.2037|5.5',
    'Tezpur|Assam|26.6338|92.8000|5.5','Nagaon|Assam|26.3464|92.6840|5.5',
    'Barpeta|Assam|26.3220|91.0044|5.5','Dhubri|Assam|26.0207|89.9747|5.5',
    'Tinsukia|Assam|27.4922|95.3556|5.5','Sivasagar|Assam|26.9826|94.6425|5.5',
    'Shillong|Meghalaya|25.5788|91.8933|5.5','Imphal|Manipur|24.8170|93.9368|5.5',
    'Aizawl|Mizoram|23.7271|92.7176|5.5','Agartala|Tripura|23.8315|91.2868|5.5',
    'Itanagar|Arunachal Pradesh|27.0844|93.6053|5.5','Kohima|Nagaland|25.6751|94.1086|5.5',
    'Gangtok|Sikkim|27.3389|88.6065|5.5','Patna|Bihar|25.5941|85.1376|5.5',
    'Ranchi|Jharkhand|23.3441|85.3096|5.5','Bhubaneswar|Odisha|20.2961|85.8245|5.5',
    'Cuttack|Odisha|20.4625|85.8828|5.5','Raipur|Chhattisgarh|21.2514|81.6296|5.5',
    'Bhopal|Madhya Pradesh|23.2599|77.4126|5.5','Gwalior|Madhya Pradesh|26.2183|78.1828|5.5',
    'Jabalpur|Madhya Pradesh|23.1815|79.9864|5.5','Ujjain|Madhya Pradesh|23.1793|75.7849|5.5',
    'Chandigarh|Chandigarh|30.7333|76.7794|5.5','Amritsar|Punjab|31.6340|74.8723|5.5',
    'Ludhiana|Punjab|30.9010|75.8573|5.5','Patiala|Punjab|30.3398|76.3869|5.5',
    'Dehradun|Uttarakhand|30.3165|78.0322|5.5','Haridwar|Uttarakhand|29.9457|78.1642|5.5',
    'Shimla|Himachal Pradesh|31.1048|77.1734|5.5','Jammu|Jammu and Kashmir|32.7266|74.8570|5.5',
    'Srinagar|Jammu and Kashmir|34.0837|74.7973|5.5','Leh|Ladakh|34.1526|77.5771|5.5',
    'Jaipur|Rajasthan|26.9124|75.7873|5.5','Jodhpur|Rajasthan|26.2389|73.0243|5.5',
    'Udaipur|Rajasthan|24.5854|73.7125|5.5','Ajmer|Rajasthan|26.4499|74.6399|5.5',
    'Kota|Rajasthan|25.2138|75.8648|5.5','Bikaner|Rajasthan|28.0229|73.3119|5.5',
    'Jaisalmer|Rajasthan|26.9157|70.9083|5.5','Ahmedabad|Gujarat|23.0225|72.5714|5.5',
    'Surat|Gujarat|21.1702|72.8311|5.5','Vadodara|Gujarat|22.3072|73.1812|5.5',
    'Rajkot|Gujarat|22.3039|70.8022|5.5','Dwarka|Gujarat|22.2394|68.9678|5.5',
    'Somnath|Gujarat|20.8880|70.4010|5.5','Nashik|Maharashtra|19.9975|73.7898|5.5',
    'Aurangabad|Maharashtra|19.8762|75.3433|5.5','Kolhapur|Maharashtra|16.7050|74.2433|5.5',
    'Shirdi|Maharashtra|19.7645|74.4762|5.5','Tirupati|Andhra Pradesh|13.6288|79.4192|5.5',
    'Visakhapatnam|Andhra Pradesh|17.6868|83.2185|5.5','Vijayawada|Andhra Pradesh|16.5062|80.6480|5.5',
    'Hyderabad|Telangana|17.3850|78.4867|5.5','Warangal|Telangana|17.9689|79.5941|5.5',
    'Bengaluru|Karnataka|12.9716|77.5946|5.5','Mysuru|Karnataka|12.2958|76.6394|5.5',
    'Udupi|Karnataka|13.3409|74.7421|5.5','Hampi|Karnataka|15.3350|76.4600|5.5',
    'Chennai|Tamil Nadu|13.0827|80.2707|5.5','Madurai|Tamil Nadu|9.9252|78.1198|5.5',
    'Rameswaram|Tamil Nadu|9.2876|79.3129|5.5','Kanyakumari|Tamil Nadu|8.0883|77.5385|5.5',
    'Coimbatore|Tamil Nadu|11.0168|76.9558|5.5','Kochi|Kerala|9.9312|76.2673|5.5',
    'Thiruvananthapuram|Kerala|8.5241|76.9366|5.5','Guruvayur|Kerala|10.5940|76.0400|5.5',
    'Kathmandu|Nepal|27.7172|85.3240|5.75','Colombo|Sri Lanka|6.9271|79.8612|5.5',
    'Dhaka|Bangladesh|23.8103|90.4125|6','Karachi|Pakistan|24.8607|67.0011|5',
    'Lahore|Pakistan|31.5204|74.3587|5','Dubai|UAE|25.2048|55.2708|4',
    'Abu Dhabi|UAE|24.4539|54.3773|4','Doha|Qatar|25.2854|51.5310|3',
    'Riyadh|Saudi Arabia|24.7136|46.6753|3','Muscat|Oman|23.5880|58.3829|4',
    'Kuwait City|Kuwait|29.3759|47.9774|3','Singapore|Singapore|1.3521|103.8198|8',
    'Kuala Lumpur|Malaysia|3.1390|101.6869|8','Bangkok|Thailand|13.7563|100.5018|7',
    'Jakarta|Indonesia|-6.2088|106.8456|7','Hong Kong|Hong Kong|22.3193|114.1694|8',
    'Shanghai|China|31.2304|121.4737|8','Beijing|China|39.9042|116.4074|8',
    'Tokyo|Japan|35.6762|139.6503|9','Seoul|South Korea|37.5665|126.9780|9',
    'Sydney|Australia|-33.8688|151.2093|10','Melbourne|Australia|-37.8136|144.9631|10',
    'Auckland|New Zealand|-36.8485|174.7633|12','London|United Kingdom|51.5074|-0.1278|0',
    'Manchester|United Kingdom|53.4808|-2.2426|0','Birmingham|United Kingdom|52.4862|-1.8904|0',
    'Leicester|United Kingdom|52.6369|-1.1398|0','Dublin|Ireland|53.3498|-6.2603|0',
    'Paris|France|48.8566|2.3522|1','Berlin|Germany|52.5200|13.4050|1',
    'Amsterdam|Netherlands|52.3676|4.9041|1','Brussels|Belgium|50.8503|4.3517|1',
    'Zurich|Switzerland|47.3769|8.5417|1','Rome|Italy|41.9028|12.4964|1',
    'Madrid|Spain|40.4168|-3.7038|1','Barcelona|Spain|41.3851|2.1734|1',
    'Lisbon|Portugal|38.7223|-9.1393|0','Stockholm|Sweden|59.3293|18.0686|1',
    'Oslo|Norway|59.9139|10.7522|1','Copenhagen|Denmark|55.6761|12.5683|1',
    'Helsinki|Finland|60.1699|24.9384|2','Moscow|Russia|55.7558|37.6173|3',
    'Istanbul|Turkey|41.0082|28.9784|3','Athens|Greece|37.9838|23.7275|2',
    'Cairo|Egypt|30.0444|31.2357|2','Nairobi|Kenya|-1.2921|36.8219|3',
    'Johannesburg|South Africa|-26.2041|28.0473|2','Lagos|Nigeria|6.5244|3.3792|1',
    'Accra|Ghana|5.6037|-0.1870|0','New York|United States|40.7128|-74.0060|-5',
    'Toronto|Canada|43.6532|-79.3832|-5','Chicago|United States|41.8781|-87.6298|-6',
    'Houston|United States|29.7604|-95.3698|-6','Los Angeles|United States|34.0522|-118.2437|-8',
    'San Francisco|United States|37.7749|-122.4194|-8','Seattle|United States|47.6062|-122.3321|-8',
    'Vancouver|Canada|49.2827|-123.1207|-8','Mexico City|Mexico|19.4326|-99.1332|-6',
    'Sao Paulo|Brazil|-23.5505|-46.6333|-3','Buenos Aires|Argentina|-34.6037|-58.3816|-3',
    'Lima|Peru|-12.0464|-77.0428|-5','Bogota|Colombia|4.7110|-74.0721|-5'
  ];

  function toPlace(c) {
    return { name: c[0], region: c[1] || c[2] || '', lat: c[3], lon: c[4], tz: c[6], pop: c[7] || 0 };
  }

  var PLACES = DATA.map(function (row) {
    var p = row.split('|');
    return { name: p[0], region: p[1], lat: +p[2], lon: +p[3], tz: +p[4], pop: 0 };
  });

  function label(p) { return p.region ? p.name + ', ' + p.region : p.name; }

  var towns = null, townsLoading = null;
  var shards = {}, shardLoading = {};

  function loadTowns() {
    if (townsLoading) return townsLoading;
    townsLoading = fetch('./cities.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (j && Array.isArray(j.cities)) towns = j.cities.map(toPlace); })
      .catch(function () { towns = null; });
    return townsLoading;
  }

  /** Fetch one letter's village shard, once. ~250 KB each. */
  function loadShard(letter) {
    if (!/^[a-z]$/.test(letter)) return Promise.resolve();
    if (shards[letter]) return Promise.resolve();
    if (shardLoading[letter]) return shardLoading[letter];
    shardLoading[letter] = fetch('./in/' + letter + '.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (j && Array.isArray(j.cities)) shards[letter] = j.cities.map(toPlace); })
      .catch(function () { shards[letter] = []; });
    return shardLoading[letter];
  }

  function search(term) {
    var q = term.trim().toLowerCase();
    if (q.length < 2) return [];
    var letter = q.charAt(0);
    var pool = (towns && towns.length ? towns : PLACES).concat(shards[letter] || []);
    var prefix = [], inside = [];
    for (var i = 0; i < pool.length; i++) {
      var p = pool[i];
      if (!p.name) continue;
      var k = p.name.toLowerCase();
      if (k.indexOf(q) === 0) prefix.push(p);
      else if (k.indexOf(q) !== -1) inside.push(p);
    }
    var byPop = function (a, b) { return (b.pop || 0) - (a.pop || 0); };
    return prefix.sort(byPop).slice(0, 6).concat(inside.sort(byPop).slice(0, 2)).slice(0, 8);
  }

  function wire() {
    var input = document.getElementById('place');
    if (!input) return;
    var form = input.form;
    if (!form) return;

    var box = document.createElement('div');
    box.setAttribute('role', 'listbox');
    box.style.cssText = 'position:absolute;left:0;right:0;top:100%;z-index:60;margin-top:4px;' +
      'background:#fff;border:1.5px solid #ddd0bc;border-radius:12px;' +
      'box-shadow:0 8px 24px -8px rgba(60,40,20,.28);display:none;max-height:16rem;overflow-y:auto';
    var host = input.parentNode;
    host.style.position = 'relative';
    host.appendChild(box);

    var items = [], active = -1;
    function close() { box.style.display = 'none'; active = -1; }

    function fill(p) {
      var lat = form.elements.namedItem('lat');
      var lon = form.elements.namedItem('lon');
      var tz = form.elements.namedItem('tz');
      if (lat) lat.value = (+p.lat).toFixed(4);
      if (lon) lon.value = (+p.lon).toFixed(4);
      if (tz) tz.value = p.tz;
      input.value = label(p);
      close();
    }

    function render() {
      if (!items.length) { close(); return; }
      box.innerHTML = items.map(function (p, i) {
        var on = i === active ? 'background:#fdf3e2;' : '';
        var where = p.region ? ', ' + p.region : '';
        return '<div data-i="' + i + '" style="padding:.7rem .9rem;cursor:pointer;' +
          'font-size:.92rem;border-bottom:1px solid #f4ece0;' + on + '">' +
          '<span style="font-weight:600;color:#141414">' + p.name + '</span>' +
          '<span style="color:#9a9a9a">' + where + '</span></div>';
      }).join('');
      box.style.display = 'block';
    }

    function pick(e) {
      var d = e.target.closest('[data-i]');
      if (!d) return;
      e.preventDefault();
      fill(items[+d.getAttribute('data-i')]);
    }
    box.addEventListener('mousedown', pick);
    box.addEventListener('touchstart', pick, { passive: false });

    var timer = null;
    input.addEventListener('focus', function () { loadTowns(); }, { once: true });
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = input.value.trim().toLowerCase();
        if (q.length < 2) { close(); return; }
        items = search(q); active = -1; render();
        // the village shard for this letter may still be arriving
        loadShard(q.charAt(0)).then(function () {
          if (input.value.trim().toLowerCase().charAt(0) !== q.charAt(0)) return;
          items = search(input.value); render();
        });
      }, 80);
    });
    input.addEventListener('keydown', function (e) {
      if (box.style.display === 'none') return;
      if (e.key === 'ArrowDown') { active = Math.min(active + 1, items.length - 1); render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { active = Math.max(active - 1, 0); render(); e.preventDefault(); }
      else if (e.key === 'Enter' && active >= 0) { fill(items[active]); e.preventDefault(); }
      else if (e.key === 'Escape') close();
    });
    input.addEventListener('blur', function () { setTimeout(close, 180); });

    var preset = PLACES.filter(function (p) { return label(p).toLowerCase() === input.value.trim().toLowerCase(); })[0];
    if (preset) fill(preset);
  }

  document.addEventListener('DOMContentLoaded', wire);
})();
