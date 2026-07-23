import asyncio
import ssl
import edge_tts
import os
import sys
import re
import aiohttp

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import VOICE_NAME, OUTPUT_DIR


def _build_ssl_context():
    ca_paths = [
        os.environ.get("SSL_CERT_FILE", ""),
        os.environ.get("REQUESTS_CA_BUNDLE", ""),
        "/root/.ccr/ca-bundle.crt",
        "/etc/ssl/certs/ca-certificates.crt",
    ]
    for path in ca_paths:
        if path and os.path.exists(path):
            ctx = ssl.create_default_context(cafile=path)
            return ctx
    return ssl.create_default_context()


class VoiceoverGenerator:
    def __init__(self, voice=None):
        self.voice = voice or VOICE_NAME

    def _clean_script(self, script):
        script = re.sub(r"[*#_`]", "", script)
        script = re.sub(r"\n{3,}", "\n\n", script)
        return script.strip()

    async def _generate_async(self, text, output_path, subtitle_path=None):
        text = self._clean_script(text)
        ssl_ctx = _build_ssl_context()
        proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
        connector = aiohttp.TCPConnector(ssl=ssl_ctx)
        communicate = edge_tts.Communicate(
            text, self.voice, rate="+5%", pitch="+0Hz",
            connector=connector, proxy=proxy,
        )

        if subtitle_path:
            submaker = edge_tts.SubMaker()
            with open(output_path, "wb") as audio_file:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_file.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        submaker.feed(chunk)
            with open(subtitle_path, "w", encoding="utf-8") as sub_file:
                sub_file.write(submaker.generate_subs())
        else:
            await communicate.save(output_path)

        return output_path

    def generate(self, script, filename="voiceover.mp3", with_subtitles=True):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        output_path = os.path.join(OUTPUT_DIR, filename)
        subtitle_path = os.path.join(OUTPUT_DIR, filename.replace(".mp3", ".vtt")) if with_subtitles else None

        asyncio.run(self._generate_async(script, output_path, subtitle_path))

        result = {"audio_path": output_path}
        if subtitle_path and os.path.exists(subtitle_path):
            result["subtitle_path"] = subtitle_path
        return result

    @staticmethod
    async def list_voices(language="en"):
        voices = await edge_tts.list_voices()
        return [v for v in voices if v["Locale"].startswith(language)]


if __name__ == "__main__":
    gen = VoiceoverGenerator()
    test_script = "This is a test of the voiceover system. If you can hear this, the text to speech engine is working perfectly."
    result = gen.generate(test_script, "test_voiceover.mp3")
    print(f"Audio saved to: {result['audio_path']}")
    if "subtitle_path" in result:
        print(f"Subtitles saved to: {result['subtitle_path']}")
