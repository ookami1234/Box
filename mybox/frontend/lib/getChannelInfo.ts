// lib/getChannelInfo.js
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

export interface ChannelInfo {
  channel_name: string;
  subscriber_count: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
  latest_videos: VideoItem[];
}

const getChannelInfo = async (channelId: string): Promise<{ success: boolean, data?: ChannelInfo, error?: string }> => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
        key: API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      const channelInfo = response.data.items[0];
      const channel_name = channelInfo.snippet.title;
      const subscriber_count = channelInfo.statistics.subscriberCount;
      const thumbnails = channelInfo.snippet.thumbnails;

      return {
        success: true,
        data: {
          channel_name,
          subscriber_count,
          thumbnails,
          latest_videos: [],
        },
      };
    } else {
      return { success: false, error: 'チャンネルが見つかりませんでした。' };
    }
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return { success: false, error: 'チャンネル情報の取得に失敗しました。' };
  }
};

export default getChannelInfo;
