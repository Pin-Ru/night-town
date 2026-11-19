/* 夜晚小鎮：畫面與操作 */
(function () {
  'use strict';
  var levels = window.LEVELS, Engine = window.Engine, Store = window.Store;
  var save = Store.load();

  var $ = function (id) { return document.getElementById(id); };
  var parCache = {};
  function parOf(lv) {
    if (!(lv.id in parCache)) { var s = Engine.solve(lv); parCache[lv.id] = s ? s.par : lv.par; }
    return parCache[lv.id];
  }
  function levelById(id) {
    for (var i = 0; i < levels.length; i++) if (levels[i].id === id) return levels[i];
    return null;
  }
  function starText(n) { return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n); }
  function unlocked(i) { return i === 0 || !!save.cleared[levels[i - 1].id]; }

  /* ---------- 畫面切換 ---------- */
  function show(view) {
    $('view-menu').hidden = view !== 'menu';
    $('view-game').hidden = view !== 'game';
    window.scrollTo(0, 0);
  }

  /* ---------- 關卡選擇 ---------- */
  function renderMenu() {
    var html = '', total = 0;
    levels.forEach(function (lv, i) {
      var c = save.cleared[lv.id], open = unlocked(i);
      if (c) total += c.stars;
      html += '<button class="lvl' + (c ? ' done' : '') + '" data-i="' + i + '"' + (open ? '' : ' disabled') + '>' +
        '<span class="lvl-no">' + lv.id + '</span>' +
        '<span class="lvl-title">' + lv.title + '</span>' +
        '<span class="lvl-star">' + (c ? starText(c.stars) : (open ? '未過關' : '未解鎖')) + '</span>' +
        '</button>';
    });
    $('levels').innerHTML = html;
    $('total-stars').textContent = '星星 ' + total + ' / ' + levels.length * 3;

    var cur = save.current && levelById(save.current.id);
    $('continue').hidden = !cur;
    if (cur) $('continue-label').textContent = '繼續第 ' + cur.id + ' 關：' + cur.title + '（已按 ' + save.current.moves + ' 步）';
  }

  /* ---------- 遊戲 ---------- */
  var G = null; // { lv, i, lamps, moves, hist, won }

  function startLevel(i, resume) {
    var lv = levels[i];
    var cur = save.current;
    if (resume && cur && cur.id === lv.id && cur.lamps.length === lv.start.length) {
      G = { lv: lv, i: i, lamps: cur.lamps.slice(), moves: cur.moves, hist: cur.hist.map(function (h) { return h.slice(); }), won: false };
    } else {
      G = { lv: lv, i: i, lamps: lv.start.slice(), moves: 0, hist: [], won: false };
      Store.setCurrent({ id: lv.id, lamps: G.lamps.slice(), moves: 0, hist: [] });
    }
    show('game');
    renderGame();
  }

  function persist() {
    Store.setCurrent({ id: G.lv.id, lamps: G.lamps.slice(), moves: G.moves, hist: G.hist });
  }

  function press(s) {
    if (G.won) return;
    G.hist.push(G.lamps.slice());
    G.lamps = Engine.press(G.lv, G.lamps, s);
    G.moves++;
    if (Engine.isWin(G.lamps)) {
      G.won = true;
      Store.recordClear(G.lv.id, G.moves, Engine.stars(G.moves, parOf(G.lv)));
    } else {
      persist();
    }
    renderGame();
  }

  function undo() {
    if (G.won || !G.hist.length) return;
    G.lamps = G.hist.pop();
    G.moves--;
    persist();
    renderGame();
  }

  function resetLevel() {
    G.lamps = G.lv.start.slice(); G.moves = 0; G.hist = []; G.won = false;
    persist();
    renderGame();
  }

  function lampSVG(on) {
    var face = on
      ? '<path d="M28 34q4-6 8 0M46 34q4-6 8 0"/><path d="M33 46q9 8 18 0"/>'
      : '<path d="M28 36h8M46 36h8"/><path d="M36 48h12"/>';
    var spark = on ? '<g class="spark"><path d="M11 12l8 8"/><path d="M5 27l10 3"/><path d="M24 3l3 10"/></g>' : '';
    return '<svg viewBox="0 0 76 100" class="lampsvg" aria-hidden="true"><g filter="url(#crayon-svg)">' +
      spark +
      '<rect x="38" y="60" width="8" height="32" rx="3" class="pole"></rect>' +
      '<ellipse cx="42" cy="93" rx="17" ry="5" class="base"></ellipse>' +
      '<circle cx="42" cy="36" r="27" class="head"></circle>' +
      '<g class="face">' + face + '</g></g></svg>';
  }

  function renderGame() {
    var lv = G.lv, par = parOf(lv), lampsHtml = '', swHtml = '';
    $('g-title').textContent = '第 ' + lv.id + ' 關　' + lv.title;
    $('g-note').textContent = lv.note;
    $('g-note').hidden = !lv.note;
    $('g-moves').textContent = G.moves;
    $('g-par').textContent = par;
    var c = save.cleared[lv.id];
    $('g-best').textContent = c ? c.best + ' 步 ' + starText(c.stars) : '尚無';

    G.lamps.forEach(function (on, i) {
      lampsHtml += '<div class="lamp' + (on ? ' on' : '') + '" data-i="' + i + '">' + lampSVG(on) +
        '<span class="num">' + (i + 1) + '</span></div>';
    });
    lv.switches.forEach(function (sw, j) {
      var dots = '';
      for (var i = 0; i < G.lamps.length; i++) dots += '<i class="' + (sw.links.indexOf(i) >= 0 ? 'l' : '') + '"></i>';
      var letter = String.fromCharCode(65 + j), isOn = sw.type === 'on';
      swHtml += '<button class="sw' + (isOn ? ' one' : '') + '" data-s="' + j + '"' + (G.won ? ' disabled' : '') +
        ' aria-label="開關 ' + letter + (isOn ? '（只亮）' : '') + '，連到第 ' + sw.links.map(function (x) { return x + 1; }).join('、') + ' 盞燈">' +
        '<b>' + letter + '</b><span class="dots">' + dots + '</span>' +
        '<em>' + (isOn ? '只亮' : '切換') + '</em></button>';
    });
    $('lamps').innerHTML = lampsHtml;
    $('switches').innerHTML = swHtml;

    var last = G.i === levels.length - 1;
    var msg = '';
    if (G.won) {
      var st = Engine.stars(G.moves, par);
      msg = '全部亮起來了！' + G.moves + ' 步（目標 ' + par + ' 步）' + starText(st);
      if (st < 3) msg += '　再少按幾步就能拿三星。';
      if (last) msg += '　整座小鎮都醒了。';
    }
    $('g-msg').textContent = msg;
    $('btn-next').hidden = !(G.won && !last);
    $('btn-undo').disabled = G.won || !G.hist.length;
  }

  function setLink(s) {
    var links = s === null ? [] : G.lv.switches[s].links;
    Array.prototype.forEach.call(document.querySelectorAll('.lamp'), function (el) {
      el.classList.toggle('link', links.indexOf(+el.dataset.i) >= 0);
    });
  }

  /* ---------- 事件 ---------- */
  $('levels').addEventListener('click', function (e) {
    var b = e.target.closest('.lvl');
    if (b && !b.disabled) startLevel(+b.dataset.i, false);
  });
  $('btn-continue').addEventListener('click', function () {
    var lv = levelById(save.current.id);
    startLevel(levels.indexOf(lv), true);
  });
  $('btn-back').addEventListener('click', function () { renderMenu(); show('menu'); });
  $('btn-undo').addEventListener('click', undo);
  $('btn-reset').addEventListener('click', resetLevel);
  $('btn-next').addEventListener('click', function () { startLevel(G.i + 1, false); });

  var sw = $('switches');
  sw.addEventListener('click', function (e) { var b = e.target.closest('.sw'); if (b) press(+b.dataset.s); });
  sw.addEventListener('pointerover', function (e) { var b = e.target.closest('.sw'); if (b) setLink(+b.dataset.s); });
  sw.addEventListener('pointerout', function () { setLink(null); });
  sw.addEventListener('focusin', function (e) { var b = e.target.closest('.sw'); if (b) setLink(+b.dataset.s); });
  sw.addEventListener('focusout', function () { setLink(null); });

  /* 清除進度：用頁面內的二次確認，不使用瀏覽器對話框 */
  $('btn-erase').addEventListener('click', function () { $('erase-box').hidden = false; $('btn-erase').hidden = true; });
  $('btn-erase-no').addEventListener('click', function () { $('erase-box').hidden = true; $('btn-erase').hidden = false; });
  $('btn-erase-yes').addEventListener('click', function () {
    Store.clearAll(); save = Store.get();
    $('erase-box').hidden = true; $('btn-erase').hidden = false;
    renderMenu();
  });

  renderMenu();
  show('menu');
})();
