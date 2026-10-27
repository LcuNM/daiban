from PIL import Image, ImageDraw, ImageFilter
import numpy as np
src = r"C:\Users\elysia\.dsh\chat-digest\video\_ref3.jpg"
im = Image.open(src).convert("RGB")
W, H = im.size
crop = im.crop((int(W*0.44), int(H*0.02), W, H))
w, h = crop.size
key = (255, 0, 255)
for pt in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(0,h//2),(w-1,h//2),(w//4,0)]:
    ImageDraw.floodfill(crop, pt, key, thresh=12)
arr = np.array(crop)
mask = (arr[:,:,0] == 255) & (arr[:,:,1] == 0) & (arr[:,:,2] == 0)
mask = (arr[:,:,0] == 255) & (arr[:,:,1] == 0) & (arr[:,:,2] == 255)
rgba = np.dstack([arr, np.where(mask, 0, 255).astype(np.uint8)])
out = Image.fromarray(rgba, "RGBA")
a = out.split()[3].filter(ImageFilter.GaussianBlur(0.5))
out.putalpha(a)
out = out.crop(out.getbbox())
out.save(r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale_full.png")
print("SAVED", out.size)
