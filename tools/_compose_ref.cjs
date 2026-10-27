
const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FP = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffprobe.exe';
const OUT = 'refseg';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync('fonts', { recursive: true });
for (const f of ['msyh.ttc', 'msyhbd.ttc']) {
  if (!fs.existsSync('fonts/' + f)) fs.copyFileSync('C:/Windows/Fonts/' + f, 'fonts/' + f);
}
const FR = 'fonts/msyh.ttc', FB = 'fonts/msyhbd.ttc';
const BLUE = '0x2F6BFF', INK = '0x16181D', GREY = '0x5A6070', CARD = '0xF4F6FA', BAR = '0x33373F';

function dur(p){ return Number(execFileSync(FP,['-v','error','-show_entries','format=duration','-of','csv=p=0',p],{encoding:'utf8'}).trim()); }
function wf(name, text){ const p = OUT + '/' + name + '.txt'; fs.writeFileSync(p, text, 'utf8'); return p; }
function wrap(t, n){ const o=[]; let s=t; while(s.length>n){ o.push(s.slice(0,n)); s=s.slice(n);} o.push(s); return o.join('\n'); }

const subs = {};
for (const f of fs.readdirSync('sub')) subs[Number(f.replace('sub','').replace('.txt',''))] = fs.readFileSync('sub/'+f,'utf8').replace(/\n/g,'').trim();

const SEGS = [
 { tag:'缘起', title:'把群聊变成要点', b:[['只干一件事','把微信群聊变成一条条能直接看的要点'],['给自己写的','不是产品，就想少翻几百条消息'],['全程本地','记录不出你这台电脑']], crop:null },
 { tag:'界面', title:'一眼分得清', b:[['左列表','要点按时间排好，一眼看到最新'],['右内容','点开就是这条的完整要点'],['自动打标签','通知、待办、学业、活动']], crop:'crop=700:1027:0:0' },
 { tag:'示例', title:'一条要点长什么样', b:[['谁在催','发件人和群名都在上面'],['还差多少人','24 人未交身份证复印件'],['什么时候截止','30 号前必须发给辅导员']], crop:'crop=980:760:640:60' },
 { tag:'生成', title:'一键变成要点', b:[['点一键生成','读取你勾好的群'],['交给 AI','只取最近一天的聊天'],['十几秒出结果','新的要点排在最上面']], crop:'crop=1000:460:0:560' },
 { tag:'上手', title:'第一次用只要两步', b:[['右下角气泡','勾上你关心的群'],['右上角齿轮','填一个 DeepSeek 密钥'],['之后不用管','它会自己跑']], crop:null },
 { tag:'过程', title:'点下去之后发生什么', b:[['先导出','把聊天从微信导出来'],['再总结','按群分别提炼要点'],['最后入库','写成新的要点条目']], crop:'crop=1100:520:0:180' },
 { tag:'隐私', title:'总结完就删原文', b:[['都在自己电脑','不用注册账号'],['不传到别处','聊天不上传服务器'],['原文立刻删掉','只留下要点']], crop:'crop=760:700:0:120' },
 { tag:'编辑', title:'要点还能自己改', b:[['新建 / 编辑 / 删除','随手改错字和补充说明'],['按分类筛选','只看通知或者只看学业'],['每天自动跑','定个时间就完事']], crop:'crop=660:900:0:80' },
 { tag:'开源', title:'代码在 GitHub', b:[['搜 chat digest','仓库公开，MIT 协议'],['装一下就能用','Electron 小工具'],['帮到你就点个赞','喵']], crop:null },
 { tag:'初衷', title:'没想做成大工具', b:[['不注册账号','打开就用'],['不碰你的聊天','本地才有记录'],['就图自己省事','顺手写的一个小东西']], crop:'crop=640:900:0:100' },
 { tag:'体会', title:'省下的是惦记', b:[['不用再翻聊天','要点都在那儿'],['小事不丢','该交的材料不会漏'],['心里踏实','比省打字值钱']], crop:'crop=640:800:0:180' },
 { tag:'适合你', title:'一堆群的人', b:[['怕漏通知','班群、社团群、实习群'],['天天翻记录','翻到最后还是没找到'],['那试试这个小东西','每天 20 点自动总结']], crop:null },
];

