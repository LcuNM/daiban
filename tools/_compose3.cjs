const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FP = 'C:/Users/elysia/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffprobe.exe';
const OUT = 'v3seg';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync('fonts', { recursive: true });
if (!fs.existsSync('fonts/msyh.ttc')) fs.copyFileSync('C:/Windows/Fonts/msyh.ttc', 'fonts/msyh.ttc');
const FONT = 'fonts/msyh.ttc';
const A = '../assets';
const ADIR = 'audio';
function dur(p){ return Number(execFileSync(FP,['-v','error','-show_entries','format=duration','-of','csv=p=0',p],{encoding:'utf8'}).trim()); }
function wrap(t,n){const o=[];let s=t;while(s.length>n){o.push(s.slice(0,n));s=s.slice(n);}o.push(s);return o.join('\n');}
const subs={};
for(const f of fs.readdirSync('sub')) subs[Number(f.replace('sub','').replace('.txt',''))]=fs.readFileSync('sub/'+f,'utf8').replace(/\n/g,'');
function run(args){ try{ execFileSync(FF,args,{stdio:'pipe'}); return true; } catch(e){ console.log('ERR', String(e.stderr||e.message).slice(-400)); return false; } }
fs.writeFileSync(OUT+'/t1.txt','待办','utf8');
fs.writeFileSync(OUT+'/t2.txt','把微信群聊\n变成一条条要点','utf8');
const vfIntro = '[0:v]format=yuv420p,' +
  "drawtext=fontfile='"+FONT+"':textfile='"+OUT+"/t1.txt':fontcolor=white:fontsize=150:x=(w-text_w)/2:y=780," +
  "drawtext=fontfile='"+FONT+"':textfile='"+OUT+"/t2.txt':fontcolor=0xA8C4FF:fontsize=62:line_spacing=18:x=(w-text_w)/2:y=1000," +
  'fade=t=in:st=0:d=0.4,fade=t=out:st=2.5:d=0.5[v]';
if (run(['-y','-v','error','-f','lavfi','-i','color=c=0x101A2E:s=1080x1920:r=30:d=3','-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-filter_complex',vfIntro,'-map','[v]','-map','1:a','-t','3','-c:v','libx264','-preset','fast','-crf','21','-c:a','aac','-b:a','192k',OUT+'/seg00.mp4'])) console.log('intro ok');
function seg(idx, img){
  const cp = OUT+'/cap'+idx+'.txt'; fs.writeFileSync(cp, wrap(subs[idx],16),'utf8');
  const audio = ADIR+'/seg'+String(idx).padStart(2,'0')+'.wav';
  const d = dur(audio);
  const vf = '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=45:3,eq=brightness=-0.55:contrast=1.05:saturation=1.6[bg];' +
    '[1:v]scale=1020:-1,pad=1044:ih+24:12:12:color=0xFFFFFF[card];' +
    '[bg][card]overlay=x=(W-w)/2:y=470[ov];' +
    "[ov]zoompan=z='min(1+0.00028*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30[zv];" +
    "[zv]drawtext=fontfile='"+FONT+"':textfile='"+cp+"':fontcolor=white:fontsize=54:line_spacing=16:box=1:boxcolor=0x000000B0:boxborderw=26:x=(w-text_w)/2:y=h-text_h-190," +
    'fade=t=in:st=0:d=0.3,format=yuv420p[v]';
  if (run(['-y','-v','error','-loop','1','-framerate','30','-i',A+'/'+img,'-i',A+'/'+img,'-i',audio,'-filter_complex',vf,'-map','[v]','-map','2:a','-t',String(d),'-c:v','libx264','-preset','fast','-crf','21','-c:a','aac','-b:a','192k',OUT+'/seg'+String(idx).padStart(2,'0')+'.mp4'])) console.log('seg'+idx+' ok '+d.toFixed(1)+'s');
}
seg(1,'va_main.png');
console.log('DONE');