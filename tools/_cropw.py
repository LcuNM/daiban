from PIL import Image
src = r"C:\Users\elysia\.dsh\chat-digest\video\_cha_cut.png"
im = Image.open(src)
w, h = im.size
# 取人物主体（去掉右侧大块留白）
crop = im.crop((int(w*0.18), 0, int(w*0.88), h))
crop.save(r"C:\Users\elysia\.dsh\chat-digest\mock\out\whale.png")
print("WHALE", crop.size)
