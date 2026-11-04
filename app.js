'use strict';
/* Break down - a calm task breakdown app. Data stays on this device. */
const KEY = 'breakdown-v1';
const SIZES = ['small', 'medium', 'big'];
const SIZE_LABEL = { small: 'Small', medium: 'Medium', big: 'Big' };
const SHAPE = { small: 5, medium: 3, big: 1 };

function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function dateLabel() { return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }

function seed() {
  const mk = (text, size) => ({ id: uid(), text, size, done: false });
  return {
    folders: ['Home', 'Personal', 'Work'],
    todos: [
      { id: uid(), text: 'Water the plants', repeat: 'Every day', done: false, returnDate: null },
      { id: uid(), text: 'Take out the recycling', repeat: 'Weekdays', done: false, returnDate: null },
      { id: uid(), text: 'Book a dentist appointment', repeat: null, done: false, returnDate: null },
      { id: uid(), text: 'Pick up the parcel', repeat: null, done: false, returnDate: null },
      { id: uid(), text: 'Call the plumber about the tap', repeat: null, done: false, returnDate: null }
    ],
    breakdowns: [
      { id: uid(), name: 'Clean up', folder: 'Home', steps: [
        mk('Clean the counters', 'small'), mk('Wipe the table', 'small'), mk('Sweep the floor', 'small'),
        mk('Put clothes away', 'small'), mk('Wipe the fridge', 'small'),
        mk('Wash dishes', 'medium'), mk('Vacuum the carpet', 'medium'), mk('Wipe the windows', 'medium'),
        mk('Deep clean the oven', 'big')
      ] }
    ],
    currentBreakdownId: null,
    today: { date: todayStr(), refs: [], energy: null },
    settings: { smallMin: 10, mediumMin: 20, pomWork: 25, pomRest: 5, nudgeTime: '10:00' },
    stats: { date: todayStr(), stepsDone: 0 },
    workingOn: null
  };
}

let S;
function load() {
  try { const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : seed(); }
  catch (e) { S = seed(); }
  if (!S.currentBreakdownId && S.breakdowns.length) S.currentBreakdownId = S.breakdowns[0].id;
  // repeats come back when their return date arrives
  const t = todayStr();
  S.todos.forEach(td => { if (td.done && td.returnDate && td.returnDate <= t) { td.done = false; td.returnDate = null; } });
  if (S.today.date !== t) S.today = { date: t, refs: [], energy: null };
  if (S.stats.date !== t) S.stats = { date: t, stepsDone: 0 };
  save();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

function nextReturn(repeat) {
  const d = new Date(); let add = 1;
  if (repeat === 'Weekly') add = 7;
  else if (repeat === 'Weekdays') { do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6); add = 0; }
  d.setDate(d.getDate() + add);
  const key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const label = d.toLocaleDateString('en-US', { weekday: 'short' });
  return { key, label };
}
function orderedSteps(bd) {
  const out = [];
  SIZES.forEach(sz => bd.steps.filter(s => s.size === sz).forEach(s => out.push(s)));
  return out;
}
function findStep(bid, sid) {
  const bd = S.breakdowns.find(b => b.id === bid); if (!bd) return {};
  return { bd, step: bd.steps.find(s => s.id === sid) };
}
function folderIcon(f) { return f === 'Home' ? '⌂' : f === 'Personal' ? '♡' : f === 'Work' ? '▣' : '▤'; }
function sizeMinutes(size) {
  if (size === 'small') return S.settings.smallMin;
  if (size === 'medium') return S.settings.mediumMin;
  return S.settings.pomWork;
}

/* ---------- view state ---------- */
let view = 'todo';           // todo | breakdown | all | today | timer
let allFolder = 'All';
let searchOpen = false, sortAlpha = false, query = '';
let timer = null;            // {bid, sid, phases:[{label,secs}], idx, remaining, total, running, intId, finished}

