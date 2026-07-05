"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "My Trips", href: "/trips", icon: "luggage" },
    { name: "Plan", href: "/", icon: "explore" },
    { name: "Flights", href: "/flights", icon: "flight" },
    { name: "Hotels", href: "/hotels", icon: "hotel" },
    { name: "Itinerary", href: "/itinerary", icon: "event_note" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex text-black font-black text-xl tracking-widest items-center">
          <span className="material-symbols-outlined text-primary mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
          WANDR
        </Link>
      </div>

      {/* Center Pill Nav */}
      <nav className="flex bg-gray-50 rounded-full border border-gray-200 p-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {link.icon}
              </span>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4 text-gray-500">
        <button className="material-symbols-outlined text-[20px] hover:text-black transition-colors">
          dark_mode
        </button>
        <button className="material-symbols-outlined text-[20px] hover:text-black transition-colors">
          notifications
        </button>
        <div className="flex items-center gap-2 ml-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            D
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-black">
            Demo User
          </span>
          <span className="material-symbols-outlined text-[18px]">
            expand_more
          </span>
        </div>
      </div>
    </header>
  );
}