function render(i){
  const s = SEGS[i-1];
  const audio = 'audio/seg' + String(i).padStart(2,'0') + '.wav';
  const d = dur(audio);
  const tagF = wf('t' + i + '_tag', s.tag);
  const titleF = wf('t' + i + '_title', s.title);
  const capF = wf('t' + i + '_cap', wrap(subs[i], 26));
  const parts = [];
  // 左栏
  parts.push('drawbox=x=110:y=112:w=64:h=8:color=' + BLUE + ':t=fill');
  parts.push("drawtext=fontfile='" + FR + "':textfile='" + tagF + "':fontsize=34:fontcolor=" + BLUE + ':x=110:y=140');
  parts.push("drawtext=fontfile='" + FB + "':textfile='" + titleF + "':fontsize=76:fontcolor=" + INK + ':x=110:y=198');
  for (let k = 0; k < s.b.length; k++) {
    const yb = 380 + k * 190;
    const bf = wf('t' + i + '_b' + k, s.b[k][0]);
    const df = wf('t' + i + '_d' + k, s.b[k][1]);
    parts.push("drawtext=fontfile='" + FR + "':text=●:fontsize=30:fontcolor=" + BLUE + ':x=110:y=' + (yb - 2));
    parts.push("drawtext=fontfile='" + FB + "':textfile='" + bf + "':fontsize=44:fontcolor=" + INK + ':x=142:y=' + yb);
    parts.push("drawtext=fontfile='" + FR + "':textfile='" + df + "':fontsize=34:fontcolor=" + GREY + ':x=142:y=' + (yb + 62));
  }
  // 右卡片 + 截图
  parts.push('drawbox=x=1010:y=140:w=800:h=760:color=' + CARD + ':t=fill');
  const shotIn = (s.crop ? '[1:v]' + s.crop : '[1:v]null') + ',scale=780:740:force_original_aspect_ratio=decrease[shot]';
  // 字幕条 + 页码
  parts.push('drawbox=x=0:y=940:w=1920:h=140:color=' + BAR + ':t=fill');
  parts.push("drawtext=fontfile='" + FR + "':textfile='" + capF + "':fontsize=38:fontcolor=white:line_spacing=8:x=(w-text_w)/2:y=968");
  parts.push("drawtext=fontfile='" + FR + "':text=" + String(i).padStart(2,'0') + ":fontsize=34:fontcolor=0x9AA0AE:x=w-tw-40:y=1006");
  const fc = shotIn + ';' +
    '[0:v]' + parts.join(',') + '[bg];' +
    '[bg][shot]overlay=x=1010+(800-overlay_w)/2:y=140+(760-overlay_h)/2:shortest=1,fade=t=in:st=0:d=0.3,format=yuv420p[v]';
  const args = ['-y','-v','error','-f','lavfi','-i','color=c=0xFFFFFF:s=1920x1080:r=30:d=' + d,
    '-loop','1','-framerate','30','-i','../assets/va_main.png','-i',audio,
    '-filter_complex', fc, '-map','[v]','-map','2:a','-t',String(d),
    '-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k',
    OUT + '/seg' + String(i).padStart(2,'0') + '.mp4'];
  try {
    execFileSync(FF, args, { stdio: 'pipe' });
    console.log('seg' + i + ' ok ' + d.toFixed(1) + 's');
  } catch (e) {
    console.log('ERR seg' + i + ': ' + String(e.stderr || e.message).slice(-600));
  }
}

// 片头
(function intro(){
  const t1 = wf('i_t1','待办');
  const t2 = wf('i_t2','把微信群聊变成一条条要点');
  const t3 = wf('i_t3','小标题：一个班群党的自救');
  const fc = '[0:v]drawbox=x=0:y=0:w=1920:h=1080:color=0x0E1220:t=fill,'
    + "drawbox=x=860:y=420:w=64:h=8:color=" + BLUE + ":t=fill,"
    + "drawtext=fontfile='" + FB + "':textfile='" + t1 + "':fontsize=180:fontcolor=white:x=(w-text_w)/2:y=470,"
    + "drawtext=fontfile='" + FR + "':textfile='" + t2 + "':fontsize=62:fontcolor=0xA8B6D8:x=(w-text_w)/2:y=700,"
    + "drawtext=fontfile='" + FR + "':textfile='" + t3 + "':fontsize=36:fontcolor=0x5E6B8A:x=(w-text_w)/2:y=820,"
    + 'fade=t=in:st=0:d=0.4,fade=t=out:st=2.6:d=0.5,format=yuv420p[v]';
  execFileSync(FF, ['-y','-v','error','-f','lavfi','-i','color=c=0x0E1220:s=1920x1080:r=30:d=3','-f','lavfi','-i','anullsrc=r=44100:cl=stereo',
    '-filter_complex', fc, '-map','[v]','-map','1:a','-t','3','-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k', OUT + '/seg00.mp4'], { stdio: 'pipe' });
  console.log('intro ok');
})();

const only = process.argv[2] ? [Number(process.argv[2])] : null;
for (let i = 1; i <= 12; i++) { if (!only || only.includes(i)) render(i); }
console.log('DONE');
