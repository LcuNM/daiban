const { app, BrowserWindow } = require('electron');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FP = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffprobe.exe';
const VID = 'C:/Users/elysia/.dsh/chat-digest/video';
const OUT = path.join(VID, 'v7seg');
const IMG = 'file:///C:/Users/elysia/.dsh/chat-digest/mock/out/';
const FPS = 25;
const TAIL = 1.7;
fs.mkdirSync(OUT, { recursive: true });

const SEGS = [
 { idx:1, tag:'缘起', title:'把群聊\n变成要点', img:'main.png', zoom:1.0, focus:'50% 30%',
   points:[['只干一件事','微信群聊 → 一条条能看的要点'],['给自己写的','不想翻几百条消息'],['全程本地','记录不出这台电脑']] },
 { idx:2, tag:'界面', title:'一眼分得清', img:'main.png', zoom:2.6, focus:'0% 0%',
   points:[['左列表','要点按时间排好'],['自动打标签','通知、待办、学业、活动'],['编号连着走','越新越靠上']] },
 { idx:3, tag:'示例', title:'一条要点\n长什么样', img:'main.png', zoom:1.9, focus:'80% 10%',
   points:[['谁在催','发件人和群名都在'],['还差多少人','24 人未交复印件'],['什么时候截止','30 号前发给辅导员']] },
 { idx:4, tag:'生成', title:'一键变成要点', img:'gen.png', zoom:1.0, focus:'50% 30%',
   points:[['点一键生成','读取你勾好的群'],['交给 AI','只取最近一天聊天'],['十几秒出结果','新的排在最上面']] },
 { idx:5, tag:'上手', title:'第一次用\n只要两步', img:'panel.png', zoom:2.2, focus:'95% 80%',
   points:[['右下角气泡','勾上你关心的群'],['右上角齿轮','填 DeepSeek 密钥'],['之后不用管','它会自己跑']] },
 { idx:6, tag:'过程', title:'点下去之后\n发生什么', img:'gen.png', zoom:1.8, focus:'40% 35%',
   points:[['先导出','把聊天从微信导出来'],['再总结','按群分别提炼要点'],['最后入库','写成新的要点条目']] },
 { idx:7, tag:'隐私', title:'总结完\n就删原文', img:'main.png', zoom:1.9, focus:'70% 14%',
   points:[['都在自己电脑','不用注册账号'],['不传到别处','聊天不上传服务器'],['原文立刻删掉','只留下要点']] },
 { idx:8, tag:'编辑', title:'要点还能\n自己改', img:'main.png', zoom:2.2, focus:'0% 6%',
   points:[['新建 / 编辑 / 删除','随手改错字和补充'],['按分类筛选','只看通知或学业'],['每天自动跑','定个时间就完事']] },
 { idx:9, tag:'开源', title:'代码在\nGitHub', img:'main.png', zoom:1.0, focus:'50% 30%',
   points:[['搜 chat digest','仓库公开，MIT 协议'],['装一下就能用','Electron 小工具'],['帮到你就点个赞','喵']] },
 { idx:10, tag:'初衷', title:'没想做成\n大工具', img:'settings.png', zoom:1.5, focus:'50% 40%',
   points:[['不注册账号','打开就用'],['不碰你的聊天','本地才有记录'],['就图自己省事','顺手写的小东西']] },
 { idx:11, tag:'体会', title:'省下的\n是惦记', img:'main.png', zoom:2.0, focus:'70% 18%',
   points:[['不用再翻聊天','要点都在那儿'],['小事不丢','该交的材料不会漏'],['心里踏实','比省打字值钱']] },
 { idx:12, tag:'适合你', title:'一堆群的人', img:'main.png', zoom:1.0, focus:'50% 30%',
   points:[['怕漏通知','班群、社团群、实习群'],['天天翻记录','翻到最后还是没找到'],['那试试这个','每天 20 点自动总结']] },
];

function wrap(t, n){
  const o = []; let s = String(t || '');
  const punct = '，。、；：？！）】」…';
  while (s.length > n) { let cut = n; while (cut > 0 && punct.indexOf(s[cut]) >= 0) cut--; if (cut <= 0) cut = n; o.push(s.slice(0, cut)); s = s.slice(cut); }
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
    const out = path.join(OUT, 'seg' + String(s.idx).padStart(2,'0') + '.mp4');
    const ff = spawn(FF, ['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate',String(FPS),'-i','-',
      '-i', audio, '-af', 'apad', '-t', String(dur), '-map','0:v','-map','1:a',
      '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k', out],
      { stdio: ['pipe','ignore','pipe'] });
    let err = '';
    ff.stderr.on('data', d => { err += d.toString(); });
    const frames = Math.ceil(dur * FPS);
    const t0 = Date.now();
    for (let f = 0; f < frames; f++) {
      await win.webContents.executeJavaScript('window.setT(' + (f / FPS) + ')');
      const img = await win.capturePage();
      const buf = img.toJPEG(85);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('seg' + s.idx + ' ok ' + dur.toFixed(1) + 's frames=' + frames + ' ' + ((Date.now()-t0)/1000).toFixed(0) + 's' + (err ? ' ERR:' + err.slice(0,200) : ''));
  }
  app.quit();
});
