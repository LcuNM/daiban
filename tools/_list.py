import json, io
d = json.load(io.open(r'C:\Users\elysia\AppData\Local\Temp\s.json', encoding='utf-8'))
res = d['data']['result'][:12]
for i, v in enumerate(res):
    t = v.get('title','').replace('<em class="keyword">','').replace('</em>','')
    print(i, v.get('bvid'), '|', t[:40])
    print('   ', v.get('pic'))
