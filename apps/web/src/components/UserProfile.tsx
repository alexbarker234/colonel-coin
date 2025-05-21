"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaHome, FaSignOutAlt } from "react-icons/fa";

export default function UserProfile({ userInfo }: { userInfo: { username: string; avatarURL: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group h-full" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 bg-neutral-800 rounded-full px-1 md:px-2 py-1 cursor-pointer h-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={userInfo.avatarURL}
          alt={userInfo.username}
          width={50}
          height={50}
          className="rounded-full h-full w-auto aspect-square"
        />
        <span className="hidden md:inline font-bold select-none">{userInfo.username}</span>
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-neutral-800 rounded-lg shadow-lg font-bold">
          <Link
            href="/"
            className="flex items-center cursor-pointer w-full px-4 py-2 text-sm text-white hover:bg-neutral-700 rounded-lg"
          >
            <FaHome className="mr-2" />
            Home
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center cursor-pointer w-full px-4 py-2 text-sm text-white hover:bg-neutral-700 rounded-lg"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
