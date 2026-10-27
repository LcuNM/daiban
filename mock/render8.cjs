const { app, BrowserWindow } = require('electron');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FP = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffprobe.exe';
const VID = 'C:/Users/elysia/.dsh/chat-digest/video';
const OUT = path.join(VID, 'v8seg');
const IMG = 'file:///C:/Users/elysia/.dsh/chat-digest/mock/out/';
const FPS = 60;
const TAIL = 1.7;
fs.mkdirSync(OUT, { recursive: true });
const SEGS = require('./segs.js');

function wrap(t, n){
  const o = []; let s = String(t || '');
  const punct = '，。、；：？！）】」…';
  const word = (c) => /[A-Za-z0-9]/.test(c || '');
  while (s.length > n) {
    let cut = n;
    while (cut > 0 && punct.indexOf(s[cut]) >= 0) cut--;
    if (cut <= 0) cut = n;
    if (word(s[cut]) && word(s[cut - 1])) {
      let k = cut; while (k > 0 && word(s[k - 1])) k--;
      if (k >= Math.floor(n * 0.55)) cut = k;
    }
    o.push(s.slice(0, cut)); s = s.slice(cut);
  }
  o.push(s); return o.join('||');
}
function probe(p){ return Number(execFileSync(FP, ['-v','error','-show_entries','format=duration','-of','csv=p=0', p], { encoding:'utf8' }).trim()); }

const subs = {};
for (const f of fs.readdirSync(path.join(VID, 'sub'))) subs[Number(f.replace('sub','').replace('.txt',''))] = fs.readFileSync(path.join(VID,'sub',f),'utf8').replace(/\n/g,'').trim();


app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1920, height: 1080, show: false, frame: false, webPreferences: { contextIsolation: true } });
  win.setContentSize(1920, 1080);
  await win.loadFile(path.join(__dirname, 'scene.html'));
  await new Promise(r => setTimeout(r, 500));

  const only = process.argv[2] ? [Number(process.argv[2])] : null;
  for (const s of SEGS) {
    if (only && !only.includes(s.idx)) continue;
    const audio = path.join(VID, 'audio', 'seg' + String(s.idx).padStart(2,'0') + '.wav');
    const dur = probe(audio) + TAIL;
    const data = { idx: s.idx, tag: s.tag, title: s.title, points: s.points, img: IMG + s.img, zoom: s.zoom, focus: s.focus, cap: wrap(subs[s.idx], 22), dur: dur };
    await win.webContents.executeJavaScript('window.setup(' + JSON.stringify(data) + ')');
    await win.webContents.executeJavaScript('window.setT(0)');
    await new Promise(r => setTimeout(r, 400)); // stable wait
    const out = path.join(OUT, 'seg' + String(s.idx).padStart(2,'0') + '.mp4');
    const ff = spawn(FF, ['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate',String(FPS),'-i','-',
      '-i', audio, '-af', 'apad', '-t', String(dur), '-map','0:v','-map','1:a',
      '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-r','60','-c:a','aac','-b:a','192k', out],
      { stdio: ['pipe','ignore','pipe'] });
    let err = '';
    ff.stderr.on('data', d => { err += d.toString(); });
    const frames = Math.ceil(dur * FPS);
    const t0 = Date.now();
    for (let f = 0; f < frames; f++) {
      await win.webContents.executeJavaScript('window.setT(' + (f / FPS).toFixed(4) + ')');
      const img = await win.capturePage();
      const buf = img.toJPEG(88);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('seg' + s.idx + ' ok ' + dur.toFixed(1) + 's frames=' + frames + ' ' + ((Date.now()-t0)/1000).toFixed(0) + 's' + (err ? ' ERR:' + err.slice(0,200) : ''));
  }
  app.quit();
});