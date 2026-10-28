import base64
import os
import struct

def get_png_dimensions(file_path):
    with open(file_path, 'rb') as f:
        data = f.read(24)
        if data[:8] == b'\x89PNG\r\n\x1a\n':
            w, h = struct.unpack('>II', data[16:24])
            return w, h
    return 1024, 1024

pngs = [
    "analytics.png",
    "books.png",
    "mail.png",
    "pos.png",
    "Social.png"
]

for png in pngs:
    png_path = os.path.join("assets", png)
    if not os.path.exists(png_path):
        print(f"Not found: {png_path}")
        continue
    w, h = get_png_dimensions(png_path)
    with open(png_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    
    svg_content = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%">\n  <image href="data:image/png;base64,{b64}" width="{w}" height="{h}" />\n</svg>'
    
    svg_name = png.replace(".png", ".svg")
    with open(os.path.join("assets", svg_name), "w") as f:
        f.write(svg_content)
    print(f"Converted {png} to {svg_name}")
