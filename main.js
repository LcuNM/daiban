const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const POINTS = path.join(DATA, 'points.json');
const CONFIG = path.join(DATA, 'config.json');

// 全部内置在软件目录里（vendor/wechat-export + runtime/venv），不依赖外部 skill 安装
const DEFAULT_CONFIG = {
  python: path.join(ROOT, 'runtime', 'venv', 'Scripts', 'python.exe'),
  exporter: path.join(ROOT, 'vendor', 'wechat-export', 'scripts', 'export_wechat.py'),
  groups: [],
  lastRun: null,
};

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}
function loadConfig() {
  const cfg = Object.assign({}, DEFAULT_CONFIG, readJson(CONFIG, {}));
  // 早期版本可能指向外部 skill 路径，统一迁移到软件自带的 runtime / vendor
  if (!fs.existsSync(cfg.python)) cfg.python = DEFAULT_CONFIG.python;
  if (!fs.existsSync(cfg.exporter)) cfg.exporter = DEFAULT_CONFIG.exporter;
  writeJson(CONFIG, cfg);
  return cfg;
}
/** 标题指纹：去掉空白和标点、转小写，用来判断是不是同一条要点 */
function normalizeKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[，。、！？：；,.!?:;'"“”‘’()（）【】\[\]<>《》\-—_\u002f\\|~·…]/g, '');
}

/** 字符集合相似度：抓「提交证件复印件」和「证件复印件提交」这种打乱语序的同一条 */
function keySimilarity(a, b) {
  const setA = new Set(String(a || '').split(''));
  const setB = new Set(String(b || '').split(''));
  if (!setA.size || !setB.size) return 0;
  let hit = 0;
  for (const ch of setA) if (setB.has(ch)) hit++;
  return hit / Math.max(setA.size, setB.size);
}

/** 两条要点算不算同一件事：完全相同 / 互相包含（都≥3字）/ 字符相似度≥0.7（都≥4字） */
function sameTitle(a, b) {
  const key = normalizeKey(a);
  const other = normalizeKey(b);
  if (!key || !other) return false;
  if (key === other) return true;
  if (key.length >= 3 && other.length >= 3 && (key.includes(other) || other.includes(key))) return true;
  if (key.length >= 4 && other.length >= 4 && keySimilarity(key, other) >= 0.7) return true;
  return false;
}

/** 标题是不是已经存在（用来去重：同一件事只留一条） */
function alreadyHave(title, titles) {
  return (titles || []).some((t) => sameTitle(title, t));
}

function loadPoints() {
  const list = readJson(POINTS, []);
  return Array.isArray(list) ? list : [];
}
function nextIndex(points) {
  return points.reduce((max, p) => Math.max(max, Number(p.index) || 0), 0) + 1;
}

function listChats(keyword) {
  const cfg = loadConfig();
  const args = ['-B', cfg.exporter, '--list-chats'];
  if (keyword) args.push(keyword);
  const raw = execFileSync(cfg.python, args, { encoding: 'utf8', timeout: 240000, windowsHide: true });
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('{')) return JSON.parse(lines[i]);
  }
  throw new Error('未拿到会话列表');
}

function logLine(msg) {
  try { fs.appendFileSync(path.join(DATA, 'app.log'), new Date().toISOString() + ' ' + msg + '\n'); } catch {}
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 880,
    minHeight: 560,
    backgroundColor: '#ffffff',
    icon: path.join(ROOT, 'assets', 'icon.ico'),
    title: '待办',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  logLine('create window, loading renderer');
  win.loadFile(path.join(ROOT, 'renderer', 'index.html'));
  win.once('ready-to-show', () => { logLine('ready-to-show'); win.show(); win.focus(); });
  win.webContents.on('render-process-gone', (_e, d) => logLine('render gone: ' + JSON.stringify(d)));
  win.webContents.on('did-fail-load', (_e, code, desc) => logLine('load fail ' + code + ' ' + desc));
  if (process.env.DIGEST_DEBUG) {
    win.webContents.once('did-finish-load', async () => {
      const probe = "JSON.stringify({innerH: innerHeight, innerW: innerWidth, dpr: devicePixelRatio,"
        + " app: document.querySelector('.app').getBoundingClientRect(),"
        + " foot: document.querySelector('.side-foot') ? document.querySelector('.side-foot').getBoundingClientRect() : null,"
        + " fab: document.querySelector('#fab') ? document.querySelector('#fab').getBoundingClientRect() : null,"
        + " bodyH: document.body.scrollHeight, sideW: getComputedStyle(document.querySelector('.side')).width})";
      try {
        const info = await win.webContents.executeJavaScript(probe);
        fs.writeFileSync(path.join(DATA, 'debug.json'), info, 'utf8');
      } catch (err) {
        fs.writeFileSync(path.join(DATA, 'debug.json'), String(err && err.stack || err), 'utf8');
      }
    });
  }
  return win;
}

