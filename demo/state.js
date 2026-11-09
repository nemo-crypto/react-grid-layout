const VERSION = 1;
const STORAGE_KEY = 'rgl-studio:v1';
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const TYPES = { metric: '指标卡片', chart: '趋势图表', tasks: '任务列表', note: '便签' };
function defaults() {
  const widgets = [
    { id: 'revenue', type: 'metric', title: '本月收入' },
    { id: 'visits', type: 'metric', title: '访问次数' },
    { id: 'conversion', type: 'metric', title: '转化表现' },
    { id: 'trend', type: 'chart', title: '访问趋势' },
    { id: 'tasks', type: 'tasks', title: '本周任务' },
    { id: 'note', type: 'note', title: '工作便签' }
  ];
  const layouts = {};
  for (const [breakpoint, cols] of Object.entries(COLS)) {
    const width = cols >= 6 ? Math.floor(cols / 3) : cols;
    layouts[breakpoint] = widgets.map((widget, index) => ({ i: widget.id, x: cols >= 6 ? (index % 3) * width : 0, y: cols >= 6 ? Math.floor(index / 3) * 4 : index * 4, w: width, h: 4, minW: Math.min(2, cols), minH: 3 }));
  }
  return { version: VERSION, widgets, layouts };
}
function validate(input) {
  if (!input || input.version !== VERSION || !Array.isArray(input.widgets) || input.widgets.length > 12) throw new Error('需要版本 1 的布局文件，最多 12 张卡片。');
  const ids = new Set();
  const widgets = input.widgets.map(widget => {
    if (!widget || typeof widget.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(widget.id) || ids.has(widget.id) || !Object.hasOwn(TYPES, widget.type) || typeof widget.title !== 'string' || !widget.title.trim() || widget.title.length > 50) throw new Error('卡片类型、名称或唯一标识无效。');
    ids.add(widget.id);
    return { id: widget.id, type: widget.type, title: widget.title };
  });
  const layouts = {};
  for (const [breakpoint, cols] of Object.entries(COLS)) {
    const layout = input.layouts?.[breakpoint];
    if (!Array.isArray(layout) || layout.length !== widgets.length) throw new Error(`断点 ${breakpoint} 的布局不完整。`);
    const seen = new Set();
    layouts[breakpoint] = layout.map(item => {
      if (!item || !ids.has(item.i) || seen.has(item.i) || !['x', 'y', 'w', 'h'].every(key => Number.isInteger(item[key])) || item.x < 0 || item.y < 0 || item.y > 1000 || item.w < 1 || item.h < 3 || item.h > 30 || item.x + item.w > cols) throw new Error(`断点 ${breakpoint} 存在越界或无效尺寸。`);
      seen.add(item.i);
      return { i: item.i, x: item.x, y: item.y, w: item.w, h: item.h, minW: Math.min(2, cols), minH: 3 };
    });
  }
  return { version: VERSION, widgets, layouts };
}
function load(storage) {
  try { const raw = storage.getItem(STORAGE_KEY); return { data: raw ? validate(JSON.parse(raw)) : defaults(), warning: '' }; }
  catch { return { data: defaults(), warning: '保存的布局不可读取，已使用默认布局；可重新保存。' }; }
}
function save(storage, data) {
  const clean = validate(data);
  storage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}
module.exports = { VERSION, STORAGE_KEY, COLS, BREAKPOINTS, TYPES, defaults, validate, load, save };
