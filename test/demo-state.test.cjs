const { test } = require('node:test');
const assert = require('node:assert/strict');
const { defaults, validate, load, save, COLS } = require('../demo/state');
test('默认布局每个断点都合法，往返保存保留位置', () => {
  const data = defaults(); let raw;
  data.layouts.lg[0].x = 1; data.layouts.lg[0].w = 3;
  const storage = { getItem: () => raw, setItem: (key, value) => { raw = value; } };
  save(storage, data);
  assert.equal(load(storage).data.layouts.lg[0].x, 1);
  assert.equal(Object.keys(validate(data).layouts).length, Object.keys(COLS).length);
});
test('损坏或不可访问的存储安全回退', () => {
  assert.match(load({ getItem: () => '{bad' }).warning, /不可读取/);
  assert.equal(load({ getItem() { throw new Error('disabled'); } }).data.widgets.length, 6);
  assert.throws(() => save({ setItem() { throw new Error('quota'); } }, defaults()), /quota/);
});
test('导入拒绝重复标识、越界、非数字、未知类型和不完整断点', () => {
  for (const mutate of [
    d => { d.widgets[1].id = d.widgets[0].id; },
    d => { d.layouts.lg[0].x = 12; },
    d => { d.layouts.lg[0].h = Infinity; },
    d => { d.widgets[0].type = '__proto__'; },
    d => { delete d.layouts.xs; }
  ]) { const data = defaults(); mutate(data); assert.throws(() => validate(data)); }
});
