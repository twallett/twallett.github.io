#%%
# from PIL import Image

# def remove_white_background(
#     input_path,
#     output_path,
#     threshold=240  # how close to white (0–255)
# ):
#     img = Image.open(input_path).convert("RGBA")
#     data = img.getdata()

#     new_data = []
#     for r, g, b, a in data:
#         if r > threshold and g > threshold and b > threshold:
#             # Make pixel transparent
#             new_data.append((r, g, b, 0))
#         else:
#             new_data.append((r, g, b, a))

#     img.putdata(new_data)
#     img.save(output_path, "PNG")

# if __name__ == "__main__":
#     remove_white_background(
#         "my-site/public/",
#         "output.png",
#         threshold=240
#     )

# %%
from PIL import Image, ImageSequence

def remove_white_bg_gif(
    input_path,
    output_path,
    threshold=240
):
    gif = Image.open(input_path)

    frames = []
    durations = []

    for frame in ImageSequence.Iterator(gif):
        frame = frame.convert("RGBA")
        data = frame.getdata()

        new_data = []
        for r, g, b, a in data:
            if r > threshold and g > threshold and b > threshold:
                new_data.append((r, g, b, 0))  # transparent
            else:
                new_data.append((r, g, b, a))

        frame.putdata(new_data)
        frames.append(frame)
        durations.append(frame.info.get("duration", 40))

    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=gif.info.get("loop", 0),
        disposal=2,
        transparency=0
    )

if __name__ == "__main__":
    remove_white_bg_gif(
        "my-site/public/neural-network-foundations.gif",
        "output.gif",
        threshold=240
    )

# %%
