from PIL import Image
import numpy as np
p = r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale_full.png"
im = Image.open(p).convert("RGBA")
arr = np.array(im)
alpha = arr[:,:,3]
try:
    from scipy import ndimage
    lab, n = ndimage.label(alpha > 8)
    sizes = ndimage.sum(alpha > 8, lab, range(1, n+1))
    biggest = int(np.argmax(sizes)) + 1
    keep = (lab == biggest)
    arr[:,:,3] = np.where(keep, alpha, 0)
    im = Image.fromarray(arr, "RGBA")
    im = im.crop(im.getbbox())
    im.save(p)
    print("CLEANED", im.size, "regions", n)
except ImportError:
    print("NO_SCIPY")