/* ---------- small builders ---------- */
function toolbar(icons) {
  const map = {
    search: '<button data-act="search" aria-label="Search">⌕</button>',
    sort: '<button data-act="sort" aria-label="Sort">⇅</button>',
    share: '<button data-act="share" aria-label="Share">⤴</button>',
    gear: '<button data-act="settings" aria-label="Settings">⚙</button>'
  };
  return '<span class="pillbar">' + icons.map(i => map[i]).join('') + '</span>';
}
function toggle(active) {
  return '<div class="toggle">' +
    '<button data-act="go" data-v="todo" class="' + (active === 'todo' ? 'on' : '') + '">To do</button>' +
    '<button data-act="go" data-v="breakdown" class="' + (active === 'breakdown' ? 'on' : '') + '">Breakdown</button></div>';
}
function workingOnBar() {
  if (!S.workingOn) return '';
  const { bd, step } = findStep(S.workingOn.bid, S.workingOn.sid);
  if (!bd || !step) return '';
  return '<button class="workingon" data-act="go" data-v="timer"><b>Working on</b> ' + esc(bd.name) +
    ' <span>· Next: ' + esc(step.text) + '</span></button>';
}
function searchRow() {
  return searchOpen ? '<div class="searchrow"><input id="q" type="text" placeholder="Search" value="' + esc(query) + '"></div>' : '';
}
function fab() { return '<button class="fab" data-act="new-breakdown">+ Break down</button>'; }
function bottomLinks() {
  return '<div class="bottomlinks"><button class="textlink" data-act="go" data-v="all">All breakdowns</button>' +
    '<button class="textlink" data-act="go" data-v="today">Today</button></div>';
}
function checkBtn(done, act, extra) {
  return '<button class="check' + (done ? ' done' : '') + '" data-act="' + act + '" ' + (extra || '') + ' aria-label="Mark done"></button>';
}

/* ---------- To do ---------- */
function viewTodo() {
  let items = S.todos.slice();
  if (sortAlpha) items.sort((a, b) => a.text.localeCompare(b.text));
  if (query) items = items.filter(t => t.text.toLowerCase().includes(query));
  const rows = items.map(td =>
    '<div class="row' + (td.done ? ' done' : '') + '">' + checkBtn(td.done, 'todo-toggle', 'data-id="' + td.id + '"') +
    '<div class="main"><div class="name">' + esc(td.text) + '</div>' +
    (td.repeat ? '<div class="sub">↻ ' + esc(td.repeat) + '</div>' : '') + '</div>' +
    '<button class="x" data-act="todo-del" data-id="' + td.id + '" aria-label="Delete">×</button></div>'
  ).join('');
  const backs = S.todos.filter(t => t.done && t.returnDate);
  const note = backs.length ? '<div class="endnote">↻ ' + backs.length + ' repeat' + (backs.length > 1 ? 's come' : ' comes') +
    ' back ' + esc(nextReturn(backs[0].repeat).label) + '</div>' : '';
  // gentle nudge: past the chosen time, nothing started yet
  let nudge = '';
  const now = new Date(); const hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const smalls = [];
  S.breakdowns.forEach(bd => orderedSteps(bd).forEach(st => { if (!st.done && st.size === 'small') smalls.push(st); }));
  if (!S.stats.stepsDone && hm >= (S.settings.nudgeTime || '10:00') && smalls.length) {
    nudge = '<div class="nudge">Nothing started yet. One small step: <b>' + esc(smalls[0].text) + '</b>. That is enough to begin.</div>';
  }
  return '<div class="fade"><div class="toprow"><span class="spacer"></span>' + toolbar(['search', 'sort', 'gear']) + '</div>' +
    toggle('todo') + '<div class="dateline">' + dateLabel() + '</div>' +
    workingOnBar() + searchRow() + nudge +
    '<div class="list">' + rows +
    '<button class="addrow" data-act="todo-add-open"><span class="dashcircle"></span>Add an item</button>' +
    '<div id="addslot"></div>' + note + '</div></div>' + fab() + bottomLinks();
}

