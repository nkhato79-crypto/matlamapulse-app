import os
import sys
import json
import time
import http.client
import httplib2
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, OUTPUT_DIR

try:
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    YOUTUBE_API_AVAILABLE = True
except ImportError:
    YOUTUBE_API_AVAILABLE = False

SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]
TOKEN_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "token.json")
CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "client_secrets.json")


class YouTubeUploader:
    def __init__(self):
        self.youtube = None
        if YOUTUBE_API_AVAILABLE:
            self._authenticate()

    def _authenticate(self):
        creds = None
        if os.path.exists(TOKEN_FILE):
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            elif os.path.exists(CLIENT_SECRETS_FILE):
                flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
                creds = flow.run_local_server(port=0)
            else:
                print("No client_secrets.json found. Creating template...")
                self._create_client_secrets_template()
                return

            with open(TOKEN_FILE, "w") as token:
                token.write(creds.to_json())

        self.youtube = build("youtube", "v3", credentials=creds)

    def _create_client_secrets_template(self):
        template = {
            "installed": {
                "client_id": YOUTUBE_CLIENT_ID or "YOUR_CLIENT_ID",
                "client_secret": YOUTUBE_CLIENT_SECRET or "YOUR_CLIENT_SECRET",
                "redirect_uris": ["http://localhost"],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }
        with open(CLIENT_SECRETS_FILE, "w") as f:
            json.dump(template, f, indent=2)
        print(f"Template created at {CLIENT_SECRETS_FILE}")
        print("Fill in your Google API credentials and run again.")

    def upload(self, video_path, title, description, tags, category_id="22", privacy="private", is_short=False):
        if not self.youtube:
            print("YouTube API not authenticated. Video saved locally.")
            return {"status": "local_only", "path": video_path}

        if is_short:
            title = f"{title} #Shorts"

        body = {
            "snippet": {
                "title": title[:100],
                "description": description[:5000],
                "tags": tags[:500],
                "categoryId": category_id,
            },
            "status": {
                "privacyStatus": privacy,
                "selfDeclaredMadeForKids": False,
            },
        }

        media = MediaFileUpload(video_path, chunksize=-1, resumable=True, mimetype="video/*")

        request = self.youtube.videos().insert(part=",".join(body.keys()), body=body, media_body=media)

        response = None
        retry_count = 0
        max_retries = 5

        while response is None:
            try:
                status, response = request.next_chunk()
                if status:
                    print(f"Upload {int(status.progress() * 100)}% complete")
            except http.client.HttpException as e:
                if retry_count < max_retries:
                    retry_count += 1
                    wait = 2 ** retry_count
                    print(f"Upload error, retrying in {wait}s...")
                    time.sleep(wait)
                else:
                    raise

        video_id = response["id"]
        print(f"Upload complete: https://youtube.com/watch?v={video_id}")
        return {"status": "uploaded", "video_id": video_id, "url": f"https://youtube.com/watch?v={video_id}"}

    def set_thumbnail(self, video_id, thumbnail_path):
        if not self.youtube:
            return
        media = MediaFileUpload(thumbnail_path, mimetype="image/png")
        self.youtube.thumbnails().set(videoId=video_id, media_body=media).execute()
        print(f"Thumbnail set for video {video_id}")

    def upload_with_thumbnail(self, video_path, thumbnail_path, title, description, tags, category_id="22", privacy="private", is_short=False):
        result = self.upload(video_path, title, description, tags, category_id, privacy, is_short)
        if result["status"] == "uploaded" and thumbnail_path:
            self.set_thumbnail(result["video_id"], thumbnail_path)
        return result


if __name__ == "__main__":
    uploader = YouTubeUploader()
    if uploader.youtube:
        print("YouTube API authenticated and ready.")
    else:
        print("YouTube API not configured. Videos will be saved locally.")
        print(f"To set up: edit {CLIENT_SECRETS_FILE} with your Google API credentials.")
