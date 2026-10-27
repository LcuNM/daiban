const fs = require('fs');
const REF = 'C:/Users/elysia/.dsh/dania-voice/gpt-sovits/output/slicer_opt/output.wav_0009342720_0009558400.wav';
const PROMPT = '怎么啊？如果有你在也不放心，那就干脆给我也装个限制器或者炸弹喽。';
const segs = ["做这个软件的时候我没想做成什么大工具。它不要求注册账号，也不把你的聊天传到别的地方，就安安静静待在桌面上。","用了一段时间我才发现，它真正省下的不是打字的时间，而是那种「好像有件事没做」的惦记。","如果你也有一堆群，天天怕漏掉通知，那这个小东西应该挺适合你。"];
(async () => {
  const outDir = 'C:/Users/elysia/.dsh/chat-digest/video/audio';
  for (let i = 0; i < segs.length; i++) {
    const n = String(i + 10).padStart(2, '0');
    const body = JSON.stringify({
      text: segs[i], text_lang: 'zh', ref_audio_path: REF, prompt_text: PROMPT, prompt_lang: 'zh',
      media_type: 'wav', streaming_mode: false, top_k: 15, top_p: 1, temperature: 1,
      text_split_method: 'cut5', batch_size: 1, speed_factor: 1.0,
    });
    const res = await fetch('http://127.0.0.1:9880/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    if (!res.ok) { console.log('FAIL ' + res.status); process.exit(1); }
    fs.writeFileSync(outDir + '/seg' + n + '.wav', Buffer.from(await res.arrayBuffer()));
    console.log('seg' + n + ' ok');
  }
})();
