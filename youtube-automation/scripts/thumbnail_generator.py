import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import OUTPUT_DIR, NICHE_CONFIG, CHANNEL_NICHE


class ThumbnailGenerator:
    def __init__(self, niche=None):
        self.niche = niche or CHANNEL_NICHE
        self.niche_config = NICHE_CONFIG.get(self.niche, NICHE_CONFIG["finance"])
        self.colors = self.niche_config["thumbnail_colors"]
        self.width = 1280
        self.height = 720

    def _hex_to_rgb(self, hex_color):
        hex_color = hex_color.lstrip("#")
        return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))

    def _get_font(self, size):
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        ]
        for path in font_paths:
            if os.path.exists(path):
                return ImageFont.truetype(path, size)
        return ImageFont.load_default()

    def _add_gradient_overlay(self, img, direction="bottom"):
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        for i in range(img.height):
            if direction == "bottom":
                alpha = int(220 * (i / img.height))
            else:
                alpha = int(220 * (1 - i / img.height))
            draw.rectangle([0, i, img.width, i + 1], fill=(0, 0, 0, alpha))
        return Image.alpha_composite(img.convert("RGBA"), overlay)

    def generate(self, title, output_filename="thumbnail.png", background_image=None):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        bg_color = self._hex_to_rgb(self.colors["bg"])
        text_color = self._hex_to_rgb(self.colors["text"])
        accent_color = self._hex_to_rgb(self.colors["accent"])

        if background_image and os.path.exists(background_image):
            img = Image.open(background_image).resize((self.width, self.height))
            img = self._add_gradient_overlay(img)
        else:
            img = Image.new("RGBA", (self.width, self.height), (*bg_color, 255))
            draw = ImageDraw.Draw(img)
            for i in range(self.height):
                r = int(bg_color[0] + (accent_color[0] - bg_color[0]) * i / self.height * 0.3)
                g = int(bg_color[1] + (accent_color[1] - bg_color[1]) * i / self.height * 0.3)
                b = int(bg_color[2] + (accent_color[2] - bg_color[2]) * i / self.height * 0.3)
                draw.rectangle([0, i, self.width, i + 1], fill=(r, g, b, 255))

        draw = ImageDraw.Draw(img)

        accent_bar_height = 8
        draw.rectangle(
            [0, self.height - accent_bar_height, self.width, self.height],
            fill=(*accent_color, 255),
        )

        title_upper = title.upper()
        font_size = 72
        font = self._get_font(font_size)

        wrapped = textwrap.wrap(title_upper, width=18)
        if len(wrapped) > 3:
            font_size = 58
            font = self._get_font(font_size)
            wrapped = textwrap.wrap(title_upper, width=22)

        line_height = font_size + 10
        total_text_height = len(wrapped) * line_height
        y_start = (self.height - total_text_height) // 2

        for i, line in enumerate(wrapped[:4]):
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x = (self.width - text_width) // 2
            y = y_start + i * line_height

            shadow_offset = 3
            draw.text(
                (x + shadow_offset, y + shadow_offset),
                line,
                font=font,
                fill=(0, 0, 0, 200),
            )
            draw.text((x, y), line, font=font, fill=(*text_color, 255))

        final = img.convert("RGB")
        final.save(output_path, "PNG", quality=95)
        return output_path

    def generate_shorts_thumbnail(self, title, output_filename="shorts_thumb.png"):
        self.width = 1080
        self.height = 1920
        result = self.generate(title, output_filename)
        self.width = 1280
        self.height = 720
        return result


if __name__ == "__main__":
    gen = ThumbnailGenerator()
    path = gen.generate("5 Money Habits That Changed My Life Forever")
    print(f"Thumbnail saved to: {path}")
