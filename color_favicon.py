from PIL import Image

# Open the transparent favicon
img = Image.open('images/favicon_transparent.png')
img = img.convert("RGBA")

datas = img.getdata()

new_data = []
# App dark color #1A1A1A -> (26, 26, 26)
for item in datas:
    # item is (R, G, B, A)
    # keep alpha, change RGB to 26, 26, 26
    new_data.append((26, 26, 26, item[3]))

img.putdata(new_data)
img.save('images/favicon_transparent.png', "PNG")
print("Favicon foreground color changed to app black.")
