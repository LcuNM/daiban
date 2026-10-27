#!/usr/bin/env node
/**
 * 微信媒体模块：把聊天里的图片 / 视频取出来，放进软件自己的 data/media。
 *
 *   node tools/wxmedia.cjs decrypt --dat <x.dat> --aeskey <32hex> --out <输出目录>
 *       从微信 4.x 的加密 .dat 里解出原图（自动探测偏移与模式）。
 *
 *   node tools/wxmedia.cjs collect --json <聊天记录.json> --out <data/media> [--days 1]
 *       读导出器给的 media 记录（md5 + aeskey），在微信 msg/attach 里找到 .dat 并解密。
 *
 *   node tools/wxmedia.cjs videos --out <data/media/videos> [--days 1]
 *       收集最近的明文 mp4（微信 4.x 的视频本身就是明文）。
 *
 * 结果以 JSON 打印到 stdout：{ images: [...], videos: [...], failed: [...] }
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const HOME = os.homedir();
const DEFAULT_ACCOUNT_ROOT = path.join(HOME, 'Documents', 'xwechat_files');

function findAccountRoots() {
  const roots = [];
  try {
    for (const name of fs.readdirSync(DEFAULT_ACCOUNT_ROOT)) {
      const dir = path.join(DEFAULT_ACCOUNT_ROOT, name);
      if (fs.existsSync(path.join(dir, 'db_storage'))) roots.push(dir);
    }
  } catch {}
  return roots;
}

const MAGICS = [
  { sig: Buffer.from([0xff, 0xd8, 0xff]), ext: 'jpg' },
  { sig: Buffer.from([0x89, 0x50, 0x4e, 0x47]), ext: 'png' },
  { sig: Buffer.from('GIF8'), ext: 'gif' },
  { sig: Buffer.from('RIFF'), ext: 'webp' },
  { sig: Buffer.from('BM'), ext: 'bmp' },
];

function detect(data) {
  for (const m of MAGICS) {
    if (data.length >= m.sig.length && data.subarray(0, m.sig.length).equals(m.sig)) return m.ext;
  }
  return null;
}

function aesDecrypt(keyBuf, data, mode, iv) {
  const algo = mode === 'cbc' ? 'aes-128-cbc' : 'aes-128-ecb';
  const d = crypto.createDecipheriv(algo, keyBuf, mode === 'cbc' ? iv : null);
  d.setAutoPadding(false);
  return Buffer.concat([d.update(data), d.final()]);
}

// 自动探测：先把密文按 16 字节对齐切，尝试各种偏移 / 模式，命中图片魔数就算成功
function decryptDat(data, aeskeyHex) {
  const plain = detect(data);
  if (plain) return { data, ext: plain, how: 'plain' };

  // 旧版单字节 XOR
  for (let k = 0; k < 256; k++) {
    const head = Buffer.from([data[0] ^ k, data[1] ^ k, data[2] ^ k, data[3] ^ k]);
    if (detect(head)) {
      const out = Buffer.allocUnsafe(data.length);
      for (let i = 0; i < data.length; i++) out[i] = data[i] ^ k;
      return { data: out, ext: detect(out), how: 'xor' };
    }
  }

  const key = aeskeyHex && aeskeyHex.length === 32 ? Buffer.from(aeskeyHex, 'hex') : null;
  if (!key) return null;

  const maxOff = Math.min(64, data.length - 32);
  for (let off = 0; off <= maxOff; off++) {
    for (const mode of ['ecb', 'cbc']) {
      const iv = mode === 'cbc' ? Buffer.alloc(16) : null;
      let head;
      try { head = aesDecrypt(key, data.subarray(off, off + 16), mode, iv); } catch { continue; }
      if (!detect(head)) continue;
      // 命中：整段解密（CBC 用前一块当 IV 更稳）
      let body;
      try {
        const iv2 = mode === 'cbc' && off >= 16 ? data.subarray(off - 16, off) : iv;
        body = aesDecrypt(key, data.subarray(off, data.length - ((data.length - off) % 16)), mode, iv2);
      } catch { continue; }
      if (!detect(body)) continue;
      return { data: body, ext: detect(body), how: 'aes-' + mode + '@' + off };
    }
  }
  return null;
}

function pickOut(outDir, md5, ext) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, md5.slice(0, 8) + '.' + ext);
  return file;
}

function cmdDecrypt(args) {
  const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const dat = get('--dat'); const key = get('--aeskey'); const out = get('--out') || path.join(process.cwd(), 'media');
  if (!dat) { console.log('缺少 --dat'); return 1; }
  const data = fs.readFileSync(dat);
  const res = decryptDat(data, key);
  if (!res) { console.log(JSON.stringify({ ok: false, reason: 'decrypt-failed' })); return 2; }
  const file = pickOut(out, path.basename(dat, '.dat'), res.ext);
  fs.writeFileSync(file, res.data);
  console.log(JSON.stringify({ ok: true, file, ext: res.ext, how: res.how }));
  return 0;
}

function findDatByMd5(md5) {
  const hits = [];
  for (const root of findAccountRoots()) {
    const attach = path.join(root, 'msg', 'attach');
    if (!fs.existsSync(attach)) continue;
    for (const conv of fs.readdirSync(attach)) {
      const base = path.join(attach, conv);
      if (!fs.statSync(base).isDirectory()) continue;
      for (const ym of fs.readdirSync(base)) {
        const imgDir = path.join(base, ym, 'Img');
        if (!fs.existsSync(imgDir)) continue;
        for (const f of fs.readdirSync(imgDir)) {
          if (f.startsWith(md5) && f.endsWith('.dat') && !f.includes('_t')) hits.push(path.join(imgDir, f));
        }
      }
    }
  }
  return hits;
}

function cmdCollect(args) {
  const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const jsonPath = get('--json');
  const out = get('--out') || path.join(process.cwd(), 'media');
  if (!jsonPath || !fs.existsSync(jsonPath)) { console.log(JSON.stringify({ images: [], videos: [], failed: [], reason: 'no-json' })); return 0; }
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const msgs = Array.isArray(raw) ? raw : (raw.messages || []);
  const images = []; const failed = [];
  for (const m of msgs) {
    if (!m || !m.media || !m.media.md5) continue;
    const dats = findDatByMd5(m.media.md5);
    if (!dats.length) { failed.push({ md5: m.media.md5, reason: 'no-local-file' }); continue; }
    let done = false;
    for (const dat of dats) {
      const res = decryptDat(fs.readFileSync(dat), m.media.aeskey);
      if (!res) continue;
      const file = pickOut(out, m.media.md5, res.ext);
      fs.writeFileSync(file, res.data);
      images.push({ md5: m.media.md5, file, rel: 'media/' + path.basename(file), how: res.how, time: m.time, sender: m.sender });
      done = true; break;
    }
    if (!done) failed.push({ md5: m.media.md5, reason: 'decrypt-failed' });
  }
  console.log(JSON.stringify({ images, videos: [], failed }));
  return 0;
}

function cmdVideos(args) {
  const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const out = get('--out') || path.join(process.cwd(), 'media', 'videos');
  const days = Number(get('--days') || 1);
  const since = Date.now() - days * 86400000;
  const videos = [];
  for (const root of findAccountRoots()) {
    const vdir = path.join(root, 'msg', 'video');
    if (!fs.existsSync(vdir)) continue;
    for (const ym of fs.readdirSync(vdir)) {
      const dir = path.join(vdir, ym);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const f of fs.readdirSync(dir)) {
        if (!f.toLowerCase().endsWith('.mp4') || f.includes('_raw')) continue;
        const src = path.join(dir, f);
        const st = fs.statSync(src);
        if (st.mtimeMs < since) continue;
        fs.mkdirSync(out, { recursive: true });
        const dest = path.join(out, f);
        try { fs.copyFileSync(src, dest); } catch { continue; }
        videos.push({ file: dest, rel: 'media/videos/' + f, mtime: st.mtime.toISOString(), bytes: st.size });
      }
    }
  }
  videos.sort((a, b) => b.mtime.localeCompare(a.mtime));
  console.log(JSON.stringify({ images: [], videos, failed: [] }));
  return 0;
}

const [cmd, ...rest] = process.argv.slice(2);
let code = 0;
if (cmd === 'decrypt') code = cmdDecrypt(rest);
else if (cmd === 'collect') code = cmdCollect(rest);
else if (cmd === 'videos') code = cmdVideos(rest);
else console.log('用法：node tools/wxmedia.cjs [decrypt | collect | videos] ...');
process.exit(code);
