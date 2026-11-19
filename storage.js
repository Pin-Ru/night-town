/* 夜晚小鎮：存檔（瀏覽器本機）
 * 資料格式 v1：
 *   { v: 1,
 *     cleared: { "<關卡id>": { stars: 1~3, best: 最少步數 } },
 *     current: null | { id, lamps: [bool], moves, hist: [[bool]] } }   ← 暫停中的關卡
 * 無法使用 localStorage（隱私模式等）時，退回只存在記憶體，遊戲仍可玩。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Store = factory();
})(this, function () {
  'use strict';
  var KEY = 'nightTown.v1';
  var data = fresh();

  function fresh() { return { v: 1, cleared: {}, current: null }; }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1 && parsed.cleared) data = parsed;
      }
    } catch (e) { /* 讀取失敗就用空白存檔 */ }
    return data;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 存不了就只留在記憶體 */ }
  }

  return {
    load: load,
    get: function () { return data; },
    /** 記錄暫停中的關卡狀態 */
    setCurrent: function (cur) { data.current = cur; save(); },
    /** 記錄過關結果，只保留最佳成績 */
    recordClear: function (id, moves, stars) {
      var old = data.cleared[id];
      data.cleared[id] = {
        stars: Math.max(stars, old ? old.stars : 0),
        best: Math.min(moves, old ? old.best : Infinity)
      };
      data.current = null;
      save();
    },
    clearAll: function () { data = fresh(); save(); }
  };
});
