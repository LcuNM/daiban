from PIL import Image
import numpy as np
p = r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale_full.png"
im = Image.open(p).convert("RGBA")
w, h = im.size
arr = np.array(im)
# 把左侧 14% 的孤立体（残留文字/图标）清掉
cut = int(w * 0.14)
arr[:, :cut, 3] = 0
im2 = Image.fromarray(arr, "RGBA")
im2 = im2.crop(im2.getbbox())
im2.save(p)
print("CLEANED", im2.size)