ipcMain.handle('state:load', () => ({
  points: loadPoints(),
  config: loadConfig(),
}));

ipcMain.handle('points:save', (_e, point) => {
  const points = loadPoints();
  const now = new Date().toISOString();
  if (point && point.id) {
    const i = points.findIndex((p) => p.id === point.id);
    if (i >= 0) { points[i] = Object.assign({}, points[i], point, { updatedAt: now }); }
  } else {
    const index = nextIndex(points);
    points.unshift({
      id: 'p' + Date.now(),
      index,
      title: (point && point.title) || ('要点' + index),
      group: (point && point.group) || '',
      date: (point && point.date) || now.slice(0, 10),
      category: (point && point.category) || '其他',
      body: (point && point.body) || '',
      source: (point && point.source) || 'manual',
      createdAt: now,
      updatedAt: now,
    });
  }
  points.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.index || 0) - (a.index || 0));
  writeJson(POINTS, points);
  return points;
});

ipcMain.handle('points:delete', (_e, id) => {
  const points = loadPoints().filter((p) => p.id !== id);
  writeJson(POINTS, points);
  return points;
});

ipcMain.handle('config:save', (_e, config) => {
  const cfg = Object.assign({}, loadConfig(), config || {});
  writeJson(CONFIG, cfg);
  return cfg;
});

ipcMain.handle('chats:list', (_e, keyword) => {
  try { return { ok: true, data: listChats(keyword) }; }
  catch (error) { return { ok: false, error: String(error && error.message || error) }; }
});

ipcMain.handle('shell:open-data', () => {
  shell.openPath(DATA);
});

ipcMain.handle('shell:open-external', (_e, url) => {
  if (typeof url === 'string' && /^(https?:|mailto:)/i.test(url)) shell.openExternal(url);
  return true;
});

ipcMain.handle('app:paths', () => ({ data: DATA }));

const AI_SYSTEM = [
  '你是聊天整理助手。把给你的群聊记录总结成若干条要点，只输出 JSON。',
  '输出格式：{"points":[{"title":"…","category":"通知|待办|学业|活动|闲聊","body":"- …\n- …"}]}',
  '要求：title 不超过 8 个汉字、能一眼看出是什么事；body 每行以「- 」开头，保留人名、时间、数字、链接；',
  '忽略纯表情、接龙、起哄；同一件事合并成一条；没有实质内容就返回空数组。',
].join('\n');

