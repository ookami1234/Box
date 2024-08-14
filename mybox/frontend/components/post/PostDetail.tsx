"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { PostType, deletePost } from "@/actions/post"
import { UserType } from "@/lib/nextauth"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import getLatestVideo, { VideoItem } from "@/lib/getLatestVideo"
import getChannelInfo, { ChannelInfo } from "@/lib/getChannelInfo"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface PostDetailProps {
  post: PostType
  user: UserType | null
}

// 投稿詳細
const PostDetail = ({ post, user }: PostDetailProps) => {
  const router = useRouter()
  const [latestVideos, setLatestVideos] = useState<VideoItem[]>([])
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        if (post.channelId) {
          const channelInfoResult = await getChannelInfo(post.channelId)
          if (channelInfoResult.success) {
            setChannelInfo(channelInfoResult.data ?? null)

            const latestVideoResult = await getLatestVideo(post.channelId)
            if (latestVideoResult.success) {
              setLatestVideos(latestVideoResult.videos ?? [])
            } else {
              toast.error("最新動画の取得に失敗しました")
            }
          } else {
            toast.error(channelInfoResult.error || "チャンネル情報の取得に失敗しました")
          }
        }
      } catch (error) {
        toast.error("チャンネルデータの取得に失敗しました")
      }
    }

    if (post?.channelId) {
      fetchChannelData()
    }
  }, [post])

  const thumbnailSrc = post?.image?.startsWith('http') ? post.image : `/${post?.image}`

  const handleDeletePost = async () => {
    if (!post) return // post が null の場合の早期リターン
    if (!user) {
      toast.error("ユーザー情報が見つかりません")
      return
    }
    if (post.user.uid !== user.uid) {
      toast.error("投稿は削除できません")
      return
    }

    try {
      const res = await deletePost({
        accessToken: user.accessToken,
        postId: post.uid,
      })

      if (!res.success) {
        toast.error("投稿の削除に失敗しました")
        return
      }

      toast.success("投稿を削除しました")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error("投稿の削除に失敗しました")
    }
  }

  return (
    <div className="space-y-8 w-full">
    <div className="flex justify-center items-start">
  <div className="aspect-[1/1] relative w-1/4">
    <Image
      fill
      src={thumbnailSrc}
      alt="thumbnail"
      className="object-cover rounded-full"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={true} // LCP のために追加
    />
  </div>
</div>



      <div className="font-bold text-2xl break-words text-center">{post.title}</div>

      {/* <div>
        <div className="flex items-center space-x-2">
          <Link href={`/user/${post.user.uid}`}>
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src={post.user.avatar || "/default.png"}
                className="rounded-full object-cover"
                alt={post.user.name || "avatar"}
                fill
                sizes="100vw"
                priority={true}
              />
            </div>
          </Link>

          <div>
            <div className="text-sm hover:underline break-words">
              <Link href={`/user/${post.user.uid}`}>{post.user.name}</Link>
            </div>
            <div className="text-xs text-gray-400">
              {format(new Date(post.updated_at), "yyyy/MM/dd HH:mm")}
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className="leading-relaxed break-words whitespace-pre-wrap">
        {post.content}
      </div> */}

      {(channelInfo || latestVideos.length > 0) && (
        <Card className="mt-10 w-full text-center">
          {channelInfo && (
            <CardHeader>
              <CardTitle>チャンネル情報</CardTitle>
            </CardHeader>
          )}
          {channelInfo && (
            <CardContent className=" text-center">
              <p>チャンネル名: {channelInfo.channel_name}</p>
              <p>登録者数: {channelInfo.subscriber_count}</p>
            </CardContent>
          )}
          {latestVideos.length > 0 && (
            <>
              <CardHeader>
                <CardTitle>最新動画</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between space-x-4">
                  {latestVideos.map((video, index) => (
                    <Card key={index} className="flex-1">
                      <CardHeader>
                        <CardTitle>{video.snippet.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-[16/9] relative">
                          <Image
                            fill
                            src={video.snippet.thumbnails.high.url}
                            alt="latest video thumbnail"
                            className="object-cover rounded-md"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          動画を見る
                        </a>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}

      {post.user.uid === user?.uid && (
        <div className="flex items-center justify-end space-x-1">
          <Link href={`/post/${post.uid}/edit`}>
            <div className="hover:bg-gray-100 p-2 rounded-full">
              <Pencil className="w-5 h-5" />
            </div>
          </Link>
          <button
            className="hover:bg-gray-100 p-2 rounded-full"
            onClick={handleDeletePost}
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}
    </div>
  )
}

export default PostDetail
