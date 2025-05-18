"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaDiscord } from "react-icons/fa";
export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <WelcomeMessage />
        <button
          onClick={() => (window.location.href = "discord://discordapp.com")}
          className="flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors cursor-pointer"
        >
          <FaDiscord size={24} />
          Login with the Discord Bot
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <WelcomeMessage />
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex flex-col  font-bold text-center">
      <h1 className="text-2xl">Welcome to </h1>
      <div className=" mb-8 flex h-10 gap-4">
        <Image src="/chip.png" alt="" className="w-10 h-10" width={100} height={100} />
        <h1 className="text-4xl">Coin Country</h1>
        <Image src="/chip.png" alt="" className="w-10 h-10" width={100} height={100} />
      </div>
    </div>
  );
}