async function aiSummarize(cfg, sectionText, groupName, knownTitles) {
  const apiBase = String(cfg.apiBase || 'https://api.deepseek.com').replace(/\/$/, '');
  const res = await fetch(apiBase + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.apiKey },
    body: JSON.stringify({
      model: cfg.model || 'deepseek-chat',
      temperature: 0.2,
      stream: false,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: AI_SYSTEM },
        {
          role: 'user',
          content: ((knownTitles && knownTitles.length)
            ? '（注意：下面这些是要点列表里已经有的，同一件事不要再重复输出，也不要换个说法重写：'
              + knownTitles.join('、') + '）\n\n'
            : '') + '群聊：' + groupName + '\n\n' + sectionText,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error('AI 接口 ' + res.status + '：' + (await res.text()).slice(0, 200));
  const data = await res.json();
  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '{}';
  let parsed = {};
  try { parsed = JSON.parse(content); } catch { return []; }
  const list = Array.isArray(parsed.points) ? parsed.points : [];
  return list.filter((p) => p && p.body).map((p) => ({
    title: String(p.title || '').slice(0, 12),
    category: String(p.category || '其他'),
    group: groupName,
    date: new Date().toISOString().slice(0, 10),
    body: String(p.body),
    source: 'auto',
  }));
}

ipcMain.handle('digest:run', async (_e, days) => {
  const nodeExe = process.execPath;
  const script = path.join(ROOT, 'tools', 'digest-daily.cjs');
  const minutes = String(Math.max(1, Number(days) || 1) * 1440);
  try {
    const out = require('child_process').execFileSync(nodeExe, [script, 'export', '--minutes', minutes], {
      encoding: 'utf8', timeout: 1800000, windowsHide: true, cwd: ROOT,
    });
    const inbox = (/INBOX=(.+)/.exec(out) || [])[1] || '';
    const summary = (/SUMMARY=(.+)/.exec(out) || [])[1] || '';
    try {
      fs.writeFileSync(path.join(DATA, 'pending.json'), JSON.stringify({
        inbox: inbox.trim(), summary: summary.trim(), days: Number(days) || 1,
        createdAt: new Date().toISOString(),
      }, null, 2), 'utf8');
    } catch {}
    // 没有勾选群 / 没导出成功就直接返回
    if (!summary.trim() || !fs.existsSync(summary.trim())) {
      return { ok: false, error: out.split('\n').filter(Boolean).slice(-2).join(' ') || '没有导出内容' };
    }
    const cfg = loadConfig();
    if (!cfg.apiKey) {
      return { ok: false, needsKey: true, error: '还没填 AI 密钥：点右上角 ⚙ 填一个 DeepSeek API Key 就能自动总结了' };
    }
    // 按群切分，逐群让 AI 总结
    const text = fs.readFileSync(summary.trim(), 'utf8');
    const blocks = text.split(/\n## /).slice(1);
    const all = [];
    const errors = [];
    // 已经把有的要点标题：既提示 AI 别重复，生成完也按这个去重
    const existingTitles = loadPoints().map((p) => p.title).filter(Boolean);
    const knownTitles = existingTitles.slice(-40);
    for (const block of blocks) {
      const nl = block.indexOf('\n');
      const groupName = block.slice(0, nl < 0 ? block.length : nl).replace(/（.*$/, '').trim();
      try {
        const items = await aiSummarize(cfg, block.slice(0, 60000), groupName, knownTitles);
        all.push(...items);
      } catch (err) {
        errors.push(groupName + '：' + String(err && err.message || err).slice(0, 160));
      }
    }
    if (!all.length) {
      return { ok: false, error: errors.length ? errors.join('；') : '这次没总结出要点（可能是这段时间没实质内容）' };
    }
    // 去重：跟列表里已有的重复就丢掉；同一批里撞车的也只留第一条
    const fresh = [];
    let skipped = 0;
    for (const item of all) {
      if (alreadyHave(item.title, existingTitles.concat(fresh.map((f) => f.title)))) { skipped++; continue; }
      fresh.push(item);
    }
    if (!fresh.length) {
      return { ok: true, added: 0, skipped, log: '这次总结出来的 ' + skipped + ' 条都是已经有的，已全部跳过喵' };
    }
    const ptsFile = path.join(inbox.trim() || DATA, '要点.json');
    fs.writeFileSync(ptsFile, JSON.stringify(fresh, null, 2), 'utf8');
    const commitOut = require('child_process').execFileSync(process.execPath, [
      script, 'commit', '--inbox', inbox.trim(), '--points', ptsFile,
    ], { encoding: 'utf8', timeout: 120000, windowsHide: true, cwd: ROOT });
    fs.writeFileSync(path.join(DATA, 'pending.json'), JSON.stringify({ done: true, at: new Date().toISOString() }, null, 2), 'utf8');
    return { ok: true, added: fresh.length, skipped, log: (commitOut + '\n' + errors.join('\n')).slice(-2000) };
  } catch (error) {
    const msg = String((error && error.stdout) || '') + String((error && error.message) || error);
    return { ok: false, error: msg.slice(-2000) };
  }
});

ipcMain.handle('media:pick', async (_e, kind) => {
  const isVideo = kind === 'video';
  const res = await dialog.showOpenDialog({
    title: isVideo ? '选择视频' : '选择图片',
    properties: ['openFile'],
    filters: isVideo
      ? [{ name: '视频', extensions: ['mp4', 'mov', 'webm', 'mkv', 'avi'] }]
      : [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'] }],
  });
  if (res.canceled || !res.filePaths.length) return null;
  const src = res.filePaths[0];
  const mediaDir = path.join(DATA, 'media');
  fs.mkdirSync(mediaDir, { recursive: true });
  const destName = Date.now() + '_' + path.basename(src).replace(/[\\/:*?"<>|]/g, '_');
  fs.copyFileSync(src, path.join(mediaDir, destName));
  return { rel: 'media/' + destName, name: path.basename(src) };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
