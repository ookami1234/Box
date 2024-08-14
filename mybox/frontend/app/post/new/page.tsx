import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/nextauth"
import { UserType } from "@/lib/nextauth"
import { redirect } from "next/navigation"
import PostNew from "@/components/post/PostNew"

const PostNewPage = async () => {
  // 認証情報取得
  const session = await getServerSession(authOptions)

  let user: UserType | null = null
  if (session && session.user && session.accessToken) {
    user = {
      accessToken: session.accessToken as string,
      uid: session.user.uid as string,
      name: session.user.name as string,
      email: session.user.email as string,
      avatar: session.user.avatar as string | undefined,
      introduction: session.user.introduction as string,
    }
  }

  if (!user) {
    redirect("/login")
    return null
  }

  return (
    <div>
      <PostNew user={user} />
    </div>
  )
}

export default PostNewPage
