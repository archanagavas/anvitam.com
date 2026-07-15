import os
from PIL import Image

def convert_favicon():
    input_path = 'public/favicon.png'
    output_png_path = 'public/favicon.png'
    output_ico_path = 'public/favicon.ico'

    if not os.path.exists(input_path):
        print(f"Error: {input_path} does not exist.")
        return

    print(f"Loading {input_path}...")
    # Open the image (Pillow handles JPEG format even if named .png)
    img = Image.open(input_path)
    print(f"Original format: {img.format}, size: {img.size}")

    # Convert to RGBA (to support transparency if we ever make it transparent, 
    # but since it's JPEG it will have a solid background, we'll keep it clean)
    img_rgba = img.convert('RGBA')

    # Resize to 192x192 for the main favicon.png (multiple of 48)
    print("Resizing to 192x192...")
    resized_png = img_rgba.resize((192, 192), Image.Resampling.LANCZOS)
    
    # Save as true PNG
    resized_png.save(output_png_path, format='PNG')
    print(f"Saved true PNG favicon to {output_png_path}")

    # Generate ICO file containing standard sizes (16x16, 32x32, 48x48)
    # 48x48 is explicitly required by Google guidelines
    print("Generating ICO file with sizes 16x16, 32x32, 48x48...")
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    img_rgba.save(output_ico_path, format='ICO', sizes=ico_sizes)
    print(f"Saved ICO favicon to {output_ico_path}")

if __name__ == '__main__':
    convert_favicon()
