"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { FaHome, FaSignOutAlt } from "react-icons/fa";

export default function UserProfile({ userInfo }: { userInfo: { username: string; avatarURL: string } }) {
  return (
    <Menu as="div" className="relative inline-block text-left h-full">
      <MenuButton className="flex items-center gap-2 bg-neutral-800 rounded-full px-1 md:px-2 py-1 cursor-pointer h-full hover:bg-neutral-700 transition-colors focus:outline-none">
        <Image
          src={userInfo.avatarURL}
          alt={userInfo.username}
          width={50}
          height={50}
          className="rounded-full h-full w-auto aspect-square"
        />
        <span className="hidden md:inline font-bold select-none">{userInfo.username}</span>
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-32 bg-neutral-800 rounded-lg shadow-lg font-bold focus:outline-none">
          <MenuItem>
            {() => (
              <Link
                href="/"
                className="flex items-center w-full px-4 py-2 text-sm text-white rounded-lg transition-colors hover:bg-neutral-700"
              >
                <FaHome className="mr-2" />
                Home
              </Link>
            )}
          </MenuItem>
          <MenuItem>
            {() => (
              <button
                onClick={() => signOut()}
                className="flex items-center w-full px-4 py-2 text-sm text-white rounded-lg transition-colors hover:bg-neutral-700 cursor-pointer"
              >
                <FaSignOutAlt className="mr-2" />
                Sign Out
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
