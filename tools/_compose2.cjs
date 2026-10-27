const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FP = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffprobe.exe';
const VDIR = 'C:/Users/elysia/.dsh/chat-digest/video';
const A = 'C:/Users/elysia/.dsh/chat-digest/assets';
const OUT = VDIR + '/v2seg';
fs.mkdirSync(OUT, { recursive: true });

const FONT = "C\\:/Windows/Fonts/msyh.ttc";

function dur(p){ return Number(execFileSync(FP,['-v','error','-show_entries','format=duration','-of','csv=p=0',p],{encoding:'utf8'}).trim()); }
function wrap(t,n){const o=[];let s=t;while(s.length>n){o.push(s.slice(0,n));s=s.slice(n);}o.push(s);return o.join('\n');}

// 字幕文本（复用 sub 目录）
const subs = {};
for (const f of fs.readdirSync(VDIR + '/sub')) {
  const i = Number(f.replace('sub','').replace('.txt',''));
  subs[i] = fs.readFileSync(VDIR + '/sub/' + f, 'utf8').replace(/\n/g, '');
}
function subFile(idx, text){
  const p = OUT + '/cap' + idx + '.txt';
  fs.writeFileSync(p, wrap(text, 17), 'utf8');
  return p.replace(/:/g, '\\:');
}

function buildSeg(idx, img, audio, outName, extraVf) {
  const d = dur(audio);
  const cap = subFile(idx, subs[idx]);
  const vf = [
    '[1:v]scale=1000:-1[fg]',
    '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:2,eq=brightness=-0.18:saturation=0.7[bg]',
    '[bg][fg]overlay=x=(W-w)/2:y=420[ov]',
    '[ov]zoompan=z=\'min(1+0.00035*on,1.06)\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d=1:s=1080x1920:fps=30[zv]',
    '[zv]drawtext=fontfile=\'' + FONT + '\':textfile=\'' + cap + '\':fontcolor=white:fontsize=52:line_spacing=14:box=1:boxcolor=0x000000CC:boxborderw=24:x=(w-text_w)/2:y=h-text_h-210,fade=t=in:st=0:d=0.35,format=yuv420p[v]'
  ].join(';');
  execFileSync(FF, ['-y','-v','error','-loop','1','-framerate','30','-i',A+'/'+img,'-i',A+'/'+img,'-i',audio,
    '-filter_complex', vf, '-map','[v]','-map','2:a','-t', String(d),
    '-c:v','libx264','-preset','fast','-crf','21','-c:a','aac','-b:a','192k', OUT+'/'+outName], {stdio:'pipe'});
  console.log(outName + ' ' + d.toFixed(1) + 's');
}

// 片头
function buildIntro(){
  const p = OUT + '/title.txt';
  fs.writeFileSync(p, '待办', 'utf8');
  const p2 = OUT + '/title2.txt';
  fs.writeFileSync(p2, '把微信群聊变成一条条要点', 'utf8');
  const vf = '[0:v]format=yuv420p,drawtext=fontfile=\'' + FONT + '\':textfile=\'' + p.replace(/:/g,'\\:') + '\':fontcolor=white:fontsize=140:x=(w-text_w)/2:y=760,' +
    'drawtext=fontfile=\'' + FONT + '\':textfile=\'' + p2.replace(/:/g,'\\:') + '\':fontcolor=0xBFD4FF:fontsize=60:x=(w-text_w)/2:y=980,' +
    'fade=t=in:st=0:d=0.5,fade=t=out:st=2.4:d=0.6[v]';
  execFileSync(FF, ['-y','-v','error','-f','lavfi','-i','color=c=0x0E1B33:s=1080x1920:r=30:d=3','-f','lavfi','-i','anullsrc=r=44100:cl=stereo',
    '-filter_complex', vf, '-map','[v]','-map','1:a','-t','3','-c:v','libx264','-preset','fast','-crf','21','-c:a','aac','-b:a','192k', OUT+'/seg00.mp4'], {stdio:'pipe'});
  console.log('seg00 intro 3.0s');
}
buildIntro();
buildSeg(1, 'va_main.png', VDIR + '/audio/seg01.wav', 'seg01.mp4');
buildSeg(2, 'va_main.png', VDIR + '/audio/seg02.wav', 'seg02.mp4');
console.log('OK');
