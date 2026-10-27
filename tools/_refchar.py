from PIL import Image
im = Image.open(r"C:\Users\elysia\.dsh\chat-digest\video\_ref2.jpg").convert("RGB")
W, H = im.size
crop = im.crop((int(W*0.48), 0, W, H))
crop.save(r"C:\Users\elysia\.dsh\chat-digest\video\_ref_char.jpg", quality=95)
print("CROP", crop.size)
