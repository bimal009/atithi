import { requireOnboardedUser } from "@/features/auth/server/session"

const WebsiteEditorLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  await requireOnboardedUser()

  return <div className="h-dvh w-full overflow-hidden bg-background">{children}</div>
}

export default WebsiteEditorLayout
