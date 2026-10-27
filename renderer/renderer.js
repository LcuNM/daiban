const $ = (sel) => document.querySelector(sel);

const state = {
  points: [],
  config: { groups: [], lastRun: null },
  currentId: null,
  filter: '',
  editing: null,
  chats: null,
  dataDir: '',
  autoTitle: '',
};

// 从内容里取一段摘要当名字（去掉 markdown 标记，取第一行）
function summarize(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let s = (lines[0] || '').replace(/^[-*·]\s+/, '');
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '［图片］')
       .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
       .replace(/https?:\/\/\S+/g, '［链接］');
  s = s.trim();
  if (s.length > 8) s = s.slice(0, 8) + '…';
  return s || '未命名要点';
}

const CATS = ['通知', '待办', '学业', '活动', '闲聊', '其他'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// ---------- 渲染 ----------
function visiblePoints() {
  return state.points.filter((p) => !state.filter || p.category === state.filter);
}

function renderList() {
  const list = $('#list');
  const items = visiblePoints();
  if (!items.length) {
    list.innerHTML = '<div class="hint" style="padding:18px">还没有要点喵。点下面「＋ 新建要点」，或等每天 20:00 自动总结喵。</div>';
  } else {
    list.innerHTML = items.map((p) => {
      const idx = p.index || 0;
      const cat = p.category || '其他';
      const sub = [p.group, p.date].filter(Boolean).join(' · ');
      return '<div class="item' + (p.id === state.currentId ? ' active' : '') + '" data-id="' + esc(p.id) + '">'
        + '<div class="idx">' + idx + '</div>'
        + '<div class="meta"><div class="name">' + esc(p.title || ('要点' + idx))
        + '<span class="cat cat-' + esc(cat) + '">' + esc(cat) + '</span></div>'
        + '<div class="sub">' + esc(sub) + '</div></div></div>';
    }).join('');
  }
  const cats = Array.from(new Set(state.points.map((p) => p.category).filter(Boolean)));
  const sel = $('#filter');
  sel.innerHTML = '<option value="">全部分类</option>' + cats.map((c) =>
    '<option value="' + esc(c) + '"' + (c === state.filter ? ' selected' : '') + '>' + esc(c) + '</option>').join('');
}

// 把 media/xxx.jpg 这类相对路径转成 file:// 绝对地址
function fileUrl(rel) {
  const p = String(rel || '').replace(/\\/g, '/');
  if (/^(https?:|file:|data:)/i.test(p)) return p;
  if (/^[a-zA-Z]:/.test(p)) return 'file:///' + p;
  const base = String(state.dataDir || '').replace(/\\/g, '/');
  return 'file:///' + base + '/' + p;
}

const VIDEO_RE = /\.(mp4|mov|webm|mkv|avi)(\?.*)?$/i;

// 行内渲染：图片 / 视频 / 链接 / 裸网址
function renderInline(text) {
  let s = esc(text);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
    const url = fileUrl(src);
    const label = esc(alt || '');
    if (VIDEO_RE.test(src)) {
      return '<video controls preload="metadata" src="' + url + '"></video>'
        + (label ? '<div class="doc-media-note">' + label + '</div>' : '');
    }
    return '<img src="' + url + '" alt="' + label + '" loading="lazy">';
  });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, href) => {
    const h = /^(https?:|mailto:)/i.test(href) ? href : fileUrl(href);
    return '<a href="' + h + '">' + txt + '</a>';
  });
  s = s.replace(/(^|[\s(])((?:https?:\/\/)[^\s<"）]+)/g, (m, pre, url) => {
    return pre + '<a href="' + url + '">' + url + '</a>';
  });
  return s;
}

function bodyToHtml(text) {
  const lines = String(text || '').split(/\r?\n/);
  let html = '';
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { if (inList) { html += '</ul>'; inList = false; } continue; }
    const m = /^[-*·]\s+(.*)$/.exec(line);
    if (m) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + renderInline(m[1]) + '</li>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p>' + renderInline(line) + '</p>';
    }
  }
  if (inList) html += '</ul>';
  return html || '<p class="hint">（没有内容）</p>';
}

