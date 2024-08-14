import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";
import { getPostDetail } from "@/actions/post";
import PostEdit from "@/components/post/PostEdit";
import getLatestVideo from "@/lib/getLatestVideo";

interface PostEditPageProps {
  params: {
    postId: string;
  };
}

// 投稿編集ページ
const PostEditPage = async ({ params }: PostEditPageProps) => {
  const { postId } = params;

  // 認証情報取得
  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  // 投稿詳細取得
  const { success, post } = await getPostDetail({ postId });

  if (!success) {
    return (
      <div className="text-center text-sm text-gray-500">
        投稿の取得に失敗しました
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center text-sm text-gray-500">投稿はありません</div>
    );
  }

  if (post.user.uid !== user.uid) {
    return <div className="text-center">編集できません</div>;
  }

  // 最新動画取得
  const channelId = post.channelId; // 投稿に含まれるチャンネルIDを使用
  const latestVideoResult = await getLatestVideo(channelId);

  return (
    <div>
      <PostEdit user={user} post={post} />
      {latestVideoResult.success && latestVideoResult.video && (
        <div>
          <h2>Latest Video</h2>
          <p>Title: {latestVideoResult.video.snippet.title}</p>
          <p>Description: {latestVideoResult.video.snippet.description}</p>
          <a href={`https://www.youtube.com/watch?v=${latestVideoResult.video.id.videoId}`} target="_blank">Watch Video</a>
        </div>
      )}
    </div>
  );
};

export default PostEditPage;
