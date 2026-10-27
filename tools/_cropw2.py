from PIL import Image
src = r"C:\Users\elysia\.dsh\chat-digest\video\_cha_cut.png"
im = Image.open(src)
w, h = im.size
crop = im.crop((int(w*0.16), 0, int(w*0.86), int(h*0.54)))
crop.save(r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale.png")
print("WHALE", crop.size)
