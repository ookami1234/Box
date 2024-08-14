import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

const getChannelId = async (username: string): Promise<{ success: boolean, channelId?: string, error?: string }> => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
      params: {
        part: 'id',
        forUsername: username,
        key: API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      return { success: true, channelId: response.data.items[0].id };
    } else {
      return { success: false, error: 'チャンネルが見つかりませんでした。' };
    }
  } catch (error) {
    console.error('Error fetching channel ID:', error);
    return { success: false, error: 'チャンネルIDの取得に失敗しました。' };
  }
};

export default getChannelId;
