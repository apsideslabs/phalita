/**
 * PHALITA — place picker.
 *
 * Typing latitude and longitude is a developer's form. This fills them from a
 * city name and leaves the manual fields for anywhere not listed.
 *
 * Format: Name|Region|lat|lon|utcOffset
 * Offsets are standard time — India has no DST, some countries do.
 */
(function () {
  'use strict';

  var DATA = [
    'Delhi|India|28.6139|77.2090|5.5',
    'Mumbai|Maharashtra|19.0760|72.8777|5.5',
    'Kolkata|West Bengal|22.5726|88.3639|5.5',
    'Chennai|Tamil Nadu|13.0827|80.2707|5.5',
    'Bengaluru|Karnataka|12.9716|77.5946|5.5',
    'Hyderabad|Telangana|17.3850|78.4867|5.5',
    'Ahmedabad|Gujarat|23.0225|72.5714|5.5',
    'Pune|Maharashtra|18.5204|73.8567|5.5',
    'Jaipur|Rajasthan|26.9124|75.7873|5.5',
    'Lucknow|Uttar Pradesh|26.8467|80.9462|5.5',
    'Kanpur|Uttar Pradesh|26.4499|80.3319|5.5',
    'Nagpur|Maharashtra|21.1458|79.0882|5.5',
    'Indore|Madhya Pradesh|22.7196|75.8577|5.5',
    'Bhopal|Madhya Pradesh|23.2599|77.4126|5.5',
    'Patna|Bihar|25.5941|85.1376|5.5',
    'Vadodara|Gujarat|22.3072|73.1812|5.5',
    'Ludhiana|Punjab|30.9010|75.8573|5.5',
    'Agra|Uttar Pradesh|27.1767|78.0081|5.5',
    'Nashik|Maharashtra|19.9975|73.7898|5.5',
    'Varanasi|Uttar Pradesh|25.3176|82.9739|5.5',
    'Amritsar|Punjab|31.6340|74.8723|5.5',
    'Prayagraj|Uttar Pradesh|25.4358|81.8463|5.5',
    'Ranchi|Jharkhand|23.3441|85.3096|5.5',
    'Coimbatore|Tamil Nadu|11.0168|76.9558|5.5',
    'Jabalpur|Madhya Pradesh|23.1815|79.9864|5.5',
    'Gwalior|Madhya Pradesh|26.2183|78.1828|5.5',
    'Vijayawada|Andhra Pradesh|16.5062|80.6480|5.5',
    'Jodhpur|Rajasthan|26.2389|73.0243|5.5',
    'Madurai|Tamil Nadu|9.9252|78.1198|5.5',
    'Raipur|Chhattisgarh|21.2514|81.6296|5.5',
    'Kota|Rajasthan|25.2138|75.8648|5.5',
    'Chandigarh|Chandigarh|30.7333|76.7794|5.5',
    'Guwahati|Assam|26.1445|91.7362|5.5',
    'Mysuru|Karnataka|12.2958|76.6394|5.5',
    'Thiruvananthapuram|Kerala|8.5241|76.9366|5.5',
    'Kochi|Kerala|9.9312|76.2673|5.5',
    'Bhubaneswar|Odisha|20.2961|85.8245|5.5',
    'Dehradun|Uttarakhand|30.3165|78.0322|5.5',
    'Shimla|Himachal Pradesh|31.1048|77.1734|5.5',
    'Jammu|Jammu and Kashmir|32.7266|74.8570|5.5',
    'Srinagar|Jammu and Kashmir|34.0837|74.7973|5.5',
    'Leh|Ladakh|34.1526|77.5771|5.5',
    'Jaisalmer|Rajasthan|26.9157|70.9083|5.5',
    'Udaipur|Rajasthan|24.5854|73.7125|5.5',
    'Ajmer|Rajasthan|26.4499|74.6399|5.5',
    'Bikaner|Rajasthan|28.0229|73.3119|5.5',
    'Gorakhpur|Uttar Pradesh|26.7606|83.3732|5.5',
    'Bareilly|Uttar Pradesh|28.3670|79.4304|5.5',
    'Meerut|Uttar Pradesh|28.9845|77.7064|5.5',
    'Moradabad|Uttar Pradesh|28.8386|78.7733|5.5',
    'Aligarh|Uttar Pradesh|27.8974|78.0880|5.5',
    'Jhansi|Uttar Pradesh|25.4484|78.5685|5.5',
    'Gaya|Bihar|24.7914|85.0002|5.5',
    'Bhagalpur|Bihar|25.2425|86.9842|5.5',
    'Darbhanga|Bihar|26.1542|85.8918|5.5',
    'Siliguri|West Bengal|26.7271|88.3953|5.5',
    'Durgapur|West Bengal|23.5204|87.3119|5.5',
    'Asansol|West Bengal|23.6739|87.0933|5.5',
    'Jamshedpur|Jharkhand|22.8046|86.2029|5.5',
    'Cuttack|Odisha|20.4625|85.8828|5.5',
    'Visakhapatnam|Andhra Pradesh|17.6868|83.2185|5.5',
    'Tirupati|Andhra Pradesh|13.6288|79.4192|5.5',
    'Mangaluru|Karnataka|12.9141|74.8560|5.5',
    'Hubballi|Karnataka|15.3647|75.1240|5.5',
    'Belagavi|Karnataka|15.8497|74.4977|5.5',
    'Kolhapur|Maharashtra|16.7050|74.2433|5.5',
    'Aurangabad|Maharashtra|19.8762|75.3433|5.5',
    'Solapur|Maharashtra|17.6599|75.9064|5.5',
    'Amravati|Maharashtra|20.9320|77.7523|5.5',
    'Nanded|Maharashtra|19.1383|77.3210|5.5',
    'Akola|Maharashtra|20.7002|77.0082|5.5',
    'Bhavnagar|Gujarat|21.7645|72.1519|5.5',
    'Rajkot|Gujarat|22.3039|70.8022|5.5',
    'Jamnagar|Gujarat|22.4707|70.0577|5.5',
    'Surat|Gujarat|21.1702|72.8311|5.5',
    'Gandhinagar|Gujarat|23.2156|72.6369|5.5',
    'Puducherry|Puducherry|11.9416|79.8083|5.5',
    'Tiruchirappalli|Tamil Nadu|10.7905|78.7047|5.5',
    'Salem|Tamil Nadu|11.6643|78.1460|5.5',
    'Tirunelveli|Tamil Nadu|8.7139|77.7567|5.5',
    'Kanyakumari|Tamil Nadu|8.0883|77.5385|5.5',
    'Warangal|Telangana|17.9689|79.5941|5.5',
    'Nizamabad|Telangana|18.6725|78.0941|5.5',
    'Karimnagar|Telangana|18.4386|79.1288|5.5',
    'Guntur|Andhra Pradesh|16.3067|80.4365|5.5',
    'Nellore|Andhra Pradesh|14.4426|79.9865|5.5',
    'Kurnool|Andhra Pradesh|15.8281|78.0373|5.5',
    'Anantapur|Andhra Pradesh|14.6819|77.6006|5.5',
    'Raichur|Karnataka|16.2076|77.3463|5.5',
    'Ballari|Karnataka|15.1394|76.9214|5.5',
    'Davangere|Karnataka|14.4644|75.9218|5.5',
    'Shivamogga|Karnataka|13.9299|75.5681|5.5',
    'Udupi|Karnataka|13.3409|74.7421|5.5',
    'Kozhikode|Kerala|11.2588|75.7804|5.5',
    'Thrissur|Kerala|10.5276|76.2144|5.5',
    'Kollam|Kerala|8.8932|76.6141|5.5',
    'Alappuzha|Kerala|9.4981|76.3388|5.5',
    'Kottayam|Kerala|9.5916|76.5222|5.5',
    'Imphal|Manipur|24.8170|93.9368|5.5',
    'Aizawl|Mizoram|23.7271|92.7176|5.5',
    'Agartala|Tripura|23.8315|91.2868|5.5',
    'Shillong|Meghalaya|25.5788|91.8933|5.5',
    'Itanagar|Arunachal Pradesh|27.0844|93.6053|5.5',
    'Kohima|Nagaland|25.6751|94.1086|5.5',
    'Gangtok|Sikkim|27.3389|88.6065|5.5',
    'Dibrugarh|Assam|27.4728|94.9120|5.5',
    'Silchar|Assam|24.8333|92.7789|5.5',
    'Jorhat|Assam|26.7509|94.2037|5.5',
    'Kathmandu|Nepal|27.7172|85.3240|5.75',
    'Colombo|Sri Lanka|6.9271|79.8612|5.5',
    'Dhaka|Bangladesh|23.8103|90.4125|6',
    'Karachi|Pakistan|24.8607|67.0011|5',
    'Lahore|Pakistan|31.5204|74.3587|5',
    'Dubai|UAE|25.2048|55.2708|4',
    'Abu Dhabi|UAE|24.4539|54.3773|4',
    'Doha|Qatar|25.2854|51.5310|3',
    'Riyadh|Saudi Arabia|24.7136|46.6753|3',
    'Muscat|Oman|23.5880|58.3829|4',
    'Kuwait City|Kuwait|29.3759|47.9774|3',
    'Singapore|Singapore|1.3521|103.8198|8',
    'Kuala Lumpur|Malaysia|3.1390|101.6869|8',
    'Bangkok|Thailand|13.7563|100.5018|7',
    'Jakarta|Indonesia|-6.2088|106.8456|7',
    'Hong Kong|Hong Kong|22.3193|114.1694|8',
    'Shanghai|China|31.2304|121.4737|8',
    'Beijing|China|39.9042|116.4074|8',
    'Tokyo|Japan|35.6762|139.6503|9',
    'Seoul|South Korea|37.5665|126.9780|9',
    'Sydney|Australia|-33.8688|151.2093|10',
    'Melbourne|Australia|-37.8136|144.9631|10',
    'Auckland|New Zealand|-36.8485|174.7633|12',
    'London|United Kingdom|51.5074|-0.1278|0',
    'Manchester|United Kingdom|53.4808|-2.2426|0',
    'Birmingham|United Kingdom|52.4862|-1.8904|0',
    'Dublin|Ireland|53.3498|-6.2603|0',
    'Paris|France|48.8566|2.3522|1',
    'Berlin|Germany|52.5200|13.4050|1',
    'Amsterdam|Netherlands|52.3676|4.9041|1',
    'Brussels|Belgium|50.8503|4.3517|1',
    'Zurich|Switzerland|47.3769|8.5417|1',
    'Rome|Italy|41.9028|12.4964|1',
    'Madrid|Spain|40.4168|-3.7038|1',
    'Barcelona|Spain|41.3851|2.1734|1',
    'Lisbon|Portugal|38.7223|-9.1393|0',
    'Stockholm|Sweden|59.3293|18.0686|1',
    'Oslo|Norway|59.9139|10.7522|1',
    'Copenhagen|Denmark|55.6761|12.5683|1',
    'Helsinki|Finland|60.1699|24.9384|2',
    'Moscow|Russia|55.7558|37.6173|3',
    'Istanbul|Turkey|41.0082|28.9784|3',
    'Athens|Greece|37.9838|23.7275|2',
    'Cairo|Egypt|30.0444|31.2357|2',
    'Nairobi|Kenya|-1.2921|36.8219|3',
    'Johannesburg|South Africa|-26.2041|28.0473|2',
    'Lagos|Nigeria|6.5244|3.3792|1',
    'Accra|Ghana|5.6037|-0.1870|0',
    'New York|United States|40.7128|-74.0060|-5',
    'Toronto|Canada|43.6532|-79.3832|-5',
    'Chicago|United States|41.8781|-87.6298|-6',
    'Houston|United States|29.7604|-95.3698|-6',
    'Los Angeles|United States|34.0522|-118.2437|-8',
    'San Francisco|United States|37.7749|-122.4194|-8',
    'Seattle|United States|47.6062|-122.3321|-8',
    'Vancouver|Canada|49.2827|-123.1207|-8',
    'Mexico City|Mexico|19.4326|-99.1332|-6',
    'Sao Paulo|Brazil|-23.5505|-46.6333|-3',
    'Buenos Aires|Argentina|-34.6037|-58.3816|-3',
    'Lima|Peru|-12.0464|-77.0428|-5',
    'Bogota|Colombia|4.7110|-74.0721|-5'
  ];

  var PLACES = DATA.map(function (row) {
    var p = row.split('|');
    return { name: p[0], region: p[1], lat: Number(p[2]), lon: Number(p[3]), tz: Number(p[4]) };
  });

  function label(p) { return p.name + ', ' + p.region; }

  function wire() {
    var input = document.getElementById('place');
    var list = document.getElementById('placelist');
    if (!input || !list) return;

    list.innerHTML = PLACES.map(function (p) {
      return '<option value="' + label(p) + '"></option>';
    }).join('');

    var form = input.form;
    if (!form) return;

    var apply = function () {
      var v = input.value.trim().toLowerCase();
      var hit = PLACES.filter(function (p) { return label(p).toLowerCase() === v; })[0];
      if (!hit) return;
      var lat = form.elements.namedItem('lat');
      var lon = form.elements.namedItem('lon');
      var tz = form.elements.namedItem('tz');
      if (lat) lat.value = hit.lat.toFixed(4);
      if (lon) lon.value = hit.lon.toFixed(4);
      if (tz) tz.value = hit.tz;
    };

    input.addEventListener('change', apply);
    input.addEventListener('input', function () {
      // A picked option fires change; typing only narrows the list.
      if (PLACES.some(function (p) { return label(p).toLowerCase() === input.value.trim().toLowerCase(); })) apply();
    });
  }

  document.addEventListener('DOMContentLoaded', wire);
})();
