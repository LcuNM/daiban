import sys
from PIL import Image
src = r"C:\Users\elysia\.dsh\qwen-images\动漫风格的可爱鲸鱼少女立绘，Q版比例，蓝色长_Qwen2.1_960x1280_01.png"
dst = r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale.png"
im = Image.open(src).convert("RGBA")
px = im.load()
w, h = im.size
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        lum = max(r, g, b)
        if lum >= 243:
            na = 0
        elif lum <= 228:
            na = 255
        else:
            na = int(255 * (243 - lum) / 15.0)
        px[x, y] = (r, g, b, min(a, na))
# 裁掉四周多余透明
bbox = im.getbbox()
im = im.crop(bbox)
im.save(dst)
print("SAVED", im.size)
