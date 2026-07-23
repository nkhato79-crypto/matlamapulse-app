import anthropic
import random
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import ANTHROPIC_API_KEY, NICHE_CONFIG, CHANNEL_NICHE
from templates.prompts import (
    LONG_VIDEO_SCRIPT,
    SHORT_VIDEO_SCRIPT,
    TITLE_GENERATOR,
    DESCRIPTION_GENERATOR,
    TAGS_GENERATOR,
    SHORTS_TOPIC_GENERATOR,
)


class ScriptGenerator:
    def __init__(self, niche=None):
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        self.niche = niche or CHANNEL_NICHE
        self.niche_config = NICHE_CONFIG.get(self.niche, NICHE_CONFIG["finance"])

    def _call_claude(self, prompt, max_tokens=4096):
        message = self.client.messages.create(
            model="claude-sonnet-5",
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    def generate_script(self, topic=None, is_short=False):
        if topic is None:
            topic = random.choice(self.niche_config["topics"])

        template = SHORT_VIDEO_SCRIPT if is_short else LONG_VIDEO_SCRIPT
        prompt = template.format(niche=self.niche, topic=topic)
        script = self._call_claude(prompt)
        return {"topic": topic, "script": script, "is_short": is_short}

    def generate_title(self, topic):
        prompt = TITLE_GENERATOR.format(topic=topic, niche=self.niche)
        response = self._call_claude(prompt, max_tokens=500)
        titles = [line.strip().lstrip("0123456789. ") for line in response.strip().split("\n") if line.strip()]
        return titles

    def generate_description(self, title):
        prompt = DESCRIPTION_GENERATOR.format(title=title, niche=self.niche)
        return self._call_claude(prompt, max_tokens=500)

    def generate_tags(self, title):
        prompt = TAGS_GENERATOR.format(title=title, niche=self.niche)
        response = self._call_claude(prompt, max_tokens=300)
        return [tag.strip() for tag in response.split(",") if tag.strip()]

    def generate_shorts_topics(self):
        prompt = SHORTS_TOPIC_GENERATOR.format(niche=self.niche)
        response = self._call_claude(prompt, max_tokens=500)
        topics = [line.strip().lstrip("0123456789. ") for line in response.strip().split("\n") if line.strip()]
        return topics

    def generate_full_package(self, topic=None, is_short=False):
        script_data = self.generate_script(topic, is_short)
        titles = self.generate_title(script_data["topic"])
        best_title = titles[0] if titles else script_data["topic"]
        description = self.generate_description(best_title)
        tags = self.generate_tags(best_title)

        return {
            "topic": script_data["topic"],
            "script": script_data["script"],
            "is_short": is_short,
            "titles": titles,
            "selected_title": best_title,
            "description": description,
            "tags": tags,
            "category_id": self.niche_config["category_id"],
        }


if __name__ == "__main__":
    gen = ScriptGenerator()
    package = gen.generate_full_package()
    print(f"Title: {package['selected_title']}")
    print(f"Tags: {', '.join(package['tags'][:5])}")
    print(f"\nScript preview:\n{package['script'][:500]}...")
