import { getAuthSession } from "@/lib/nextauth"
import { redirect } from "next/navigation"
import Profile from "@/components/settings/Profile"

const ProfilePage = async () => {
  // 認証情報取得
  const user = await getAuthSession()

  if (!user) {
    redirect("/login")
    return null
  }

  return (
    <div>
      <Profile user={user} />
    </div>
  )
}

export default ProfilePage
