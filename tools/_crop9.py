from PIL import Image
im = Image.open(r"C:\Users\elysia\.dsh\chat-digest\video\_ref3.jpg").convert("RGB")
W, H = im.size
crop = im.crop((int(W*0.46), 0, W, H))
crop.save(r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale_full.png")
print("CROP", crop.size)
