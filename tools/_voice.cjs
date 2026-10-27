const fs = require('fs');
const REF = 'C:/Users/elysia/.dsh/dania-voice/gpt-sovits/output/slicer_opt/output.wav_0009342720_0009558400.wav';
const PROMPT = '怎么啊？如果有你在也不放心，那就干脆给我也装个限制器或者炸弹喽。';
const segs = ["这是我给自己写的一个小软件，叫待办。它只干一件事，把微信群聊变成一张张能直接看的要点。","界面很简单。左边是要点列表，右边是内容区。每一条都自动打了标签，通知、待办、学业、活动，一眼分得清。","比如这一条，证件复印件提交。谁在催，还差多少人，几号之前要交，打开就能看到，不用再翻几百条聊天记录。","看完旧的，就点一键生成。它会读取你勾好的群，把最近一天的聊天交给 AI，自动提炼成一条条要点。","第一次用，先点右下角这个气泡，勾上你关心的群。再点右上角的齿轮，填一个 DeepSeek 的密钥。之后就不用管了。","点下去大概十几秒到一分钟，它会把聊天导出来，按群分别总结，再把结果写成新的要点，排在最上面。","整个流程都在你自己的电脑上完成。而且有个我特别喜欢的设定，总结完，原始的聊天记录会立刻删掉，硬盘上只留下整理好的要点。","要点还能自己改，可以新建、编辑、删除，也能按分类筛选。想让它每天自动跑一次，也不是不行。","代码开源在 GitHub，搜 chat digest 就能找到。如果它帮到了你，点个赞吧喵。"];
(async () => {
  const outDir = 'C:/Users/elysia/.dsh/chat-digest/video/audio';
  fs.mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < segs.length; i++) {
    const body = JSON.stringify({
      text: segs[i], text_lang: 'zh', ref_audio_path: REF, prompt_text: PROMPT, prompt_lang: 'zh',
      media_type: 'wav', streaming_mode: false, top_k: 15, top_p: 1, temperature: 1,
      text_split_method: 'cut5', batch_size: 1, speed_factor: 1.0,
    });
    const res = await fetch('http://127.0.0.1:9880/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    if (!res.ok) { console.log('FAIL seg' + i + ' ' + res.status); process.exit(1); }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outDir + '/seg' + String(i + 1).padStart(2, '0') + '.wav', buf);
    console.log('seg' + (i + 1) + ' ' + buf.length + 'B');
  }
})();
