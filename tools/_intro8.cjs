const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const OUT = 'v8seg';
fs.mkdirSync(OUT, { recursive: true });
const FR = 'fonts/msyh.ttc', FB = 'fonts/msyhbd.ttc';
const BLUE = '0x2F6BFF';
function wf(n, t) { const p = OUT + '/' + n + '.txt'; fs.writeFileSync(p, t, 'utf8'); return p; }

const t1 = wf('i1', '待办');
const t2 = wf('i2', '把微信群聊变成一条条要点');
const fc1 = '[0:v]drawbox=x=0:y=0:w=1920:h=1080:color=0x0E1220:t=fill,'
  + 'drawbox=x=860:y=420:w=64:h=10:color=' + BLUE + ':t=fill,'
  + "drawtext=fontfile='" + FB + "':textfile='" + t1 + "':fontsize=180:fontcolor=white:x=(w-text_w)/2:y=470,"
  + "drawtext=fontfile='" + FR + "':textfile='" + t2 + "':fontsize=62:fontcolor=0xA8B6D8:x=(w-text_w)/2:y=700,"
  + 'fade=t=in:st=0:d=0.4,fade=t=out:st=2.9:d=0.5,format=yuv420p[v]';
execFileSync(FF, ['-y','-v','error','-f','lavfi','-i','color=c=0x0E1220:s=1920x1080:r=60:d=3.4','-f','lavfi','-i','anullsrc=r=32000:cl=mono',
  '-filter_complex', fc1, '-map','[v]','-map','1:a','-t','3.4','-r','60','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','32000','-ac','1', OUT + '/seg00.mp4'], { stdio: 'pipe' });

const o1 = wf('o1', '待办');
const o3 = wf('o3', '代码在 GitHub，搜 chat digest');
const fc2 = '[0:v]drawbox=x=0:y=0:w=1920:h=1080:color=0x0E1220:t=fill,'
  + 'drawbox=x=860:y=430:w=64:h=10:color=' + BLUE + ':t=fill,'
  + "drawtext=fontfile='" + FB + "':textfile='" + o1 + "':fontsize=150:fontcolor=white:x=(w-text_w)/2:y=480,"
  + "drawtext=fontfile='" + FR + "':textfile='" + o3 + "':fontsize=40:fontcolor=0x5E6B8A:x=(w-text_w)/2:y=820,"
  + 'fade=t=in:st=0:d=0.4,format=yuv420p[v]';
execFileSync(FF, ['-y','-v','error','-f','lavfi','-i','color=c=0x0E1220:s=1920x1080:r=60:d=4','-f','lavfi','-i','anullsrc=r=32000:cl=mono',
  '-filter_complex', fc2, '-map','[v]','-map','1:a','-t','4','-r','60','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','32000','-ac','1', OUT + '/seg99.mp4'], { stdio: 'pipe' });
console.log('intro/outro 60fps done');