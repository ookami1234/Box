// const fetchTwitchAPI = async (endpoint: string, accessToken: string) => {
//     const response = await fetch(`https://api.twitch.tv/helix${endpoint}`, {
//       headers: {
//         'Client-ID': process.env.TWITCH_CLIENT_ID!,
//         'Authorization': `Bearer ${accessToken}`
//       }
//     });
//     if (!response.ok) {
//       throw new Error('Twitch APIリクエストに失敗しました');
//     }
//     return response.json();
//   };
  
//   export const getTwitchAccessToken = async () => {
//     const response = await fetch(`https://id.twitch.tv/oauth2/token`, {
//       method: 'POST',
//       body: new URLSearchParams({
//         client_id: process.env.TWITCH_CLIENT_ID!,
//         client_secret: process.env.TWITCH_CLIENT_SECRET!,
//         grant_type: 'client_credentials'
//       })
//     });
//     const data = await response.json();
//     return data.access_token;
//   };
  
//   export interface TwitchStream {
//     id: string;
//     user_id: string;
//     user_name: string;
//     game_id: string;
//     type: string;
//     title: string;
//     viewer_count: number;
//     started_at: string;
//     language: string;
//     thumbnail_url: string;
//   }
  
//   export const getLiveStream = async (channelId: string): Promise<TwitchStream | null> => {
//     const accessToken = await getTwitchAccessToken();
//     const data = await fetchTwitchAPI(`/streams?user_id=${channelId}`, accessToken);
//     return data.data.length > 0 ? data.data[0] : null;
//   };
  
//   export const getTwitchChannelInfo = async (channelId: string) => {
//     const accessToken = await getTwitchAccessToken();
//     const data = await fetchTwitchAPI(`/users?id=${channelId}`, accessToken);
//     return data.data.length > 0 ? data.data[0] : null;
//   };
  