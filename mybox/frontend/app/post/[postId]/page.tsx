"use client"

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PostDetail from '@/components/post/PostDetail'
import { getPostDetail } from '@/actions/post'
import { UserType } from '@/lib/nextauth'
import { PostType } from '@/actions/post'
import { getSession } from 'next-auth/react'

const PostPage = () => {
  const { postId } = useParams()
  const [post, setPost] = useState<PostType | null>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (postId && typeof postId === 'string') {
      const fetchPostDetail = async () => {
        // ユーザーセッションの取得
        const session = await getSession()
        if (!session || !session.accessToken || !session.user) {
          console.error("ユーザーセッションの取得に失敗しました")
          setIsLoading(false)
          return
        }

        const user: UserType = {
          accessToken: session.accessToken as string,
          uid: session.user.uid as string,
          name: session.user.name as string,
          email: session.user.email as string,
          avatar: session.user.avatar as string | undefined,
          introduction: session.user.introduction as string,
        }

        const result = await getPostDetail({ postId, accessToken: user.accessToken })

        if (result.success) {
          setPost(result.post)
          setUser(user)
        } else {
          console.error("投稿詳細の取得に失敗しました:", result.error)
        }
        setIsLoading(false)
      }

      fetchPostDetail()
    }
  }, [postId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!post) {
    return <div>投稿が見つかりませんでした。</div>
  }

  return <PostDetail post={post} user={user} />
}

export default PostPage
