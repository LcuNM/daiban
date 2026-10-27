const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FP = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffprobe.exe';
const VDIR = 'C:/Users/elysia/.dsh/chat-digest/video';
const ADIR = VDIR + '/audio';
const SEG = VDIR + '/seg';
const SUB = VDIR + '/sub';
const A = 'C:/Users/elysia/.dsh/chat-digest/assets';

const lines = [
  '这是我给自己写的一个小软件，叫待办。它只干一件事，把微信群聊变成一张张能直接看的要点。',
  '界面很简单。左边是要点列表，右边是内容区。每条都自动打了标签，通知、待办、学业、活动，一眼分得清。',
  '比如这一条，证件复印件提交。谁在催，还差多少人，几号前要交，打开就能看到，不用再翻几百条聊天记录。',
  '看完旧的，就点一键生成。它会读取你勾好的群，把最近一天的聊天交给 AI，自动提炼成一条条要点。',
  '第一次用，先点右下角这个气泡，勾上你关心的群。再点右上角的齿轮，填一个 DeepSeek 的密钥。之后就不用管了。',
  '点下去大概十几秒到一分钟，它会把聊天导出来，按群分别总结，再把结果写成新的要点，排在最上面。',
  '整个流程都在你自己的电脑上完成。而且有个我特别喜欢的设定，总结完，原始的聊天记录会立刻删掉。',
  '要点还能自己改，可以新建、编辑、删除，也能按分类筛选。想让它每天自动跑一次，也不是不行。',
  '代码开源在 GitHub，搜 chat digest 就能找到。如果它帮到了你，点个赞吧喵。',
  '做这个软件的时候我没想做成什么大工具。它不要求注册账号，也不把你的聊天传到别的地方。',
  '用了一段时间我才发现，它真正省下的不是打字的时间，而是那种好像有件事没做的惦记。',
  '如果你也有一堆群，天天怕漏掉通知，那这个小东西应该挺适合你。',
];
const shots = [
  { img: 'va_main.png' },
  { img: 'va_main.png', crop: '620:1027:0:0' },
  { img: 'va_main.png', crop: '980:900:600:80' },
  { img: 'va_main.png' },
  { img: 'va_main.png', crop: '620:460:960:540' },
  { img: 'va_main.png' },
  { img: 'va_main.png', crop: '620:1027:0:0' },
  { img: 'va_main.png' },
  { img: 'va_main.png' },
  { img: 'va_main.png' },
  { img: 'va_main.png' },
  { img: 'va_main.png' },
];

fs.mkdirSync(SEG, { recursive: true });
fs.mkdirSync(SUB, { recursive: true });

function wrap(t, n) {
  const out = [];
  let s = t;
  while (s.length > n) { out.push(s.slice(0, n)); s = s.slice(n); }
  out.push(s);
  return out.join('\n');
}

const only = process.argv[2] ? Number(process.argv[2]) : 0;
const list = fs.readdirSync(ADIR).filter(f => f.endsWith('.wav')).sort();
let total = 0;
for (const f of list) {
  const idx = Number(f.replace('seg', '').replace('.wav', ''));
  if (only && idx !== only) continue;
  const wav = ADIR + '/' + f;
  const dur = Number(execFileSync(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], { encoding: 'utf8' }).trim());
  total += dur;
  const txt = SUB + '/sub' + idx + '.txt';
  fs.writeFileSync(txt, wrap(lines[idx - 1], 22), 'utf8');
  const shot = shots[idx - 1] || { img: 'va_main.png' };
  const img = A + '/' + shot.img;
  const out = SEG + '/seg' + String(idx).padStart(2, '0') + '.mp4';
  const pre = shot.crop ? ('crop=' + shot.crop + ',') : '';
  const vf = pre + "scale=1920:1080:force_original_aspect_ratio=decrease," +
    "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xF7F8FA," +
    "zoompan=z='min(1+0.0006*on,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30," +
    "drawtext=fontfile='C\\:/Windows/Fonts/msyh.ttc':textfile='" + txt.replace(/:/g, '\\:') + "':fontcolor=white:fontsize=42:line_spacing=10:box=1:boxcolor=0x000000AA:boxborderw=20:x=(w-text_w)/2:y=h-text_h-80," +
    "format=yuv420p";
  try {
  execFileSync(FF, ['-y', '-loop', '1', '-framerate', '30', '-i', img, '-i', wav,
    '-filter_complex', '[0:v]' + vf + '[v]',
    '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', out], { stdio: 'pipe' });
  } catch (e) {
    console.log('ERR seg' + idx + ': ' + String(e.stderr || e.message).slice(-700));
    process.exit(1);
  }
  console.log('seg' + idx + ' ' + dur.toFixed(1) + 's');
}
console.log('TOTAL=' + total.toFixed(1) + 's');
