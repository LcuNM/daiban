from PIL import Image, ImageDraw
import numpy as np
src = r"C:\Users\elysia\.dsh\qwen-images\动漫风格的可爱鲸鱼少女立绘，Q版比例，蓝色长_Qwen2.1_960x1280_01.png"
dst = r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale.png"
im = Image.open(src).convert("RGB")
w, h = im.size
key = (255, 0, 255)
for pt in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
    ImageDraw.floodfill(im, pt, key, thresh=28)
arr = np.array(im)
mask = (arr[:,:,0] == 255) & (arr[:,:,1] == 0) & (arr[:,:,2] == 255)
rgba = np.dstack([arr, np.where(mask, 0, 255).astype(np.uint8)])
# 边缘羽化：对 alpha 做 1px 模糊
from PIL import ImageFilter
out = Image.fromarray(rgba, "RGBA")
a = out.split()[3].filter(ImageFilter.GaussianBlur(0.6))
out.putalpha(a)
bbox = out.getbbox()
out = out.crop(bbox)
out.save(dst)
print("SAVED", out.size)
