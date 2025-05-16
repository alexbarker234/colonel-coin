import { auth } from "@/auth";
import { getUserInfo } from "@/services/discord";
import Image from "next/image";

export default async function Header() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userInfo = await getUserInfo(session.user.id);
  return (
    <header className="flex items-center justify-end gap-2 py-2 px-6">
      <Image src={userInfo.avatarURL} alt={userInfo.username} width={32} height={32} className="rounded-full" />
      <span className="font-bold">{userInfo.username}</span>
    </header>
  );
}