/* ---------- Breakdown ---------- */
function currentBd() { return S.breakdowns.find(b => b.id === S.currentBreakdownId) || S.breakdowns[0] || null; }
function viewBreakdown() {
  const bd = currentBd();
  if (!bd) {
    return '<div class="fade"><div class="toprow"><span class="spacer"></span>' + toolbar(['gear']) + '</div>' + toggle('breakdown') +
      '<div class="dateline">' + dateLabel() + '</div><div class="list"><p class="hint" style="color:var(--grey)">No breakdowns yet. Tap + Break down to make the first one.</p></div></div>' + fab() + bottomLinks();
  }
  const opts = S.breakdowns.map(b => '<option value="' + b.id + '"' + (b.id === bd.id ? ' selected' : '') + '>' + esc(b.name.toLowerCase()) + '</option>').join('');
  const ord = orderedSteps(bd);
  const up = ord.find(s => !s.done);
  const upHtml = up ?
    '<div class="sectlabel">Up next</div><div class="row"><span style="flex:none">' + checkBtn(up.done, 'step-toggle', 'data-bid="' + bd.id + '" data-sid="' + up.id + '"') + '</span>' +
    '<div class="main"><div class="upnext-name">' + esc(up.text) + '</div></div>' +
    '<button class="clock" data-act="timer-open" data-bid="' + bd.id + '" data-sid="' + up.id + '" aria-label="Start timer">◷</button></div>' +
    '<div class="upnext-sub">' + SIZE_LABEL[up.size] + ' · from ' + esc(bd.name.toLowerCase()) + '</div>' +
    '<button class="startbtn" data-act="timer-open" data-bid="' + bd.id + '" data-sid="' + up.id + '">Start timer · ' + sizeMinutes(up.size) + ' min</button>'
    : '<div class="sectlabel">Up next</div><p style="font-family:var(--serif); font-size:20px; margin:8px 0">All done. Well done.</p>';
  const groups = SIZES.map(sz => {
    const steps = bd.steps.filter(s => s.size === sz);
    if (!steps.length) return '';
    const rows = steps.map(st =>
      '<div class="row' + (st.done ? ' done' : '') + '">' + checkBtn(st.done, 'step-toggle', 'data-bid="' + bd.id + '" data-sid="' + st.id + '"') +
      '<div class="main"><div class="name">' + esc(st.text) + '</div></div>' +
      '<button class="clock" data-act="timer-open" data-bid="' + bd.id + '" data-sid="' + st.id + '" aria-label="Start timer">◷</button>' +
      '<button class="x" data-act="step-del" data-bid="' + bd.id + '" data-sid="' + st.id + '" aria-label="Delete">×</button></div>').join('');
    return '<div class="sectlabel">' + sz + '</div>' + rows;
  }).join('');
  return '<div class="fade"><div class="toprow"><span class="spacer"></span>' + toolbar(['gear']) + '</div>' +
    toggle('breakdown') +
    '<div class="dateline">' + dateLabel() + ' · <select id="bdselect" aria-label="Choose breakdown">' + opts + '</select>' +
    ' &nbsp;<button class="textlink" data-act="edit-breakdown">Edit</button></div>' +
    workingOnBar() + upHtml + groups +
    '<div style="margin-top:26px"><button class="textlink" data-act="go" data-v="all">All breakdowns</button></div></div>' + fab();
}

/* ---------- All breakdowns ---------- */
function barsHtml(bd) {
  const counts = { small: 0, medium: 0, big: 0 };
  bd.steps.forEach(s => counts[s.size]++);
  const hs = [];
  for (let i = 0; i < counts.small && hs.length < 5; i++) hs.push(7);
  for (let i = 0; i < counts.medium && hs.length < 8; i++) hs.push(11);
  for (let i = 0; i < counts.big && hs.length < 9; i++) hs.push(16);
  return '<span class="bdbars">' + hs.map(h => '<i style="height:' + h + 'px"></i>').join('') + '</span>';
}
function viewAll() {
  const chips = ['All'].concat(S.folders).map(f =>
    '<button class="chip' + (allFolder === f ? ' on' : '') + '" data-act="folder" data-f="' + esc(f) + '">' +
    (f === 'All' ? '▤ All' : folderIcon(f) + ' ' + esc(f)) + '</button>').join('');
  let list = S.breakdowns.filter(b => allFolder === 'All' || b.folder === allFolder);
  if (sortAlpha) list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
  if (query) list = list.filter(b => b.name.toLowerCase().includes(query));
  const rows = list.map(bd => {
    const done = bd.steps.filter(s => s.done).length;
    const up = orderedSteps(bd).find(s => !s.done);
    return '<div class="bdwrap"><button class="bdrow" data-act="open-bd" data-id="' + bd.id + '">' +
      '<span class="bdicon">' + folderIcon(bd.folder) + '</span>' +
      '<span class="main" style="flex:1"><span class="name" style="font-size:16.5px">' + esc(bd.name) + '</span><br>' +
      '<span style="font-size:13px; color:var(--grey)">' + done + ' of ' + bd.steps.length + (up ? ' · Next: ' + esc(up.text) : ' · Done') + '</span></span>' +
      barsHtml(bd) + '</button></div>';
  }).join('');
  const where = allFolder === 'All' ? 'All' : allFolder;
  return '<div class="fade"><div class="toprow"><button class="circlebtn" data-act="go" data-v="breakdown" aria-label="Back">‹</button>' +
    toolbar(['share', 'search', 'sort']) + '</div>' +
    '<h1 style="font-size:31px; margin-top:12px">All breakdowns</h1>' +
    '<div class="dateline">' + list.length + ' task' + (list.length === 1 ? '' : 's') + ' in ' + esc(where) + '</div>' +
    searchRow() + '<div class="chips">' + chips + '</div>' +
    '<div style="margin-top:10px">' + (rows || '<p style="color:var(--grey)">Nothing here yet.</p>') + '</div></div>' + fab();
}

