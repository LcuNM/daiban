
const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FP = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffprobe.exe';
const OUT = 'v3seg2';
const TAIL = 1.7;              // 每段结尾停留秒数
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync('fonts', { recursive: true });
for (const f of ['msyh.ttc', 'msyhbd.ttc']) {
  if (!fs.existsSync('fonts/' + f)) fs.copyFileSync('C:/Windows/Fonts/' + f, 'fonts/' + f);
}
const FR = 'fonts/msyh.ttc', FB = 'fonts/msyhbd.ttc';
const BLUE = '0x2F6BFF', INK = '0x16181D', GREY = '0x555C6B', CARD = '0xF4F6FA', BAR = '0x33373F';

function dur(p){ return Number(execFileSync(FP,['-v','error','-show_entries','format=duration','-of','csv=p=0',p],{encoding:'utf8'}).trim()); }
function wf(name, text){ const p = OUT + '/' + name + '.txt'; fs.writeFileSync(p, text, 'utf8'); return p; }
function wrap(t, n){ const o=[]; let s=t; const punct='，。、；：？！）】」…'; while(s.length>n){ let cut=n; while(cut>0 && punct.indexOf(s[cut])>=0) cut--; if(cut<=0) cut=n; o.push(s.slice(0,cut)); s=s.slice(cut);} o.push(s); return o.join('\n'); }

const subs = {};
for (const f of fs.readdirSync('sub')) subs[Number(f.replace('sub','').replace('.txt',''))] = fs.readFileSync('sub/'+f,'utf8').replace(/\n/g,'').trim();

const SEGS = [
 { tag:'缘起', title:'把群聊变成要点', b:[['只干一件事','把微信群聊变成一条条要点'],['给自己写的','就想少翻几百条消息'],['全程本地','记录不出你这台电脑']], crop:null },
 { tag:'界面', title:'一眼分得清', b:[['左列表','要点按时间排好'],['右内容','点开就是完整要点'],['自动打标签','通知、待办、学业、活动']], crop:'crop=760:1027:0:0' },
 { tag:'示例', title:'一条要点长什么样', b:[['谁在催','发件人和群名都在'],['还差多少人','24 人未交复印件'],['什么时候截止','30 号前发给辅导员']], crop:'crop=1000:700:600:120' },
 { tag:'生成', title:'一键变成要点', b:[['点一键生成','读取你勾好的群'],['交给 AI','只取最近一天聊天'],['十几秒出结果','新的排在最上面']], crop:'crop=1100:460:0:540' },
 { tag:'上手', title:'第一次用只要两步', b:[['右下角气泡','勾上你关心的群'],['右上角齿轮','填 DeepSeek 密钥'],['之后不用管','它会自己跑']], crop:null },
 { tag:'过程', title:'点下去之后发生什么', b:[['先导出','把聊天从微信导出来'],['再总结','按群分别提炼要点'],['最后入库','写成新的要点条目']], crop:'crop=1200:560:0:200' },
 { tag:'隐私', title:'总结完就删原文', b:[['都在自己电脑','不用注册账号'],['不传到别处','聊天不上传服务器'],['原文立刻删掉','只留下要点']], crop:'crop=820:760:0:140' },
 { tag:'编辑', title:'要点还能自己改', b:[['新建 / 编辑 / 删除','随手改错字和补充'],['按分类筛选','只看通知或学业'],['每天自动跑','定个时间就完事']], crop:'crop=760:960:0:60' },
 { tag:'开源', title:'代码在 GitHub', b:[['搜 chat digest','仓库公开，MIT 协议'],['装一下就能用','Electron 小工具'],['帮到你就点个赞','喵']], crop:null },
 { tag:'初衷', title:'没想做成大工具', b:[['不注册账号','打开就用'],['不碰你的聊天','本地才有记录'],['就图自己省事','顺手写的小东西']], crop:'crop=760:900:0:100' },
 { tag:'体会', title:'省下的是惦记', b:[['不用再翻聊天','要点都在那儿'],['小事不丢','该交的材料不会漏'],['心里踏实','比省打字值钱']], crop:'crop=760:820:0:160' },
 { tag:'适合你', title:'一堆群的人', b:[['怕漏通知','班群、社团群、实习群'],['天天翻记录','翻到最后还是没找到'],['那试试这个','每天 20 点自动总结']], crop:null },
];

