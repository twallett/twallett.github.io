#%%
import subprocess

def pdf_to_svg(input_pdf, output_svg):
    try:
        # Construct the pdftocairo command
        command = [
            'pdftocairo', 
            '-svg',       # Output as SVG
            input_pdf,    # Input file (PDF)
            output_svg    # Output SVG file
        ]
        
        # Run the command
        subprocess.run(command, check=True)
        print(f"Conversion successful! SVG saved as {output_svg}")
    
    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")

# Example usage:
pdf_file = 'postoperative-com.pdf'
svg_file = 'output_file.svg'
pdf_to_svg(pdf_file, svg_file)


# %%
import subprocess

def convert_gif_to_mp4(input_gif_path, output_mp4_path):
    command = [
        'ffmpeg',
        '-y',  # Overwrite output file without asking
        '-i', input_gif_path,
        '-movflags', 'faststart',  # For web optimization
        '-pix_fmt', 'yuv420p',     # Compatibility with more players
        output_mp4_path
    ]
    try:
        subprocess.run(command, check=True)
        print(f"Converted {input_gif_path} to {output_mp4_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")

# Example usage:
convert_gif_to_mp4("IMG_4244.gif", "output.mp4")

# %%
