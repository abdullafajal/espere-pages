from PIL import Image

# Open the logo
img = Image.open('images/logo.png')
img = img.convert("RGBA")

datas = img.getdata()

new_data = []
# Get the background color from top-left pixel
bg_color = datas[0]

# If it's a solid background (e.g. white or black), we'll make it transparent
# Allow a small threshold for anti-aliasing
for item in datas:
    # Check if pixel is close to bg_color
    if abs(item[0] - bg_color[0]) < 15 and abs(item[1] - bg_color[1]) < 15 and abs(item[2] - bg_color[2]) < 15:
        new_data.append((255, 255, 255, 0)) # fully transparent
    else:
        new_data.append(item)

img.putdata(new_data)
# Save it as a smaller size for favicon
img.thumbnail((256, 256))
img.save('images/favicon_transparent.png', "PNG")
print("Saved images/favicon_transparent.png")
