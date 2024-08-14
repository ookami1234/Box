"use client"

import { PostType } from "@/actions/post"
import { formatDistance } from "date-fns"
import { ja } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"

interface PostItemProps {
  post: PostType
}

// 投稿一覧のアイテム
const PostItem = ({ post }: PostItemProps) => {
  const updatedAt = new Date(post.updated_at ?? 0)
  const now = new Date()
  const date = formatDistance(updatedAt, now, { addSuffix: true, locale: ja })

  // サムネイル画像のURLを適切に処理
  const thumbnailSrc = post.image?.startsWith('http') ? post.image : `/${post.image}`

  return (
    <div className="border rounded-md flex flex-col">
      <Link href={`/post/${post.uid}`} aria-label={`View post ${post.title}`}>
        <div className="aspect-[16/9] relative overflow-hidden rounded-t-md">
          <Image
            fill
            src={thumbnailSrc}
            alt="thumbnail"
            className="object-cover rounded-t-md transition-all hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="flex flex-col h-full p-3">
        <div className="flex-1 mb-3">
          <div className="font-bold hover:underline break-words">
            <Link href={`/post/${post.uid}`} aria-label={post.title}>
              {post.title}
            </Link>
          </div>
        </div>

        <div className="text-xs text-gray-400">{date}</div>
      </div>
    </div>
  )
}

export default PostItem
