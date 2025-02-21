from PIL import Image

# Open the image
image = Image.open("logo.jpg").convert("RGBA")

# Make black pixels transparent
datas = image.getdata()
new_data = []
for item in datas:
    # If the pixel is black or near-black, make it transparent
    if item[:3] == (0, 0, 0) or sum(item[:3]) < 50: 
        new_data.append((0, 0, 0, 0))  # Transparent
    else:
        new_data.append(item)

# Apply transparency and save as PNG
image.putdata(new_data)
image.save("logo.png", "PNG")

print("✅ Logo converted to transparent PNG (logo.png)")
