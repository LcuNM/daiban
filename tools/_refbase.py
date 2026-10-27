from PIL import Image, ImageDraw
import numpy as np
src = r"C:\Users\elysia\.dsh\chat-digest\video\_ref2.jpg"
dst = r"C:\Users\elysia\.dsh\chat-digest\mock\out\ref_base.png"
im = Image.open(src).convert("RGB")
W, H = im.size
arr = np.array(im)
# 取左上角区域颜色作为背景参考（避开文字）
patch = arr[10:40, 10:40].reshape(-1,3)
bg = tuple(int(v) for v in patch.mean(axis=0))
img = Image.new("RGB", (W, H), bg)
d = ImageDraw.Draw(img)
# 绘制淡网格，跟原图密度近似
step = 56
line = tuple(max(0, c - 10) for c in bg)
for x in range(0, W, step):
    d.line([(x,0),(x,H)], fill=line, width=1)
for y in range(0, H, step):
    d.line([(0,y),(W,y)], fill=line, width=1)
# 右侧保留原图角色
right = im.crop((int(W*0.50), 0, W, H))
img.paste(right, (int(W*0.50), 0))
img.save(dst)
print("BASE", img.size, bg)
