const fs = require('fs');
const REF = 'C:/Users/elysia/.dsh/dania-voice/gpt-sovits/output/slicer_opt/output.wav_0009342720_0009558400.wav';
const PROMPT = '怎么啊？如果有你在也不放心，那就干脆给我也装个限制器或者炸弹喽。';
const TEXT = '比如这一条，周报提交。谁在催、要交什么、几号前交，打开就能看到，不用再翻几百条聊天记录。';
(async () => {
  const body = JSON.stringify({ text: TEXT, text_lang: 'zh', ref_audio_path: REF, prompt_text: PROMPT, prompt_lang: 'zh',
    media_type: 'wav', streaming_mode: false, top_k: 15, top_p: 1, temperature: 1,
    text_split_method: 'cut5', batch_size: 1, speed_factor: 1.0 });
  const res = await fetch('http://127.0.0.1:9880/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  if (!res.ok) { console.log('FAIL ' + res.status); process.exit(1); }
  fs.writeFileSync('C:/Users/elysia/.dsh/chat-digest/video/audio/seg03.wav', Buffer.from(await res.arrayBuffer()));
  console.log('seg03 ok');
})();