function renderDetail() {
  const p = state.points.find((x) => x.id === state.currentId);
  const body = $('#body');
  $('#btn-edit').hidden = !p;
  $('#btn-del').hidden = !p;
  if (!p) {
    $('#crumb').textContent = '待办';
    body.innerHTML = '<div class="empty"><div class="empty-mark"></div><h1>还没有选中的要点</h1><p>从左边挑一条，或者新建一条喵</p></div>';
    return;
  }
  $('#crumb').textContent = p.title || ('要点' + p.index);
  const meta = [p.group, p.date, p.category].filter(Boolean).join(' · ');
  body.innerHTML = '<h1 class="doc-title">' + esc(p.title || ('要点' + p.index)) + '</h1>'
    + '<div class="doc-meta">' + esc(meta) + '</div>'
    + '<div class="doc-body">' + bodyToHtml(p.body) + '</div>';
}

function render() { renderList(); renderDetail(); }

function insertAtCursor(text) {
  const ta = $('#f-body');
  const start = ta.selectionStart || 0;
  const end = ta.selectionEnd || 0;
  const value = ta.value;
  const needsNl = start > 0 && value[start - 1] !== '\n';
  const insert = (needsNl ? '\n' : '') + text;
  ta.value = value.slice(0, start) + insert + value.slice(end);
  const pos = start + insert.length;
  ta.setSelectionRange(pos, pos);
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}

async function insertMedia(kind) {
  const picked = await window.digest.pickMedia(kind);
  if (!picked) return;
  const label = kind === 'video' ? '视频' : '图片';
  insertAtCursor('![' + label + '](' + picked.rel + ')');
}

// ---------- 弹窗：新建/编辑要点 ----------
function fillGroupSelect() {
  const sel = $('#f-group');
  const groups = state.config.groups || [];
  sel.innerHTML = '<option value="">（不指定）</option>'
    + groups.map((g) => '<option value="' + esc(g.name) + '">' + esc(g.name) + '</option>').join('');
}

function openEditor(point) {
  state.editing = point || null;
  $('#modal-title').textContent = point ? '编辑要点' : '新建要点';
  fillGroupSelect();
  $('#f-title').value = point ? (point.title || '') : '';
  state.autoTitle = point ? '' : '';
  $('#f-category').value = point && CATS.includes(point.category) ? point.category : '其他';
  $('#f-group').value = point && point.group ? point.group : '';
  $('#f-date').value = (point && point.date) || today();
  $('#f-body').value = (point && point.body) || '';
  $('#modal').hidden = false;
  $('#f-body').focus();
}

async function saveEditor() {
  const body = $('#f-body').value;
  const typedTitle = $('#f-title').value.trim();
  const payload = {
    id: state.editing ? state.editing.id : undefined,
    title: typedTitle || summarize(body),
    category: $('#f-category').value,
    group: $('#f-group').value,
    date: $('#f-date').value,
    body,
    source: state.editing ? state.editing.source : 'manual',
  };
  state.points = await window.digest.savePoint(payload);
  if (!state.editing) {
    // 新条目是最新的第 index 个
    const latest = state.points[0];
    if (latest) state.currentId = latest.id;
  }
  $('#modal').hidden = true;
  state.editing = null;
  render();
}

// ---------- 设置 ----------
function renderChatList() {
  const box = $('#chat-list');
  const chosen = new Set((state.config.groups || []).map((g) => g.id));
  if (!state.chats) { box.innerHTML = '<div class="hint" style="padding:10px">点上面「读取会话列表」喵</div>'; return; }
  const rows = (state.chats.chats || []).map((c) => {
    const on = chosen.has(c.username) ? ' checked' : '';
    return '<label class="chat-row"><input type="checkbox" value="' + esc(c.username) + '" data-name="' + esc(c.name) + '" data-type="' + esc(c.type) + '"' + on + '>'
      + '<span>' + esc(c.name) + '</span><span class="type">' + (c.type === 'group' ? '群聊' : '好友') + '</span></label>';
  }).join('');
  box.innerHTML = rows || '<div class="hint" style="padding:10px">没有找到会话喵</div>';
}

function openSettings() {
  state.chats = null;
  $('#s-apikey').value = state.config.apiKey || '';
  $('#s-model').value = state.config.model || 'deepseek-chat';
  renderChatList();
  $('#chats-status').textContent = '';
  $('#last-run').textContent = state.config.lastRun ? ('上次自动总结：' + state.config.lastRun) : '还没跑过自动总结喵';
  $('#settings').hidden = false;
}

