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
pdf_file = 'PyTorchPipeline.drawio.pdf'
svg_file = 'output_file.svg'
pdf_to_svg(pdf_file, svg_file)


# %%
