/* 由 tools/generate-levels.js 產生，請勿手動編輯 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LEVELS = factory();
})(this, function () {
  'use strict';
  return [{
    "id": 1,
    "title": "第一盞燈",
    "note": "每個開關下方的亮點，表示它會切換哪幾盞燈。",
    "par": 2,
    "switches": [{ "type": "toggle", "links": [1, 2] }, { "type": "toggle", "links": [0, 1] }, { "type": "toggle", "links": [0] }],
    "start": [false, true, false]
  },
  {
    "id": 2,
    "title": "路口",
    "note": "同一個開關按兩次等於沒按，所以順序不重要。",
    "par": 2,
    "switches": [{ "type": "toggle", "links": [3] }, { "type": "toggle", "links": [1, 3] }, { "type": "toggle", "links": [0, 3] }, { "type": "toggle", "links": [0, 2] }],
    "start": [false, false, false, false]
  },
  {
    "id": 3,
    "title": "轉角",
    "note": "",
    "par": 3,
    "switches": [{ "type": "toggle", "links": [1, 2, 3] }, { "type": "toggle", "links": [0, 2, 3] }, { "type": "toggle", "links": [1, 3] }, { "type": "toggle", "links": [2, 3] }],
    "start": [false, true, true, false]
  },
  {
    "id": 4,
    "title": "單向的路",
    "note": "新機關：標有「只亮」的單向開關，只會點亮燈，不會熄滅。",
    "par": 2,
    "switches": [{ "type": "toggle", "links": [0, 1] }, { "type": "on", "links": [1, 2, 3] }, { "type": "toggle", "links": [3] }, { "type": "toggle", "links": [0] }],
    "start": [false, true, false, false]
  },
  {
    "id": 5,
    "title": "小巷",
    "note": "",
    "par": 3,
    "switches": [{ "type": "toggle", "links": [2] }, { "type": "toggle", "links": [0, 4] }, { "type": "toggle", "links": [0, 3, 4] }, { "type": "on", "links": [1] }, { "type": "toggle", "links": [4] }],
    "start": [false, false, false, false, false]
  },
  {
    "id": 6,
    "title": "雙向與單向",
    "note": "單向開關的按下順序可能會影響結果。",
    "par": 4,
    "switches": [{ "type": "on", "links": [2, 3] }, { "type": "on", "links": [0, 3] }, { "type": "toggle", "links": [2, 4] }, { "type": "toggle", "links": [3] }, { "type": "toggle", "links": [0, 1, 4] }],
    "start": [true, false, true, false, true]
  },
  {
    "id": 7,
    "title": "長街",
    "note": "",
    "par": 4,
    "switches": [{ "type": "on", "links": [0, 1] }, { "type": "toggle", "links": [1, 4, 5] }, { "type": "toggle", "links": [4, 5] }, { "type": "toggle", "links": [2, 3] }, { "type": "toggle", "links": [0, 1, 4] }, { "type": "toggle", "links": [3, 4, 5] }],
    "start": [true, false, false, false, true, false]
  },
  {
    "id": 8,
    "title": "廣場",
    "note": "",
    "par": 4,
    "switches": [{ "type": "on", "links": [0, 5] }, { "type": "toggle", "links": [1, 4] }, { "type": "toggle", "links": [2, 5] }, { "type": "on", "links": [1, 4, 5] }, { "type": "toggle", "links": [3, 5] }, { "type": "toggle", "links": [3, 4, 5] }],
    "start": [false, false, false, false, false, true]
  },
  {
    "id": 9,
    "title": "鐘塔下",
    "note": "",
    "par": 5,
    "switches": [{ "type": "toggle", "links": [0, 3] }, { "type": "toggle", "links": [2, 6] }, { "type": "on", "links": [3, 5] }, { "type": "toggle", "links": [3, 4, 5] }, { "type": "on", "links": [2, 3] }, { "type": "toggle", "links": [1, 3] }, { "type": "toggle", "links": [3, 5, 6] }],
    "start": [false, false, false, false, false, true, false]
  },
  {
    "id": 10,
    "title": "整座小鎮",
    "note": "最後一關：全部的燈都交給你了。",
    "par": 5,
    "switches": [{ "type": "on", "links": [2, 6] }, { "type": "toggle", "links": [0, 3] }, { "type": "toggle", "links": [0, 2] }, { "type": "toggle", "links": [1, 4, 6] }, { "type": "on", "links": [4, 6] }, { "type": "toggle", "links": [0, 4] }, { "type": "toggle", "links": [0, 5] }],
    "start": [false, false, false, false, true, false, false]
  }];
});
