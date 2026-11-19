/* 夜晚小鎮：遊戲引擎（純邏輯，不碰畫面）
 * 狀態只有一個陣列：lamps[i] === true 表示第 i 盞燈亮著。
 * 開關型別：
 *   toggle：切換連到的燈（亮變暗、暗變亮）
 *   on    ：單向開關，只會把連到的燈點亮，不會熄滅
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(this, function () {
  'use strict';

  /** 按下第 idx 個開關，回傳新的燈狀態（不修改原陣列） */
  function press(level, lamps, idx) {
    var sw = level.switches[idx];
    var next = lamps.slice();
    sw.links.forEach(function (i) {
      next[i] = sw.type === 'on' ? true : !next[i];
    });
    return next;
  }

  /** 勝利判定：所有燈都亮 */
  function isWin(lamps) {
    return lamps.every(Boolean);
  }

  function encode(lamps) {
    var m = 0;
    lamps.forEach(function (on, i) { if (on) m |= (1 << i); });
    return m;
  }

  /**
   * 用廣度優先搜尋找最少步數（par）。
   * 回傳 { par, path }，path 是一組最短解的開關編號；無解回傳 null。
   */
  function solve(level) {
    var n = level.start.length;
    var goal = (1 << n) - 1;
    var startMask = encode(level.start);
    if (startMask === goal) return { par: 0, path: [] };

    var prev = {};            // mask -> { from, sw }
    prev[startMask] = null;
    var queue = [startMask];

    for (var head = 0; head < queue.length; head++) {
      var cur = queue[head];
      var lamps = [];
      for (var b = 0; b < n; b++) lamps.push(!!(cur & (1 << b)));
      for (var s = 0; s < level.switches.length; s++) {
        var nm = encode(press(level, lamps, s));
        if (nm in prev) continue;
        prev[nm] = { from: cur, sw: s };
        if (nm === goal) {
          var path = [], m = nm;
          while (prev[m]) { path.unshift(prev[m].sw); m = prev[m].from; }
          return { par: path.length, path: path };
        }
        queue.push(nm);
      }
    }
    return null;
  }

  /** 星星：≤par 三星；≤par+2 兩星；其餘一星 */
  function stars(moves, par) {
    if (moves <= par) return 3;
    if (moves <= par + 2) return 2;
    return 1;
  }

  /** 每盞燈至少被一個開關連到（否則那盞燈只是擺設） */
  function allLampsCovered(level) {
    var seen = {};
    level.switches.forEach(function (sw) { sw.links.forEach(function (i) { seen[i] = true; }); });
    for (var i = 0; i < level.start.length; i++) if (!seen[i]) return false;
    return true;
  }

  return { press: press, isWin: isWin, solve: solve, stars: stars, allLampsCovered: allLampsCovered };
});
