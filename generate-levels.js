/* 關卡生成器：用固定亂數種子隨機組合開關連線，
 * 只收「有解、最佳步數落在目標範圍、每盞燈都有開關連到」的關卡。
 * 執行：node tools/generate-levels.js  →  寫出 js/levels.js
 */
var fs = require('fs');
var path = require('path');
var Engine = require('../js/engine.js');

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 難度曲線：燈數、開關數、單向開關數、最佳步數範圍 */
var SPECS = [
  { n: 3, k: 3, on: 0, parMin: 2, parMax: 2, link: [1, 2],
    title: '第一盞燈', note: '每個開關下方的亮點，表示它會切換哪幾盞燈。' },
  { n: 4, k: 4, on: 0, parMin: 2, parMax: 2, link: [1, 2],
    title: '路口', note: '同一個開關按兩次等於沒按，所以順序不重要。' },
  { n: 4, k: 4, on: 0, parMin: 3, parMax: 3, link: [2, 3],
    title: '轉角', note: '' },
  { n: 4, k: 4, on: 1, parMin: 2, parMax: 3, link: [1, 3],
    title: '單向的路', note: '新機關：標有「只亮」的單向開關，只會點亮燈，不會熄滅。' },
  { n: 5, k: 5, on: 1, parMin: 3, parMax: 3, link: [1, 3],
    title: '小巷', note: '' },
  { n: 5, k: 5, on: 2, parMin: 3, parMax: 4, link: [1, 3],
    title: '雙向與單向', note: '單向開關的按下順序可能會影響結果。' },
  { n: 6, k: 6, on: 1, parMin: 4, parMax: 4, link: [2, 3],
    title: '長街', note: '' },
  { n: 6, k: 6, on: 2, parMin: 4, parMax: 5, link: [2, 3],
    title: '廣場', note: '' },
  { n: 7, k: 7, on: 2, parMin: 4, parMax: 5, link: [2, 3],
    title: '鐘塔下', note: '' },
  { n: 7, k: 7, on: 2, parMin: 5, parMax: 6, link: [2, 3],
    title: '整座小鎮', note: '最後一關：全部的燈都交給你了。' }
];

function pickLinks(rand, n, k, linkRange) {
  var sets = [], seen = {};
  var guard = 0;
  while (sets.length < k && guard++ < 1000) {
    var size = linkRange[0] + Math.floor(rand() * (linkRange[1] - linkRange[0] + 1));
    var pool = [], i;
    for (i = 0; i < n; i++) pool.push(i);
    var links = [];
    while (links.length < size) links.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    links.sort(function (a, b) { return a - b; });
    var id = links.join(',');
    if (seen[id]) continue;
    seen[id] = true;
    sets.push(links);
  }
  return sets;
}

function build(spec, seed) {
  var rand = rng(seed);
  for (var attempt = 0; attempt < 200000; attempt++) {
    var linkSets = pickLinks(rand, spec.n, spec.k, spec.link);
    if (linkSets.length < spec.k) continue;
    var order = [];
    for (var i = 0; i < spec.k; i++) order.push(i);
    order.sort(function () { return rand() - 0.5; });
    var onSet = {};
    order.slice(0, spec.on).forEach(function (s) { onSet[s] = true; });
    var switches = linkSets.map(function (links, idx) {
      return { type: onSet[idx] ? 'on' : 'toggle', links: links };
    });
    var start = [], off = 0;
    for (var j = 0; j < spec.n; j++) { var lit = rand() < 0.4; start.push(lit); if (!lit) off++; }
    if (off < 2) continue;
    var level = { switches: switches, start: start };
    if (!Engine.allLampsCovered(level)) continue;
    var sol = Engine.solve(level);
    if (!sol || sol.par < spec.parMin || sol.par > spec.parMax) continue;
    if (spec.on > 0) {
      var usesOn = sol.path.some(function (s) { return switches[s].type === 'on'; });
      if (!usesOn) continue;
    }
    return { level: level, par: sol.par, attempts: attempt + 1 };
  }
  return null;
}

var out = [];
SPECS.forEach(function (spec, i) {
  var r = build(spec, 1000 + i * 17);
  if (!r) { console.error('第 ' + (i + 1) + ' 關：找不到符合條件的組合'); process.exit(1); }
  out.push({
    id: i + 1,
    title: spec.title,
    note: spec.note,
    par: r.par,
    switches: r.level.switches,
    start: r.level.start
  });
  console.log('第 ' + (i + 1) + ' 關 ' + spec.title + '：' + spec.n + ' 盞燈 / ' + spec.k +
    ' 個開關（單向 ' + spec.on + '）/ par ' + r.par);
});

var code = '/* 由 tools/generate-levels.js 產生，請勿手動編輯 */\n' +
  '(function (root, factory) {\n' +
  "  if (typeof module === 'object' && module.exports) module.exports = factory();\n" +
  '  else root.LEVELS = factory();\n' +
  '})(this, function () {\n' +
  "  'use strict';\n" +
  '  return ' + JSON.stringify(out, null, 2).replace(/\n\s{6,}/g, ' ').replace(/\[\s+/g, '[').replace(/\s+\]/g, ']') + ';\n' +
  '});\n';
fs.writeFileSync(path.join(__dirname, '..', 'js', 'levels.js'), code);
console.log('已寫出 js/levels.js');
