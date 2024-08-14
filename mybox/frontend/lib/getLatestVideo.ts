import axios from 'axios';

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

const getLatestVideo = async (channelId: string): Promise<{ success: boolean, videos?: VideoItem[], error?: string }> => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=3`;

  try {
    const response = await axios.get(apiUrl);
    if (response.data.items.length === 0) {
      throw new Error("No videos found");
    }
    return { success: true, videos: response.data.items };
  } catch (error) {
    console.error('Error fetching latest video:', error);
    return { success: false, error: 'Error fetching latest video' };
  }
};

export default getLatestVideo;
