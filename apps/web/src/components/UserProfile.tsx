"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { IconType } from "react-icons";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
interface MenuItemProps {
  href?: string;
  onClick?: () => void;
  icon: IconType;
  label: string;
}

function ProfileMenuItem({ href, onClick, icon: Icon, label }: MenuItemProps) {
  const baseClasses =
    "flex items-center w-full px-4 py-2 text-sm text-white rounded-lg transition-colors hover:bg-neutral-700 cursor-pointer";

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <Icon className="mr-2" />
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      <Icon className="mr-2" />
      {label}
    </button>
  );
}

export default function UserProfile({ userInfo }: { userInfo: { username: string; avatarURL: string } }) {
  const menuItems: MenuItemProps[] = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/dashboard", icon: MdDashboard, label: "Dashboard" },
    { onClick: () => signOut(), icon: FaSignOutAlt, label: "Sign Out" }
  ];

  return (
    <Menu as="div" className="relative inline-block text-left h-full">
      <MenuButton className="flex items-center gap-2 bg-zinc-800 rounded-full px-1 md:px-2 py-1 cursor-pointer h-full hover:bg-zinc-700 transition-colors focus:outline-none">
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
        <MenuItems className="absolute right-0 mt-2 w-40 bg-zinc-800 rounded-lg shadow-lg font-semibold focus:outline-none">
          {menuItems.map(({ href, onClick, icon: Icon, label }) => (
            <MenuItem key={label}>
              <ProfileMenuItem href={href} onClick={onClick} icon={Icon} label={label} />
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
