import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { COLS, BREAKPOINTS, TYPES, defaults, validate, load, save } from './state';
import '../css/styles.css';
import 'react-resizable/css/styles.css';
import './style.css';
const Grid = WidthProvider(Responsive);
function initialState() {
  try { return load(window.localStorage); } catch { return { data: defaults(), warning: '浏览器禁用了本地存储，仍可编辑和导出布局。' }; }
}
function Widget({ widget }) {
  if (widget.type === 'metric') return <div className="metric"><span>本月累计 · 演示数据</span><strong>{widget.id === 'revenue' ? '¥ 128,430' : widget.id === 'visits' ? '24,892' : '6.82%'}</strong><small>↗ 12.8% <span>较上月</span></small><div className="mini-bars">{[35,48,39,60,52,70,63,85,78,95,83,100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div>;
  if (widget.type === 'chart') return <div className="chart"><div className="chart-meta"><strong>7,286</strong><span>本周访问 · 示例</span></div><svg viewBox="0 0 400 100" role="img" aria-label="演示访问趋势"><path d="M0 85 L30 70 L60 78 L90 48 L120 56 L150 35 L180 50 L210 20 L240 35 L270 18 L300 25 L330 8 L360 18 L400 4 L400 100 L0 100Z" fill="#e8efff"/><path d="M0 85 L30 70 L60 78 L90 48 L120 56 L150 35 L180 50 L210 20 L240 35 L270 18 L300 25 L330 8 L360 18 L400 4" fill="none" stroke="#6283cf" strokeWidth="3"/></svg><div className="chart-days"><span>周一</span><span>周三</span><span>周五</span><span>周日</span></div></div>;
  if (widget.type === 'tasks') return <ul className="tasks"><li><span className="task-dot done"/>梳理组件边界<small>已完成</small></li><li><span className="task-dot"/>调整仪表盘布局<small>进行中</small></li><li><span className="task-dot"/>检查移动端断点<small>待处理</small></li></ul>;
  return <div className="note"><p>把重要的信息，放在最顺手的位置。</p><span>拖动卡片顶部移动位置；拖动右下角调整尺寸。满意后保存，下次继续。</span><small>这是布局演示便签，非在线协作数据。</small></div>;
}
function App() {
  const [initial] = useState(initialState);
  const [data, setData] = useState(initial.data);
  const [notice, setNotice] = useState(initial.warning || '布局已就绪。拖动顶部手柄，或调整右下角尺寸。');
  const [breakpoint, setBreakpoint] = useState('lg');
  const [locked, setLocked] = useState(false);
  const [compact, setCompact] = useState(true);
  const [type, setType] = useState('metric');
  const [json, setJson] = useState('');
  const [editor, setEditor] = useState(false);
  const [dirty, setDirty] = useState(false);
  function edit(next) { setData(next); setDirty(true); }
  function add() {
    if (data.widgets.length >= 12) return;
    const widget = { id: `widget-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type, title: TYPES[type] };
    const layouts = Object.fromEntries(Object.entries(COLS).map(([key, cols]) => [key, [...data.layouts[key], { i: widget.id, x: 0, y: Math.max(0, ...data.layouts[key].map(item => item.y + item.h)), w: Math.min(4, cols), h: 4, minW: Math.min(2, cols), minH: 3 }]]));
    edit({ ...data, widgets: [...data.widgets, widget], layouts }); setNotice('已添加卡片，保存后可在刷新后恢复。');
  }
  function remove(id) { edit({ ...data, widgets: data.widgets.filter(widget => widget.id !== id), layouts: Object.fromEntries(Object.entries(data.layouts).map(([key, layout]) => [key, layout.filter(item => item.i !== id)])) }); }
  function persist() { try { save(window.localStorage, data); setDirty(false); setNotice('布局已保存到当前浏览器。'); } catch (error) { setNotice(`保存失败：${error.message} 可使用导出功能保留布局。`); } }
  function download() {
    const blob = new Blob([JSON.stringify(validate(data), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'grid-studio-layout.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('布局 JSON 已导出。');
  }
  function apply() { try { edit(validate(JSON.parse(json))); setEditor(false); setNotice('布局已导入；点击保存可保留到下次访问。'); } catch (error) { setNotice(`导入失败：${error.message}`); } }
  function onLayoutChange(layout, layouts) {
    setData(previous => {
      const next = { ...previous.layouts, ...layouts };
      const shape = source => JSON.stringify(Object.fromEntries(Object.entries(source).map(([key, items]) => [key, items.map(({ i,x,y,w,h }) => ({ i,x,y,w,h }))])));
      return shape(next) === shape(previous.layouts) ? previous : { ...previous, layouts: next };
    });
  }
  return <main className="studio"><header><a href="/" className="brand"><span>▦</span> Grid Studio</a><span className="project">REACT GRID LAYOUT / LOCAL SOURCE</span></header>
    <section className="hero"><div><div className="eyebrow">YOUR SPACE, YOUR STRUCTURE</div><h1>工作台，由你排列。</h1><p>可拖拽、可缩放、响应式。把布局变成可保存、可复用的配置。</p></div><div className="summary"><strong>{data.widgets.length}</strong><span>张卡片</span><i/><strong>{COLS[breakpoint]}</strong><span>列 · {breakpoint}</span></div></section>
    <section className="toolbar" aria-label="布局工具"><div><label htmlFor="widget-type">添加卡片</label><select id="widget-type" value={type} onChange={event => setType(event.target.value)}>{Object.entries(TYPES).map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select><button onClick={add} disabled={locked || data.widgets.length >= 12}>＋ 添加</button></div><div><button aria-pressed={locked} onClick={() => setLocked(!locked)}>{locked ? '解锁布局' : '锁定布局'}</button><button aria-pressed={compact} onClick={() => { setCompact(!compact); setDirty(true); }}>{compact ? '紧凑排列：开' : '紧凑排列：关'}</button><button onClick={() => { edit(defaults()); setNotice('已恢复默认布局；点击保存以覆盖已保存布局。'); }} disabled={locked}>重置</button><button className="primary" onClick={persist}>保存布局</button></div></section>
    <div className="status-row"><span role="status">{notice}</span><span>{dirty ? '有未保存更改' : '本地工作区'} · {locked ? '只读模式' : '编辑模式'}</span></div>
    <section className="canvas" aria-label="可编辑网格">
      {!data.widgets.length && <div className="empty">工作台为空，从上方添加一张卡片开始。</div>}
      <Grid layouts={data.layouts} breakpoints={BREAKPOINTS} cols={COLS} rowHeight={54} margin={[18,18]} containerPadding={[0,0]} onBreakpointChange={setBreakpoint} onLayoutChange={onLayoutChange} onDragStop={() => setDirty(true)} onResizeStop={() => setDirty(true)} draggableHandle=".widget-handle" draggableCancel="button" isDraggable={!locked} isResizable={!locked} compactType={compact ? 'vertical' : null} measureBeforeMount>
        {data.widgets.map(widget => <section key={widget.id} className="widget" data-testid={`widget-${widget.id}`}><div className="widget-handle"><span className="grip" aria-hidden="true">⠿</span><h2>{widget.title}</h2><button aria-label={`移除${widget.title}`} disabled={locked} onClick={() => remove(widget.id)}>×</button></div><Widget widget={widget}/></section>)}
      </Grid>
    </section><section className="bottom-tools"><div><h2>布局就是配置。</h2><p>导出 JSON 用于迁移；导入时会检查版本、尺寸、断点与卡片标识。</p></div><div><button onClick={download}>导出 JSON</button><button disabled={locked} onClick={() => { setEditor(!editor); setJson(JSON.stringify(data, null, 2)); }}>导入 JSON</button></div></section>
    {editor && <section className="json-editor"><label htmlFor="layout-json">布局 JSON</label><textarea id="layout-json" value={json} onChange={event => setJson(event.target.value)} spellCheck={false}/><div><button className="primary" disabled={locked} onClick={apply}>应用导入</button><button onClick={() => setEditor(false)}>取消</button></div></section>}
    <footer>内置图表均为演示数据，不连接后端。<span>本地源码驱动 · {locked ? '布局已锁定' : '拖动手柄开始编辑'}</span></footer>
  </main>;
}
ReactDOM.render(<App/>, document.getElementById('root'));
