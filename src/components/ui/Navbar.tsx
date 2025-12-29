"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-md transition-colors ${
      isActive(path)
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <img
              src="/logo.png"
              alt="The Strategy Community"
              className="h-14 w-auto scale-x-150 origin-left"
            />
          </Link>
          <div className="flex gap-2">
            <Link href="/" className={linkClass("/")}>
              Dashboard
            </Link>
            <Link href="/members" className={linkClass("/members")}>
              Members
            </Link>
            <Link href="/events" className={linkClass("/events")}>
              Events
            </Link>
            <Link href="/layouts" className={linkClass("/layouts")}>
              Layouts
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
