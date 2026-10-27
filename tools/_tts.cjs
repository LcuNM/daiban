const fs = require('fs');
const REF = 'C:/Users/elysia/.dsh/dania-voice/gpt-sovits/output/slicer_opt/output.wav_0009342720_0009558400.wav';
const PROMPT = '怎么啊？如果有你在也不放心，那就干脆给我也装个限制器或者炸弹喽。';
(async () => {
  const text = process.argv[2] || '测试一下喵';
  const out = process.argv[3] || 'C:/Users/elysia/.dsh/chat-digest/assets/_tts_test.wav';
  const body = JSON.stringify({
    text, text_lang: 'zh', ref_audio_path: REF, prompt_text: PROMPT, prompt_lang: 'zh',
    media_type: 'wav', streaming_mode: false, top_k: 15, top_p: 1, temperature: 1,
    text_split_method: 'cut5', batch_size: 1, speed_factor: 1.0,
  });
  const t0 = Date.now();
  const res = await fetch('http://127.0.0.1:9880/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  if (!res.ok) { console.log('FAIL ' + res.status + ' ' + (await res.text()).slice(0, 200)); return; }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log('OK ' + out + ' ' + buf.length + ' bytes ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
})();
