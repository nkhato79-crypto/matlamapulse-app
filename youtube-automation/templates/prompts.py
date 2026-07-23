LONG_VIDEO_SCRIPT = """You are a top YouTube scriptwriter for faceless channels in the {niche} niche.

Write a compelling 8-12 minute video script on: "{topic}"

Requirements:
- Hook in the first 5 seconds (question, bold claim, or shocking stat)
- Conversational tone, as if talking to a friend
- Use short sentences for TTS clarity
- Include pattern interrupts every 60-90 seconds ("Here's where it gets interesting...", "But wait...", "Now pay attention to this...")
- End with a strong CTA: subscribe, comment, like
- NO emojis, NO markdown, NO timestamps
- Write ONLY the spoken words, nothing else
- Break into paragraphs (each paragraph = one scene)
- Each paragraph should be 3-5 sentences max

Target: 1500-2000 words for 8-12 minutes of content."""

SHORT_VIDEO_SCRIPT = """You are a viral YouTube Shorts scriptwriter for the {niche} niche.

Write a punchy 30-60 second script on: "{topic}"

Requirements:
- IMMEDIATE hook in first 2 seconds (no intro, no greeting)
- One powerful insight or tip per Short
- Conversational, urgent tone
- End with a cliffhanger or "follow for more"
- NO emojis, NO markdown
- Write ONLY the spoken words
- 80-150 words max
- Must feel incomplete so viewer wants more"""

TITLE_GENERATOR = """Generate 5 clickbait-but-not-misleading YouTube titles for a video about: "{topic}"

Niche: {niche}

Rules:
- Use numbers when possible ("7 Ways...", "The #1...")
- Create curiosity gap
- Keep under 60 characters
- Use power words (secret, shocking, never, always, must)
- One title should use "Nobody Tells You" format
- Return ONLY the titles, one per line, numbered 1-5"""

DESCRIPTION_GENERATOR = """Write a YouTube video description for: "{title}"

Niche: {niche}

Include:
- 2-sentence summary with main keyword in first line
- 3 bullet points of what viewers will learn
- Call to action (subscribe, comment)
- 5 relevant hashtags

Keep it under 200 words. No emojis."""

TAGS_GENERATOR = """Generate 15-20 YouTube tags for a video titled: "{title}"

Niche: {niche}

Rules:
- Mix broad and specific tags
- Include the exact title as one tag
- Include common misspellings of key terms
- Return as comma-separated list
- Each tag under 30 characters"""

SHORTS_TOPIC_GENERATOR = """Generate 10 viral YouTube Shorts topics for the {niche} niche.

Requirements:
- Each topic should be a single surprising fact, tip, or insight
- Topics that trigger emotional response (shock, curiosity, fear of missing out)
- Mix educational and entertaining angles
- Format: one topic per line, numbered 1-10
- Keep each topic under 15 words"""