async function loadChats() {
  $('#chats-status').textContent = '读取中…（要微信登录着）';
  const res = await window.digest.listChats('');
  if (res.ok) {
    state.chats = res.data;
    $('#chats-status').textContent = '共 ' + (res.data.chat_count || 0) + ' 个会话喵';
    renderChatList();
  } else {
    $('#chats-status').textContent = '读取失败：' + res.error;
  }
}

async function saveSettings() {
  const rows = Array.from(document.querySelectorAll('#chat-list input[type=checkbox]'));
  const groups = rows.filter((r) => r.checked).map((r) => ({ id: r.value, name: r.dataset.name, type: r.dataset.type }));
  state.config = await window.digest.saveConfig({
    groups,
    apiKey: $('#s-apikey').value.trim(),
    model: $('#s-model').value,
  });
  $('#settings').hidden = true;
}

// ---------- 事件 ----------
function bind() {
  $('#list').addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (!item) return;
    state.currentId = item.dataset.id;
    render();
  });
  $('#btn-new').addEventListener('click', () => openEditor(null));
  $('#btn-edit').addEventListener('click', () => {
    const p = state.points.find((x) => x.id === state.currentId);
    if (p) openEditor(p);
  });
  $('#btn-del').addEventListener('click', async () => {
    const p = state.points.find((x) => x.id === state.currentId);
    if (!p) return;
    if (!confirm('删除「' + (p.title || '要点') + '」？')) return;
    state.points = await window.digest.deletePoint(p.id);
    state.currentId = null;
    render();
  });
  // 输入内容时，如果名字没手动改过，就自动用摘要
  $('#f-body').addEventListener('input', () => {
    const t = $('#f-title');
    const cur = t.value.trim();
    if (!cur || cur === state.autoTitle) {
      const auto = summarize($('#f-body').value);
      state.autoTitle = auto;
      t.value = auto;
      t.dataset.auto = '1';
    }
  });
  $('#f-title').addEventListener('input', () => { delete $('#f-title').dataset.auto; });

  $('#btn-ins-img').addEventListener('click', () => insertMedia('image'));
  $('#btn-ins-video').addEventListener('click', () => insertMedia('video'));
  $('#btn-ins-link').addEventListener('click', () => {
    const url = prompt('链接地址（https://…）');
    if (!url) return;
    const text = prompt('显示文字（留空就用网址本身）') || url;
    insertAtCursor('[' + text + '](' + url + ')');
  });

  // 阅读区里的链接用系统浏览器打开，不在窗口内跳走
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    e.preventDefault();
    window.digest.openExternal(a.getAttribute('href'));
  });

  $('#m-cancel').addEventListener('click', () => { $('#modal').hidden = true; state.editing = null; });
  $('#m-save').addEventListener('click', saveEditor);
  $('#filter').addEventListener('change', (e) => { state.filter = e.target.value; render(); });
  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-load-chats').addEventListener('click', loadChats);
  $('#s-cancel').addEventListener('click', () => { $('#settings').hidden = true; });
  $('#s-save').addEventListener('click', saveSettings);
  $('#btn-open-data').addEventListener('click', () => window.digest.openData());

  // 一键生成 + 时间范围菜单
  $('#btn-gen-menu').addEventListener('click', (e) => {
    e.stopPropagation();
    const m = $('#gen-menu');
    m.hidden = !m.hidden;
  });
  document.addEventListener('click', () => { $('#gen-menu').hidden = true; });
  document.querySelectorAll('#gen-menu button').forEach((b) => {
    b.addEventListener('click', () => {
      $('#gen-menu').hidden = true;
      runDigest(Number(b.dataset.days));
    });
  });
  $('#btn-gen').addEventListener('click', () => runDigest(1));

  // 右下角聊天气泡
  $('#fab').addEventListener('click', openChatPanel);
  $('#cp-close').addEventListener('click', () => { $('#chat-panel').hidden = true; $('#fab').classList.remove('open'); });
  $('#cp-save').addEventListener('click', savePanelSelection);
  $('#cp-q').addEventListener('input', (e) => renderPanelList(e.target.value));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $('#modal').hidden = true; $('#settings').hidden = true; state.editing = null; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !$('#modal').hidden) saveEditor();
  });
}

