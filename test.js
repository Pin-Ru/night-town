/* 驗證所有關卡：有解、par 正確、按解答能過關、起始不是已過關、每盞燈有開關連到
 * 執行：node tools/test.js
 */
var Engine = require('../js/engine.js');
var LEVELS = require('../js/levels.js');

var failed = 0;
function check(ok, msg) { if (!ok) { failed++; console.error('FAIL ' + msg); } }

LEVELS.forEach(function (lv) {
  var tag = '第 ' + lv.id + ' 關';
  var sol = Engine.solve(lv);
  check(sol !== null, tag + ' 無解');
  if (!sol) return;
  check(sol.par === lv.par, tag + ' par 不符：資料 ' + lv.par + '，求解 ' + sol.par);
  check(sol.par > 0, tag + ' 起始就已過關');
  check(Engine.allLampsCovered(lv), tag + ' 有燈沒有任何開關連到');
  var lamps = lv.start.slice();
  sol.path.forEach(function (s) { lamps = Engine.press(lv, lamps, s); });
  check(Engine.isWin(lamps), tag + ' 照解答按完沒有全亮');
  lv.switches.forEach(function (sw, i) {
    check(sw.links.length > 0, tag + ' 開關 ' + i + ' 沒有連線');
  });
  console.log(tag + ' OK  par=' + sol.par + '  解：' + sol.path.map(function (s) { return String.fromCharCode(65 + s); }).join(' '));
});

check(Engine.stars(3, 3) === 3 && Engine.stars(5, 3) === 2 && Engine.stars(6, 3) === 1, '星星判定');
console.log(failed ? '\n有 ' + failed + ' 項失敗' : '\n全部通過');
process.exit(failed ? 1 : 0);