function render(i){
  const s = SEGS[i-1];
  const audio = 'audio/seg' + String(i).padStart(2,'0') + '.wav';
  const d = dur(audio) + TAIL;
  const tagF = wf('t' + i + '_tag', s.tag);
  const titleF = wf('t' + i + '_title', s.title);
  const capF = wf('t' + i + '_cap', wrap(subs[i], 24));
  const parts = [];
  parts.push('drawbox=x=100:y=104:w=64:h=10:color=' + BLUE + ':t=fill');
  parts.push("drawtext=fontfile='" + FR + "':textfile='" + tagF + "':fontsize=38:fontcolor=" + BLUE + ':x=100:y=134');
  parts.push("drawtext=fontfile='" + FB + "':textfile='" + titleF + "':fontsize=88:fontcolor=" + INK + ':x=100:y=192');
  for (let k = 0; k < s.b.length; k++) {
    const yb = 382 + k * 208;
    const bf = wf('t' + i + '_b' + k, s.b[k][0]);
    const df = wf('t' + i + '_d' + k, s.b[k][1]);
    parts.push("drawtext=fontfile='" + FR + "':text=●:fontsize=30:fontcolor=" + BLUE + ':x=100:y=' + (yb + 10));
    parts.push("drawtext=fontfile='" + FB + "':textfile='" + bf + "':fontsize=50:fontcolor=" + INK + ':x=142:y=' + yb);
    parts.push("drawtext=fontfile='" + FR + "':textfile='" + df + "':fontsize=38:fontcolor=" + GREY + ':x=142:y=' + (yb + 68));
  }
  parts.push('drawbox=x=980:y=150:w=860:h=760:color=' + CARD + ':t=fill');
  parts.push('drawbox=x=0:y=930:w=1920:h=150:color=' + BAR + ':t=fill');
  parts.push("drawtext=fontfile='" + FR + "':textfile='" + capF + "':fontsize=44:fontcolor=white:line_spacing=10:x=(w-text_w)/2:y=952");
  parts.push("drawtext=fontfile='" + FR + "':text=" + String(i).padStart(2,'0') + ":fontsize=38:fontcolor=0x9AA0AE:x=w-tw-40:y=1000");
  const shotIn = (s.crop ? '[1:v]' + s.crop : '[1:v]null') + ',scale=820:740:force_original_aspect_ratio=decrease[shot]';
  const fc = shotIn + ';[2:a]apad=pad_dur=' + TAIL + '[aud];' +
    '[0:v]' + parts.join(',') + '[bg];' +
    '[bg][shot]overlay=x=980+(860-overlay_w)/2:y=150+(760-overlay_h)/2:shortest=1,format=yuv420p[v]';
  const args = ['-y','-v','error','-f','lavfi','-i','color=c=0xFFFFFF:s=1920x1080:r=30:d=' + d,
    '-loop','1','-framerate','30','-i','../assets/va_main.png','-i',audio,
    '-filter_complex', fc, '-map','[v]','-map','[aud]','-t',String(d),
    '-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k',
    OUT + '/seg' + String(i).padStart(2,'0') + '.mp4'];
  try {
    execFileSync(FF, args, { stdio: 'pipe' });
    console.log('seg' + i + ' ok ' + d.toFixed(1) + 's');
  } catch (e) {
    console.log('ERR seg' + i + ': ' + String(e.stderr || e.message).slice(-500));
  }
}

(function intro(){
  const t1 = wf('i_t1','待办');
  const t2 = wf('i_t2','把微信群聊变成一条条要点');
  const t3 = wf('i_t3','一个班群党的自救');
  const fc = '[0:v]drawbox=x=0:y=0:w=1920:h=1080:color=0x0E1220:t=fill,'
    + "drawbox=x=860:y=420:w=64:h=10:color=" + BLUE + ":t=fill,"
    + "drawtext=fontfile='" + FB + "':textfile='" + t1 + "':fontsize=180:fontcolor=white:x=(w-text_w)/2:y=470,"
    + "drawtext=fontfile='" + FR + "':textfile='" + t2 + "':fontsize=62:fontcolor=0xA8B6D8:x=(w-text_w)/2:y=700,"
    + "drawtext=fontfile='" + FR + "':textfile='" + t3 + "':fontsize=38:fontcolor=0x5E6B8A:x=(w-text_w)/2:y=820,"
    + 'fade=t=in:st=0:d=0.4,fade=t=out:st=2.9:d=0.5,format=yuv420p[v]';
  execFileSync(FF, ['-y','-v','error','-f','lavfi','-i','color=c=0x0E1220:s=1920x1080:r=30:d=3.4','-f','lavfi','-i','anullsrc=r=44100:cl=stereo',
    '-filter_complex', fc, '-map','[v]','-map','1:a','-t','3.4','-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k', OUT + '/seg00.mp4'], { stdio: 'pipe' });
  console.log('intro ok');
})();

(function outro(){
  const t1 = wf('o_t1','待办');
  const t2 = wf('o_t2','一个班群党的自救');
  const t3 = wf('o_t3','代码在 GitHub，搜 chat digest');
  const fc = '[0:v]drawbox=x=0:y=0:w=1920:h=1080:color=0x0E1220:t=fill,'
    + "drawbox=x=860:y=430:w=64:h=10:color=" + BLUE + ":t=fill,"
    + "drawtext=fontfile='" + FB + "':textfile='" + t1 + "':fontsize=150:fontcolor=white:x=(w-text_w)/2:y=480,"
    + "drawtext=fontfile='" + FR + "':textfile='" + t2 + "':fontsize=54:fontcolor=0x8E9DC0:x=(w-text_w)/2:y=700,"
    + "drawtext=fontfile='" + FR + "':textfile='" + t3 + "':fontsize=40:fontcolor=0x5E6B8A:x=(w-text_w)/2:y=820,"
    + 'fade=t=in:st=0:d=0.4,format=yuv420p[v]';
  execFileSync(FF, ['-y','-v','error','-f','lavfi','-i','color=c=0x0E1220:s=1920x1080:r=30:d=4','-f','lavfi','-i','anullsrc=r=44100:cl=stereo',
    '-filter_complex', fc, '-map','[v]','-map','1:a','-t','4','-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k', OUT + '/seg99.mp4'], { stdio: 'pipe' });
  console.log('outro ok');
})();

const only = process.argv[2] ? [Number(process.argv[2])] : null;
for (let i = 1; i <= 12; i++) { if (!only || only.includes(i)) render(i); }
console.log('DONE');
