from PIL import Image
import os
d = r"C:\Users\elysia\.dsh\chat-digest\video"
imgs = []
for i in range(6):
    p = os.path.join(d, "_r%d.jpg" % i)
    im = Image.open(p).convert("RGB")
    im.thumbnail((640, 400))
    imgs.append(im)
W = max(i.width for i in imgs) * 2
H = max(i.height for i in imgs) * 3
canvas = Image.new("RGB", (W, H), (20,20,20))
for idx, im in enumerate(imgs):
    x = (idx % 2) * (W//2)
    y = (idx // 2) * (H//3)
    canvas.paste(im, (x, y))
canvas.save(os.path.join(d, "_refs_grid.jpg"), quality=88)
print("SAVED", canvas.size)
