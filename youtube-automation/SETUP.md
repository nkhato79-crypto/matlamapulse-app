# Setup Guide

## 1. Install Dependencies

```bash
cd youtube-automation
pip install -r requirements.txt
```

Also install FFmpeg:
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

### Anthropic API Key (for script generation)
1. Go to https://console.anthropic.com/
2. Create an API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

### YouTube Data API (for auto-upload)
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create OAuth 2.0 credentials (Desktop application)
5. Download as `client_secrets.json` and place in `youtube-automation/`
6. First run will open browser for OAuth consent

## 3. Usage

### Generate a single long-form video:
```bash
python main.py --mode single --type long
```

### Generate a single Short:
```bash
python main.py --mode single --type short
```

### Generate on a specific topic:
```bash
python main.py --mode single --topic "5 stocks to buy in 2025"
```

### Generate a daily batch:
```bash
python main.py --mode batch --longs 3 --shorts 5
```

### Generate with auto-upload:
```bash
python main.py --mode batch --longs 2 --shorts 3 --upload
```

### Use a background video:
```bash
python main.py --mode single --type long --background assets/stock_footage.mp4
```

### Generate topic ideas:
```bash
python main.py --mode topics
```

### Switch niche:
```bash
python main.py --mode single --niche ai_tech
python main.py --mode batch --niche motivation --longs 2 --shorts 5
```

## 4. Adding Background Videos

Place stock footage in the `assets/` directory:
- Download free footage from Pexels (pexels.com) or Pixabay
- For finance: stock market charts, city skylines, money visuals
- For shorts: satisfying or looping backgrounds

## 5. Output

All generated content goes to the `output/` directory:
- `*_script.json` - Full script and metadata
- `*_audio.mp3` - Voiceover audio
- `*_audio.vtt` - Subtitle file
- `*_thumbnail.png` - Generated thumbnail
- `*_final.mp4` - Final assembled video
- `batch_*.json` - Batch summary

## 6. Daily Workflow

1. Morning: Run `python main.py --mode batch --longs 3 --shorts 5`
2. Review generated content in `output/`
3. Upload manually or use `--upload` flag
4. Post Shorts to TikTok/Instagram Reels too
5. Engage with comments throughout the day
