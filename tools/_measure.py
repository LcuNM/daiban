from PIL import Image
import numpy as np
im = Image.open(r"C:\Users\elysia\.dsh\chat-digest\video\_ref2.jpg").convert("L")
W, H = im.size
arr = np.array(im)
region = arr[:, :int(W*0.50)]
dark = (region < 120).sum(axis=1)
rows = dark > 3
runs = []
start = None
for y in range(H):
    if rows[y] and start is None:
        start = y
    elif not rows[y] and start is not None:
        if y - start > 4:
            xs = np.where(region[start:y].min(axis=0) < 120)[0]
            x0 = int(xs.min()) if len(xs) else -1
            x1 = int(xs.max()) if len(xs) else -1
            runs.append((start, y, y-start, x0, x1))
        start = None
for r in runs:
    print("y0=%d y1=%d h=%d x0=%d x1=%d" % r)
