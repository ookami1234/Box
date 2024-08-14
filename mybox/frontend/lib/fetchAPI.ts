const fetchAPI = async (url: string, options: RequestInit) => {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return { success: false, error: "API URLが設定されていません" };
  }

  try {
    const response = await fetch(`${apiUrl}${url}`, options);

    if (!response.ok) {
      console.error(`APIエラー: ステータスコード ${response.status}`);
      return { success: false, error: `APIでエラーが発生しました: ${response.statusText}` };
    }

    // Content-Type ヘッダーが application/json の場合のみ、JSON を解析する
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log(`APIレスポンスデータ: ${JSON.stringify(data)}`);
      return { success: true, data };
    }

    // データなしで成功を返す
    return { success: true };
  } catch (error) {
    console.error('ネットワークエラー:', error);
    return { success: false, error: "ネットワークエラーが発生しました" };
  }
};
