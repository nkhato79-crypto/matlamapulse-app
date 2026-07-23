import os
import sys
import json
import subprocess
import math

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import (
    OUTPUT_DIR,
    ASSETS_DIR,
    VIDEO_WIDTH,
    VIDEO_HEIGHT,
    SHORTS_WIDTH,
    SHORTS_HEIGHT,
    FPS,
    NICHE_CONFIG,
    CHANNEL_NICHE,
)


class VideoAssembler:
    def __init__(self, niche=None):
        self.niche = niche or CHANNEL_NICHE
        self.niche_config = NICHE_CONFIG.get(self.niche, NICHE_CONFIG["finance"])

    def _get_audio_duration(self, audio_path):
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                audio_path,
            ],
            capture_output=True,
            text=True,
        )
        info = json.loads(result.stdout)
        return float(info["format"]["duration"])

    def _generate_gradient_background(self, output_path, duration, is_short=False):
        width = SHORTS_WIDTH if is_short else VIDEO_WIDTH
        height = SHORTS_HEIGHT if is_short else VIDEO_HEIGHT
        colors = self.niche_config["thumbnail_colors"]

        subprocess.run(
            [
                "ffmpeg", "-y",
                "-f", "lavfi",
                "-i", f"color=c={colors['bg']}:s={width}x{height}:d={duration}:r={FPS}",
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                output_path,
            ],
            capture_output=True,
        )
        return output_path

    def _add_animated_subtitles(self, video_path, subtitle_path, output_path, is_short=False):
        font_size = 28 if is_short else 24
        margin_v = 80 if is_short else 50
        style = (
            f"FontSize={font_size},"
            f"FontName=Arial,"
            f"PrimaryColour=&H00FFFFFF,"
            f"OutlineColour=&H00000000,"
            f"BackColour=&H80000000,"
            f"Outline=2,"
            f"Shadow=1,"
            f"MarginV={margin_v},"
            f"Alignment=2,"
            f"Bold=1"
        )

        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", video_path,
                "-vf", f"subtitles={subtitle_path}:force_style='{style}'",
                "-c:v", "libx264",
                "-c:a", "copy",
                "-pix_fmt", "yuv420p",
                output_path,
            ],
            capture_output=True,
        )
        return output_path

    def assemble_with_background(self, audio_path, output_filename, subtitle_path=None, background_video=None, is_short=False):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        duration = self._get_audio_duration(audio_path)
        final_output = os.path.join(OUTPUT_DIR, output_filename)

        if background_video and os.path.exists(background_video):
            temp_output = os.path.join(OUTPUT_DIR, f"temp_{output_filename}")
            width = SHORTS_WIDTH if is_short else VIDEO_WIDTH
            height = SHORTS_HEIGHT if is_short else VIDEO_HEIGHT

            subprocess.run(
                [
                    "ffmpeg", "-y",
                    "-stream_loop", "-1",
                    "-i", background_video,
                    "-i", audio_path,
                    "-t", str(duration),
                    "-vf", f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}",
                    "-c:v", "libx264",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-shortest",
                    temp_output,
                ],
                capture_output=True,
            )
        else:
            temp_output = os.path.join(OUTPUT_DIR, f"temp_{output_filename}")
            bg_path = os.path.join(OUTPUT_DIR, "temp_bg.mp4")
            self._generate_gradient_background(bg_path, duration, is_short)

            subprocess.run(
                [
                    "ffmpeg", "-y",
                    "-i", bg_path,
                    "-i", audio_path,
                    "-c:v", "libx264",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-shortest",
                    temp_output,
                ],
                capture_output=True,
            )
            if os.path.exists(bg_path):
                os.remove(bg_path)

        if subtitle_path and os.path.exists(subtitle_path):
            self._add_animated_subtitles(temp_output, subtitle_path, final_output, is_short)
            if os.path.exists(temp_output):
                os.remove(temp_output)
        else:
            os.rename(temp_output, final_output)

        return final_output

    def assemble_slideshow(self, audio_path, image_paths, output_filename, subtitle_path=None, is_short=False):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        duration = self._get_audio_duration(audio_path)
        final_output = os.path.join(OUTPUT_DIR, output_filename)

        if not image_paths:
            return self.assemble_with_background(audio_path, output_filename, subtitle_path, is_short=is_short)

        seconds_per_image = duration / len(image_paths)
        width = SHORTS_WIDTH if is_short else VIDEO_WIDTH
        height = SHORTS_HEIGHT if is_short else VIDEO_HEIGHT

        concat_file = os.path.join(OUTPUT_DIR, "concat_list.txt")
        temp_clips = []

        for i, img_path in enumerate(image_paths):
            clip_path = os.path.join(OUTPUT_DIR, f"temp_clip_{i}.mp4")
            subprocess.run(
                [
                    "ffmpeg", "-y",
                    "-loop", "1",
                    "-i", img_path,
                    "-t", str(seconds_per_image),
                    "-vf", (
                        f"scale={width}:{height}:force_original_aspect_ratio=increase,"
                        f"crop={width}:{height},"
                        f"zoompan=z='min(zoom+0.0005,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(seconds_per_image*FPS)}:s={width}x{height}:fps={FPS}"
                    ),
                    "-c:v", "libx264",
                    "-pix_fmt", "yuv420p",
                    clip_path,
                ],
                capture_output=True,
            )
            temp_clips.append(clip_path)

        with open(concat_file, "w") as f:
            for clip in temp_clips:
                f.write(f"file '{clip}'\n")

        temp_video = os.path.join(OUTPUT_DIR, f"temp_slideshow_{output_filename}")
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file,
                "-i", audio_path,
                "-c:v", "libx264",
                "-c:a", "aac",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                temp_video,
            ],
            capture_output=True,
        )

        if subtitle_path and os.path.exists(subtitle_path):
            self._add_animated_subtitles(temp_video, subtitle_path, final_output, is_short)
            os.remove(temp_video)
        else:
            os.rename(temp_video, final_output)

        for clip in temp_clips:
            if os.path.exists(clip):
                os.remove(clip)
        if os.path.exists(concat_file):
            os.remove(concat_file)

        return final_output


if __name__ == "__main__":
    assembler = VideoAssembler()
    print("VideoAssembler ready. Requires audio file to assemble.")
    print(f"Output directory: {OUTPUT_DIR}")