/* ---------- Today ---------- */
function buildToday(energy) {
  const caps = energy === 'Low' ? { small: 3, medium: 1, big: 0 }
    : energy === 'Okay' ? { small: 5, medium: 2, big: 1 }
    : { small: 99, medium: 99, big: 99 };
  const refs = []; const used = { small: 0, medium: 0, big: 0 };
  SIZES.forEach(sz => {
    S.breakdowns.forEach(bd => bd.steps.forEach(st => {
      if (!st.done && st.size === sz && used[sz] < caps[sz]) { refs.push({ bid: bd.id, sid: st.id }); used[sz]++; }
    }));
  });
  S.today = { date: todayStr(), refs, energy };
  save();
}
function viewToday() {
  const refs = S.today.refs.map(r => ({ r, x: findStep(r.bid, r.sid) })).filter(o => o.x.step);
  const total = refs.length;
  const done = refs.filter(o => o.x.step.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const rows = refs.map(o =>
    '<div class="row' + (o.x.step.done ? ' done' : '') + '">' + checkBtn(o.x.step.done, 'step-toggle', 'data-bid="' + o.r.bid + '" data-sid="' + o.r.sid + '"') +
    '<div class="main"><div class="name">' + esc(o.x.step.text) + '</div>' +
    '<div class="sub">' + SIZE_LABEL[o.x.step.size] + ' · from ' + esc(o.x.bd.name.toLowerCase()) + '</div></div>' +
    '<button class="clock" data-act="timer-open" data-bid="' + o.r.bid + '" data-sid="' + o.r.sid + '" aria-label="Start timer">◷</button></div>').join('');
  const body = total ? '<div class="list">' + rows + '</div>' +
      '<div class="endnote">' + done + ' of ' + total + ' steps done' + (S.today.energy ? ' · ' + esc(S.today.energy) + ' energy day' : '') + '</div>'
    : '<p style="color:var(--grey); line-height:1.5; margin-top:18px">No day built yet. Suggest a day and the app fills it from your open steps, small ones first.</p>';
  return '<div class="fade"><div class="toprow"><span class="spacer"></span>' + toolbar(['gear']) + '</div>' +
    '<h1 class="todaytitle" style="margin-top:10px"><span class="fill" style="--p:' + pct + '%">Today</span></h1>' +
    '<div class="dateline">' + dateLabel() + '</div>' + workingOnBar() + body +
    '<div style="margin-top:22px"><button class="btn" data-act="suggest">Suggest my day</button> ' +
    '<button class="textlink" data-act="go" data-v="todo">To do</button></div></div>' + fab();
}

/* ---------- Timer ---------- */
function startTimer(bid, sid) {
  const { step } = findStep(bid, sid); if (!step) return;
  const phases = step.size === 'big'
    ? [{ label: 'Work', secs: S.settings.pomWork * 60 }, { label: 'Rest', secs: S.settings.pomRest * 60 }, { label: 'Work', secs: S.settings.pomWork * 60 }]
    : [{ label: 'Focus', secs: sizeMinutes(step.size) * 60 }];
  stopTimerInt();
  timer = { bid, sid, phases, idx: 0, total: phases[0].secs, remaining: phases[0].secs, running: false, finished: false, intId: null };
  S.workingOn = { bid, sid }; save();
  view = 'timer'; render();
}
function stopTimerInt() { if (timer && timer.intId) { clearInterval(timer.intId); timer.intId = null; } }
function timerTick() {
  if (!timer || !timer.running) return;
  timer.remaining--;
  if (timer.remaining <= 0) {
    if (timer.idx < timer.phases.length - 1) {
      timer.idx++; timer.total = timer.phases[timer.idx].secs; timer.remaining = timer.total;
    } else { timer.finished = true; timer.running = false; stopTimerInt(); }
  }
  drawTimer();
}
function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function ticksSvg() {
  const totalMin = Math.max(1, Math.round(timer.total / 60));
  const doneMin = Math.min(totalMin, Math.floor((timer.total - timer.remaining) / 60) + (timer.remaining < timer.total ? 1 : 0));
  let ticks = ''; const cx = 110, cy = 110, r1 = 96, r2 = 106;
  for (let i = 0; i < totalMin; i++) {
    const a = (i / totalMin) * Math.PI * 2 - Math.PI / 2;
    const col = i < doneMin ? '#111111' : '#dcdcdc';
    ticks += '<line x1="' + (cx + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (cy + r1 * Math.sin(a)).toFixed(1) +
      '" x2="' + (cx + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (cy + r2 * Math.sin(a)).toFixed(1) + '" stroke="' + col + '" stroke-width="2"/>';
  }
  return '<svg class="tickring" width="220" height="220" viewBox="0 0 220 220">' + ticks + '</svg>';
}
function viewTimer() {
  if (!timer) return '<div class="fade"><p style="color:var(--grey); margin-top:30px">No timer running.</p><button class="textlink" data-act="go" data-v="breakdown">Back to Breakdown</button></div>';
  const { bd, step } = findStep(timer.bid, timer.sid);
  return '<div class="fade"><div class="toprow"><button class="circlebtn" data-act="go" data-v="breakdown" aria-label="Back">‹</button>' + toolbar(['gear']) + '</div>' +
    '<div class="timerwrap" id="timerwrap">' + timerInner(bd, step) + '</div></div>';
}
function timerInner(bd, step) {
  const phase = timer.phases[timer.idx];
  return ticksSvg() +
    '<div class="timernum">' + fmt(timer.remaining) + '</div>' +
    '<div class="timerphase">' + esc(phase.label) + (timer.phases.length > 1 ? ' · block ' + (timer.idx + 1) + ' of ' + timer.phases.length : '') + '</div>' +
    '<div class="timerstep">' + esc(step ? step.text : '') + '</div>' +
    '<div class="timertask">' + SIZE_LABEL[step ? step.size : 'small'] + (bd ? ' · from ' + esc(bd.name.toLowerCase()) : '') + '</div>' +
    '<div class="timerbtns">' +
    (timer.finished ? '<span style="font-family:var(--serif); font-size:19px">Time is up.</span>'
      : '<button class="btn" data-act="timer-toggle">' + (timer.running ? 'Pause' : (timer.remaining < timer.total ? 'Resume' : 'Start')) + '</button>') +
    '<button class="btn solid" data-act="timer-done">Mark done</button></div>';
}
function drawTimer() {
  const wrap = document.getElementById('timerwrap');
  if (!wrap || !timer) return;
  const { bd, step } = findStep(timer.bid, timer.sid);
  wrap.innerHTML = timerInner(bd, step);
}

/* ---------- sheets ---------- */
const sheetRoot = () => document.getElementById('sheet-root');
function closeSheet() { sheetRoot().innerHTML = ''; }
function shapeHtml(steps) {
  const grp = sz => {
    const n = steps.filter(s => s.size === sz).length;
    let dots = '';
    for (let i = 0; i < SHAPE[sz]; i++) dots += '<span class="dot ' + sz[0] + (i < n ? ' full' : '') + '"></span>';
    return '<span class="grp">' + dots + '</span>';
  };
  const over = sz => Math.max(0, steps.filter(s => s.size === sz).length - SHAPE[sz]);
  const extra = SIZES.map(sz => over(sz)).reduce((a, b) => a + b, 0);
  return '<div class="shape">' + SIZES.map(grp).join('') + '</div>' +
    '<div class="cap">Shape: 5 small · 3 medium · 1 big' + (extra ? ' · +' + extra + ' extra, and that is fine' : '') + '</div>';
}
let draft = null; // {id|null, name, folder, steps:[{id,text,size}]}
function openBreakdownSheet(existing) {
  draft = existing
    ? { id: existing.id, name: existing.name, folder: existing.folder, steps: existing.steps.map(s => ({ id: s.id, text: s.text, size: s.size, done: s.done })) }
    : { id: null, name: '', folder: 'Home', steps: [{ id: uid(), text: '', size: 'small' }] };
  drawSheet();
}
function drawSheet() {
  const folderOpts = S.folders.map(f => '<option' + (draft.folder === f ? ' selected' : '') + '>' + esc(f) + '</option>').join('');
  const steps = draft.steps.map((st, i) =>
    '<div>' +
    '<div class="steprow"><input type="text" data-draft="step" data-i="' + i + '" placeholder="Step" value="' + esc(st.text) + '">' +
    '<span class="seg">' + SIZES.map(sz => '<button data-act="draft-size" data-i="' + i + '" data-sz="' + sz + '" class="' + (st.size === sz ? 'on' : '') + '">' + sz[0].toUpperCase() + '</button>').join('') + '</span>' +
    '<button class="x" data-act="draft-del" data-i="' + i + '" aria-label="Remove step">×</button></div>' +
    '<div style="margin:3px 0 2px"><button class="mini" style="color:var(--grey); font-size:12.5px; text-decoration:underline" data-act="draft-split" data-i="' + i + '">Too big? Break it down</button></div>' +
    '<div id="split-' + i + '"></div></div>').join('');
  sheetRoot().innerHTML =
    '<div class="sheet-bg" data-act="sheet-bg"><div class="sheet" id="sheetbox">' +
    '<h2>' + (draft.id ? 'Edit breakdown' : 'Break down a task') + '</h2>' +
    '<p class="hint">Name the big task, then add steps and size each one. Small is 10 minutes or less, medium is 10 to 30, big is over 30.</p>' +
    '<label class="lbl">Task</label><input type="text" id="draft-name" placeholder="Clean the kitchen" value="' + esc(draft.name) + '">' +
    '<label class="lbl">Folder</label><select id="draft-folder">' + folderOpts + '</select>' +
    '<label class="lbl">Steps</label>' + steps +
    '<button class="addrow" data-act="draft-add"><span class="dashcircle"></span>Add a step</button>' +
    '<label class="lbl">Shape so far</label><div id="draft-shape">' + shapeHtml(draft.steps.filter(s => s.text.trim())) + '</div>' +
    '<div class="sheetbtns"><button class="btn" data-act="sheet-close">Cancel</button>' +
    '<button class="btn solid" data-act="draft-save">Save breakdown</button></div>' +
    '</div></div>';
}
function readDraft() {
  const nm = document.getElementById('draft-name'); if (nm) draft.name = nm.value;
  const fo = document.getElementById('draft-folder'); if (fo) draft.folder = fo.value;
  document.querySelectorAll('[data-draft="step"]').forEach(inp => { draft.steps[+inp.dataset.i].text = inp.value; });
}
function openSuggest() {
  sheetRoot().innerHTML = '<div class="sheet-bg" data-act="sheet-bg"><div class="sheet">' +
    '<h2>Suggest my day</h2><p class="hint">How is your energy today? The day is built from your open steps, small ones first and the big one last.</p>' +
    '<div class="energyrow"><button class="btn" data-act="energy" data-e="Low">Low</button>' +
    '<button class="btn" data-act="energy" data-e="Okay">Okay</button>' +
    '<button class="btn" data-act="energy" data-e="High">High</button></div>' +
    '<p class="hint" style="margin-top:14px">Low builds a short day with no big step. Okay fits a normal day. High fills the whole 5, 3, 1 shape and more.</p>' +
    '<div class="sheetbtns"><button class="btn" data-act="sheet-close">Cancel</button></div></div></div>';
}
function openSettings() {
  const st = S.settings;
  sheetRoot().innerHTML = '<div class="sheet-bg" data-act="sheet-bg"><div class="sheet">' +
    '<h2>Settings</h2><p class="hint">Timer times and your one gentle nudge. Everything stays on this device.</p>' +
    '<label class="lbl">Small step minutes</label><input type="number" id="set-small" min="1" max="60" value="' + st.smallMin + '">' +
    '<label class="lbl">Medium step minutes</label><input type="number" id="set-medium" min="1" max="90" value="' + st.mediumMin + '">' +
    '<label class="lbl">Big step: work minutes</label><input type="number" id="set-work" min="1" max="90" value="' + st.pomWork + '">' +
    '<label class="lbl">Big step: rest minutes</label><input type="number" id="set-rest" min="0" max="30" value="' + st.pomRest + '">' +
    '<label class="lbl">Nudge me at</label><input type="time" id="set-nudge" value="' + esc(st.nudgeTime) + '">' +
    '<p class="hint" style="margin-top:8px">One nudge only, shown in the app, and only on days when nothing has started by that time.</p>' +
    '<div class="sheetbtns"><button class="btn" data-act="sheet-close">Cancel</button>' +
    '<button class="btn solid" data-act="settings-save">Save</button></div>' +
    '<button class="danger" data-act="wipe">Delete all my data</button>' +
    '</div></div>';
}

/* ---------- render ---------- */
function render() {
  const app = document.getElementById('app');
  app.innerHTML = view === 'todo' ? viewTodo()
    : view === 'breakdown' ? viewBreakdown()
    : view === 'all' ? viewAll()
    : view === 'today' ? viewToday()
    : viewTimer();
  const q = document.getElementById('q');
  if (q) { q.focus(); q.addEventListener('input', () => { query = q.value.toLowerCase(); render(); const nq = document.getElementById('q'); if (nq) { nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); } }); }
  const sel = document.getElementById('bdselect');
  if (sel) sel.addEventListener('change', () => { S.currentBreakdownId = sel.value; save(); render(); });
}

/* ---------- actions ---------- */
function toggleStep(bid, sid) {
  const { step } = findStep(bid, sid); if (!step) return;
  step.done = !step.done;
  if (step.done) S.stats.stepsDone++; else S.stats.stepsDone = Math.max(0, S.stats.stepsDone - 1);
  if (S.workingOn && S.workingOn.sid === sid && step.done) S.workingOn = null;
  save(); render();
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  if (act === 'go') { view = el.dataset.v; render(); }
  else if (act === 'search') { searchOpen = !searchOpen; if (!searchOpen) query = ''; render(); }
  else if (act === 'sort') { sortAlpha = !sortAlpha; render(); }
  else if (act === 'share') { const url = location.href; if (navigator.share) navigator.share({ title: 'Break down', url }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(url); }
  else if (act === 'settings') openSettings();
  else if (act === 'folder') { allFolder = el.dataset.f; render(); }
  else if (act === 'open-bd') { S.currentBreakdownId = el.dataset.id; save(); view = 'breakdown'; render(); }
  else if (act === 'todo-toggle') {
    const td = S.todos.find(t => t.id === el.dataset.id); if (!td) return;
    td.done = !td.done;
    if (td.done && td.repeat) { const r = nextReturn(td.repeat); td.returnDate = r.key; }
    if (!td.done) td.returnDate = null;
    save(); render();
  }
  else if (act === 'todo-del') { S.todos = S.todos.filter(t => t.id !== el.dataset.id); save(); render(); }
  else if (act === 'todo-add-open') {
    const slot = document.getElementById('addslot');
    if (slot) slot.innerHTML = '<div class="addform"><input type="text" id="newtodo" placeholder="What needs doing?">' +
      '<div class="opts"><select id="newrepeat"><option value="">No repeat</option><option>Every day</option><option>Weekdays</option><option>Weekly</option></select>' +
      '<button class="btn solid" data-act="todo-add">Add</button></div></div>';
    const inp = document.getElementById('newtodo'); if (inp) inp.focus();
  }
  else if (act === 'todo-add') {
    const inp = document.getElementById('newtodo'); const rep = document.getElementById('newrepeat');
    const text = inp ? inp.value.trim() : '';
    if (text) { S.todos.push({ id: uid(), text, repeat: rep && rep.value ? rep.value : null, done: false, returnDate: null }); save(); }
    render();
  }
  else if (act === 'step-toggle') toggleStep(el.dataset.bid, el.dataset.sid);
  else if (act === 'step-del') {
    const { bd } = findStep(el.dataset.bid, el.dataset.sid);
    if (bd) { bd.steps = bd.steps.filter(s => s.id !== el.dataset.sid); save(); render(); }
  }
  else if (act === 'timer-open') startTimer(el.dataset.bid, el.dataset.sid);
  else if (act === 'timer-toggle') {
    if (!timer) return;
    timer.running = !timer.running;
    if (timer.running) { stopTimerInt(); timer.intId = setInterval(timerTick, 1000); }
    else stopTimerInt();
    drawTimer();
  }
  else if (act === 'timer-done') {
    if (!timer) return;
    const { bid, sid } = timer; stopTimerInt(); timer = null;
    view = 'breakdown'; toggleStep(bid, sid);
  }
  else if (act === 'new-breakdown') openBreakdownSheet(null);
  else if (act === 'edit-breakdown') { const bd = currentBd(); if (bd) openBreakdownSheet(bd); }
  else if (act === 'sheet-close') closeSheet();
  else if (act === 'sheet-bg') { if (e.target.classList.contains('sheet-bg')) closeSheet(); }
  else if (act === 'draft-add') { readDraft(); draft.steps.push({ id: uid(), text: '', size: 'small' }); drawSheet(); }
  else if (act === 'draft-del') { readDraft(); draft.steps.splice(+el.dataset.i, 1); if (!draft.steps.length) draft.steps.push({ id: uid(), text: '', size: 'small' }); drawSheet(); }
  else if (act === 'draft-size') { readDraft(); draft.steps[+el.dataset.i].size = el.dataset.sz; drawSheet(); }
  else if (act === 'draft-split') {
    readDraft();
    const i = +el.dataset.i; const slot = document.getElementById('split-' + i);
    if (slot) slot.innerHTML = '<textarea id="splittext-' + i + '" rows="3" placeholder="One smaller step per line"></textarea>' +
      '<div style="margin-top:6px"><button class="btn" data-act="draft-split-go" data-i="' + i + '">Replace with these steps</button></div>';
    const ta = document.getElementById('splittext-' + i); if (ta) ta.focus();
  }
  else if (act === 'draft-split-go') {
    readDraft();
    const i = +el.dataset.i; const ta = document.getElementById('splittext-' + i);
    const lines = ta ? ta.value.split('\n').map(x => x.trim()).filter(Boolean) : [];
    if (lines.length) {
      const news = lines.map(t => ({ id: uid(), text: t, size: 'small' }));
      draft.steps.splice.apply(draft.steps, [i, 1].concat(news));
    }
    drawSheet();
  }
  else if (act === 'draft-save') {
    readDraft();
    const name = draft.name.trim();
    const steps = draft.steps.filter(s => s.text.trim());
    if (!name || !steps.length) { alert('Give the task a name and at least one step.'); return; }
    if (draft.id) {
      const bd = S.breakdowns.find(b => b.id === draft.id);
      if (bd) {
        const doneMap = {}; bd.steps.forEach(s => doneMap[s.id] = s.done);
        bd.name = name; bd.folder = draft.folder;
        bd.steps = steps.map(s => ({ id: s.id || uid(), text: s.text.trim(), size: s.size, done: !!doneMap[s.id] }));
        S.currentBreakdownId = bd.id;
      }
    } else {
      const bd = { id: uid(), name, folder: draft.folder, steps: steps.map(s => ({ id: s.id || uid(), text: s.text.trim(), size: s.size, done: false })) };
      S.breakdowns.push(bd); S.currentBreakdownId = bd.id;
      S.workingOn = null;
    }
    save(); closeSheet(); view = 'breakdown'; render();
  }
  else if (act === 'suggest') openSuggest();
  else if (act === 'energy') { buildToday(el.dataset.e); closeSheet(); view = 'today'; render(); }
  else if (act === 'settings-save') {
    const g = id => document.getElementById(id);
    S.settings.smallMin = Math.max(1, +g('set-small').value || 10);
    S.settings.mediumMin = Math.max(1, +g('set-medium').value || 20);
    S.settings.pomWork = Math.max(1, +g('set-work').value || 25);
    S.settings.pomRest = Math.max(0, +g('set-rest').value || 0);
    S.settings.nudgeTime = g('set-nudge').value || '10:00';
    save(); closeSheet(); render();
  }
  else if (act === 'wipe') {
    if (confirm('Delete all tasks, breakdowns, and settings on this device?')) {
      localStorage.removeItem(KEY); S = seed(); save(); closeSheet(); view = 'todo'; render();
    }
  }
});
document.addEventListener('input', e => {
  if (e.target && e.target.id === 'newtodo') return;
  if (draft && sheetRoot().innerHTML) {
    if (e.target.id === 'draft-name' || e.target.dataset.draft === 'step') {
      readDraft();
      const sh = document.getElementById('draft-shape');
      if (sh) sh.innerHTML = shapeHtml(draft.steps.filter(s => s.text.trim()));
    }
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target && e.target.id === 'newtodo') {
    e.preventDefault();
    const rep = document.getElementById('newrepeat');
    const text = e.target.value.trim();
    if (text) { S.todos.push({ id: uid(), text, repeat: rep && rep.value ? rep.value : null, done: false, returnDate: null }); save(); render(); }
  }
});

load();
render();