// ---------- 右下角聊天气泡：选微信群聊 ----------
function renderPanelList(keyword) {
  const box = $('#cp-list');
  const chosen = new Set((state.config.groups || []).map((g) => g.id));
  const all = state.chats ? (state.chats.chats || []) : [];
  const kw = (keyword || '').trim();
  const rows = all
    .filter((c) => c.type === 'group')
    .filter((c) => !kw || String(c.name || '').includes(kw))
    .map((c) => {
      const on = chosen.has(c.username);
      return '<label class="chat-row' + (on ? ' on' : '') + '">'
        + '<input type="checkbox" value="' + esc(c.username) + '" data-name="' + esc(c.name) + '" data-type="' + esc(c.type) + '"' + (on ? ' checked' : '') + '>'
        + '<span>' + esc(c.name) + '</span></label>';
    }).join('');
  box.innerHTML = rows || '<div class="hint" style="padding:10px">'
    + (state.chats ? '没有匹配的群聊喵' : '点一下气泡会自动读会话列表喵') + '</div>';
  box.querySelectorAll('input[type=checkbox]').forEach((cb) => {
    cb.addEventListener('change', () => cb.closest('.chat-row').classList.toggle('on', cb.checked));
  });
}

async function openChatPanel() {
  const panel = $('#chat-panel');
  const fab = $('#fab');
  if (!panel.hidden) { panel.hidden = true; fab.classList.remove('open'); return; }
  panel.hidden = false;
  fab.classList.add('open');
  $('#cp-q').value = '';
  if (!state.chats) {
    $('#cp-status').textContent = '读取会话中…';
    $('#cp-list').innerHTML = '<div class="hint" style="padding:10px">读取中…（微信要登录着）喵</div>';
    const res = await window.digest.listChats('');
    if (res.ok) {
      state.chats = res.data;
      $('#cp-status').textContent = '共 ' + (res.data.chat_count || 0) + ' 个会话';
    } else {
      $('#cp-status').textContent = '读取失败';
      $('#cp-list').innerHTML = '<div class="hint" style="padding:10px">读取失败：' + esc(res.error) + '</div>';
      return;
    }
  } else {
    $('#cp-status').textContent = '共 ' + ((state.chats && state.chats.chat_count) || 0) + ' 个会话';
  }
  renderPanelList('');
}

async function savePanelSelection() {
  const rows = Array.from(document.querySelectorAll('#cp-list input[type=checkbox]'));
  const picked = rows.filter((r) => r.checked).map((r) => ({ id: r.value, name: r.dataset.name, type: r.dataset.type }));
  // 保留之前选过、但本轮列表被搜索过滤掉的那些群
  const pickedIds = new Set(picked.map((p) => p.id));
  const kept = (state.config.groups || []).filter((g) => {
    if (pickedIds.has(g.id)) return false;
    return !rows.some((r) => r.value === g.id);
  });
  const groups = kept.concat(picked);
  state.config = await window.digest.saveConfig({ groups });
  $('#cp-status').textContent = '已保存 ' + groups.length + ' 个群喵';
  setTimeout(() => { $('#chat-panel').hidden = true; $('#fab').classList.remove('open'); }, 500);
}

async function runDigest(days) {
  const btn = $('#btn-gen');
  const status = $('#gen-status');
  btn.disabled = true;
  status.textContent = '正在读取近 ' + days + ' 天的聊天…（要等一会儿）';
  try {
    const res = await window.digest.runDigest(days);
    if (!res.ok) {
      status.textContent = res.needsKey ? String(res.error) : ('生成失败：' + String(res.error || '').split('\n').pop());
      return;
    }
    const skipped = Number(res.skipped) || 0;
    status.textContent = skipped
      ? ('完成！新增 ' + (res.added || 0) + ' 条要点，另外 ' + skipped + ' 条跟已有的重复、已跳过喵')
      : ('完成！新增 ' + (res.added || 0) + ' 条要点，原始聊天记录已删除喵');
    const data = await window.digest.load();
    state.points = data.points || [];
    state.config = data.config || state.config;
    render();
  } catch (err) {
    status.textContent = '出错：' + err;
  } finally {
    btn.disabled = false;
  }
}

async function init() {
  const data = await window.digest.load();
  state.points = data.points || [];
  state.config = data.config || { groups: [] };
  if (state.points.length) state.currentId = state.points[0].id;
  try {
    const p = await window.digest.paths();
    state.dataDir = p.data;
  } catch { state.dataDir = ''; }
  bind();
  render();
}

init();
