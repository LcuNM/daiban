from PIL import Image, ImageDraw, ImageFilter
import numpy as np
src = r"C:\Users\elysia\.dsh\chat-digest\video\_r1.jpg"
dst = r"C:\Users\elysia\.dsh\chat-digest\video\_cha_cut.png"
im = Image.open(src).convert("RGB")
w, h = im.size
key = (255, 0, 255)
for pt in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
    ImageDraw.floodfill(im, pt, key, thresh=26)
arr = np.array(im)
mask = (arr[:,:,0] == 255) & (arr[:,:,1] == 0) & (arr[:,:,2] == 255)
rgba = np.dstack([arr, np.where(mask, 0, 255).astype(np.uint8)])
out = Image.fromarray(rgba, "RGBA")
out = out.crop(out.getbbox())
out.save(dst)
print("SIZE", out.size)
