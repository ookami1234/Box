import os
import requests

def get_latest_videos(channel_id):
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return {"success": False, "error": "YouTube APIキーが設定されていません"}

    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={channel_id}&maxResults=3&order=date&type=video&key={api_key}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return {"success": True, "videos": data.get("items", [])}
        else:
            error_message = f"APIリクエスト失敗: ステータスコード {response.status_code}, レスポンス: {response.text}"
            print(error_message)  # ログにエラーメッセージを出力
            return {"success": False, "error": error_message}
    except Exception as e:
        error_message = f"ネットワークエラー: {str(e)}"
        print(error_message)  # ログにエラーメッセージを出力
        return {"success": False, "error": error_message}

def get_channel_info(channel_id):
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return {"success": False, "error": "YouTube APIキーが設定されていません"}

    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={api_key}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data.get("items"):
                item = data["items"][0]
                return {
                    "success": True,
                    "data": {
                        "channel_name": item["snippet"]["title"],
                        "subscriber_count": item["statistics"]["subscriberCount"],
                        "thumbnails": item["snippet"]["thumbnails"]
                    }
                }
        return {"success": False, "error": "チャンネル情報が見つかりません"}
    except Exception as e:
        return {"success": False, "error": str(e)}
