import { auth } from "@/auth";
import { getUserInfo } from "@/services/discord";
import UserProfile from "./UserProfile";

export default async function Header() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userInfo = await getUserInfo(session.user.id);

  return (
    <header className="absolute z-50 top-0 right-0 flex items-center justify-end gap-2 py-1 px-2 md:px-6 h-16 md:h-12">
      <UserProfile userInfo={userInfo} />
    </header>
  );
}
