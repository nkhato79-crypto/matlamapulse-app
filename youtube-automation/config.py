import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
YOUTUBE_CLIENT_ID = os.getenv("YOUTUBE_CLIENT_ID")
YOUTUBE_CLIENT_SECRET = os.getenv("YOUTUBE_CLIENT_SECRET")

CHANNEL_NICHE = os.getenv("CHANNEL_NICHE", "finance")
VOICE_NAME = os.getenv("VOICE_NAME", "en-US-GuyNeural")
VIDEOS_PER_DAY = int(os.getenv("VIDEOS_PER_DAY", "3"))
SHORTS_PER_DAY = int(os.getenv("SHORTS_PER_DAY", "5"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
SHORTS_WIDTH = 1080
SHORTS_HEIGHT = 1920
FPS = 30

AVAILABLE_VOICES = {
    "male_us": "en-US-GuyNeural",
    "male_uk": "en-GB-RyanNeural",
    "female_us": "en-US-JennyNeural",
    "female_uk": "en-GB-SoniaNeural",
    "male_deep": "en-US-DavisNeural",
    "female_warm": "en-US-AriaNeural",
}

NICHE_CONFIG = {
    "finance": {
        "topics": [
            "passive income strategies",
            "stock market for beginners",
            "crypto trading tips",
            "budgeting hacks",
            "side hustle ideas",
            "investing mistakes to avoid",
            "money psychology",
            "real estate investing",
            "debt payoff strategies",
            "retirement planning",
            "forex trading basics",
            "dividend investing",
            "wealth building habits",
            "tax saving strategies",
            "financial freedom roadmap",
        ],
        "tags": ["finance", "money", "investing", "stocks", "wealth", "passive income", "trading"],
        "thumbnail_colors": {"bg": "#0a0a0a", "text": "#00ff88", "accent": "#ffcc00"},
        "category_id": "22",
    },
    "ai_tech": {
        "topics": [
            "AI tools you need to know",
            "ChatGPT money-making hacks",
            "AI replacing jobs",
            "future of AI",
            "best AI apps",
            "AI side hustles",
            "machine learning explained",
            "AI in finance",
            "automation tools",
            "tech news this week",
        ],
        "tags": ["AI", "technology", "artificial intelligence", "tech", "automation", "ChatGPT"],
        "thumbnail_colors": {"bg": "#0d1117", "text": "#58a6ff", "accent": "#f0883e"},
        "category_id": "28",
    },
    "motivation": {
        "topics": [
            "stoic wisdom for modern life",
            "morning routine of millionaires",
            "discipline beats motivation",
            "Marcus Aurelius life lessons",
            "mental toughness secrets",
            "habits of successful people",
            "overcoming failure",
            "productivity hacks",
            "mindset shifts",
            "quotes that changed lives",
        ],
        "tags": ["motivation", "stoicism", "self improvement", "mindset", "success", "discipline"],
        "thumbnail_colors": {"bg": "#1a1a2e", "text": "#e94560", "accent": "#f5f5f5"},
        "category_id": "22",
    },
    "scary_stories": {
        "topics": [
            "true scary stories from Reddit",
            "creepy encounters",
            "paranormal experiences",
            "horror stories",
            "unsolved mysteries",
            "dark web stories",
            "true crime cases",
            "ghost encounters",
            "disturbing facts",
            "unexplained events",
        ],
        "tags": ["scary stories", "horror", "creepy", "true scary stories", "paranormal", "reddit"],
        "thumbnail_colors": {"bg": "#0a0a0a", "text": "#ff0000", "accent": "#ffffff"},
        "category_id": "24",
    },
}
