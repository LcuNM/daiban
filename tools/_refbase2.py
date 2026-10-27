from PIL import Image, ImageDraw
import numpy as np
src = r"C:\Users\elysia\.dsh\chat-digest\video\_ref2.jpg"
dst = r"C:\Users\elysia\.dsh\chat-digest\mock\out\ref_base.png".replace('\\','\')
im = Image.open(src).convert("RGB")
W, H = im.size
arr = np.array(im)
patch = arr[10:40, 10:40].reshape(-1,3)
bg = tuple(int(v) for v in patch.mean(axis=0))
img = Image.new("RGB", (W, H), bg)
d = ImageDraw.Draw(img)
step = 56
line = tuple(max(0, c - 10) for c in bg)
for x in range(0, W, step):
    d.line([(x,0),(x,H)], fill=line, width=1)
for y in range(0, H, step):
    d.line([(0,y),(W,y)], fill=line, width=1)
img.save(r"C:\Users\elysia\.dsh\chat-digest\mock\out\ref_base.png")
print("BGOK", img.size, bg)
