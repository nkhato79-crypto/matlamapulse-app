#!/usr/bin/env python3
"""
Faceless YouTube Channel Automation Pipeline

Usage:
    python main.py --mode single --type long
    python main.py --mode single --type short
    python main.py --mode batch --longs 3 --shorts 5
    python main.py --mode topics
    python main.py --mode single --topic "5 stocks to buy now"
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import OUTPUT_DIR, VIDEOS_PER_DAY, SHORTS_PER_DAY, CHANNEL_NICHE
from scripts.script_generator import ScriptGenerator
from scripts.voiceover import VoiceoverGenerator
from scripts.video_assembler import VideoAssembler
from scripts.thumbnail_generator import ThumbnailGenerator
from scripts.uploader import YouTubeUploader


class Pipeline:
    def __init__(self, niche=None):
        self.niche = niche or CHANNEL_NICHE
        self.script_gen = ScriptGenerator(self.niche)
        self.voice_gen = VoiceoverGenerator()
        self.video_asm = VideoAssembler(self.niche)
        self.thumb_gen = ThumbnailGenerator(self.niche)
        self.uploader = YouTubeUploader()

    def create_video(self, topic=None, is_short=False, upload=False, background_video=None):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        vid_type = "short" if is_short else "long"
        prefix = f"{vid_type}_{timestamp}"

        print(f"\n{'='*60}")
        print(f"Creating {'Short' if is_short else 'Long-form'} Video")
        print(f"{'='*60}")

        print("\n[1/5] Generating script and metadata...")
        package = self.script_gen.generate_full_package(topic, is_short)
        print(f"  Title: {package['selected_title']}")
        print(f"  Topic: {package['topic']}")

        script_path = os.path.join(OUTPUT_DIR, f"{prefix}_script.json")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with open(script_path, "w") as f:
            json.dump(package, f, indent=2)

        print("\n[2/5] Generating voiceover...")
        audio_result = self.voice_gen.generate(
            package["script"],
            f"{prefix}_audio.mp3",
            with_subtitles=True,
        )
        print(f"  Audio: {audio_result['audio_path']}")

        print("\n[3/5] Generating thumbnail...")
        thumb_path = self.thumb_gen.generate(
            package["selected_title"],
            f"{prefix}_thumbnail.png",
        )
        print(f"  Thumbnail: {thumb_path}")

        print("\n[4/5] Assembling video...")
        video_path = self.video_asm.assemble_with_background(
            audio_result["audio_path"],
            f"{prefix}_final.mp4",
            subtitle_path=audio_result.get("subtitle_path"),
            background_video=background_video,
            is_short=is_short,
        )
        print(f"  Video: {video_path}")

        result = {
            "title": package["selected_title"],
            "description": package["description"],
            "tags": package["tags"],
            "category_id": package["category_id"],
            "video_path": video_path,
            "thumbnail_path": thumb_path,
            "script_path": script_path,
            "is_short": is_short,
        }

        if upload:
            print("\n[5/5] Uploading to YouTube...")
            upload_result = self.uploader.upload_with_thumbnail(
                video_path,
                thumb_path,
                package["selected_title"],
                package["description"],
                package["tags"],
                package["category_id"],
                privacy="private",
                is_short=is_short,
            )
            result["upload"] = upload_result
        else:
            print("\n[5/5] Skipping upload (use --upload to enable)")

        print(f"\n{'='*60}")
        print("DONE!")
        print(f"{'='*60}")
        return result

    def create_batch(self, num_longs=None, num_shorts=None, upload=False):
        num_longs = num_longs if num_longs is not None else VIDEOS_PER_DAY
        num_shorts = num_shorts if num_shorts is not None else SHORTS_PER_DAY

        results = []
        print(f"\nBatch: {num_longs} long videos + {num_shorts} shorts")

        for i in range(num_longs):
            print(f"\n--- Long Video {i+1}/{num_longs} ---")
            result = self.create_video(is_short=False, upload=upload)
            results.append(result)

        for i in range(num_shorts):
            print(f"\n--- Short {i+1}/{num_shorts} ---")
            result = self.create_video(is_short=True, upload=upload)
            results.append(result)

        summary_path = os.path.join(
            OUTPUT_DIR,
            f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
        )
        with open(summary_path, "w") as f:
            summary = []
            for r in results:
                summary.append({
                    "title": r["title"],
                    "video_path": r["video_path"],
                    "thumbnail_path": r["thumbnail_path"],
                    "is_short": r["is_short"],
                    "upload": r.get("upload", {}).get("status", "local_only"),
                })
            json.dump(summary, f, indent=2)

        print(f"\n\nBatch complete! Summary: {summary_path}")
        print(f"Total videos created: {len(results)}")
        return results

    def generate_topics(self):
        print(f"\nGenerating Shorts topics for '{self.niche}' niche...")
        topics = self.script_gen.generate_shorts_topics()
        print("\nViral Short Topics:")
        for i, topic in enumerate(topics, 1):
            print(f"  {i}. {topic}")
        return topics


def main():
    parser = argparse.ArgumentParser(description="Faceless YouTube Channel Automation")
    parser.add_argument("--mode", choices=["single", "batch", "topics"], default="single")
    parser.add_argument("--type", choices=["long", "short"], default="long")
    parser.add_argument("--topic", type=str, help="Specific topic for the video")
    parser.add_argument("--niche", type=str, default=None, help="Channel niche")
    parser.add_argument("--longs", type=int, default=None, help="Number of long videos in batch")
    parser.add_argument("--shorts", type=int, default=None, help="Number of shorts in batch")
    parser.add_argument("--upload", action="store_true", help="Upload to YouTube after creation")
    parser.add_argument("--background", type=str, help="Path to background video file")

    args = parser.parse_args()
    pipeline = Pipeline(args.niche)

    if args.mode == "single":
        pipeline.create_video(
            topic=args.topic,
            is_short=(args.type == "short"),
            upload=args.upload,
            background_video=args.background,
        )
    elif args.mode == "batch":
        pipeline.create_batch(
            num_longs=args.longs,
            num_shorts=args.shorts,
            upload=args.upload,
        )
    elif args.mode == "topics":
        pipeline.generate_topics()


if __name__ == "__main__":
    main()
