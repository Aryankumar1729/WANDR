"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTripData } from "@/context/TripContext";

export function TopNav() {
  const pathname = usePathname();
  const { tripData } = useTripData();

  const globalNavLinks = [
    { name: "My Trips", href: "/trips", icon: "luggage" },
    { name: "Plan", href: "/", icon: "explore" },
    { name: "Atlas", href: "#", icon: "public" },
    { name: "Journey", href: "/itinerary", icon: "map" }
  ];

  const isTripView = ["/itinerary", "/flights", "/hotels", "/budget", "/lists"].includes(pathname);

  // When inside a trip view, render the specific trip header and subheader
  if (isTripView) {
    const tripNavLinks = [
      { name: "Plan", href: "/itinerary", icon: "event_note" },
      { name: "Transports", href: "/flights", icon: "directions_car" },
      { name: "Book", href: "/hotels", icon: "hotel" },
      { name: "Lists", href: "/lists", icon: "list_alt" },
      { name: "Costs", href: "/budget", icon: "payments" },
    ];

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FA]">
        {/* Top Header */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4">
            <Link href="/trips" className="flex items-center gap-1 text-gray-500 hover:text-black font-semibold text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </Link>
            <div className="h-5 w-[1px] bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="flex text-black font-black text-lg tracking-widest items-center">
                <span className="material-symbols-outlined text-primary mr-1 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                WANDR
              </span>
              <span className="text-gray-400 font-light mx-1">/</span>
              <span className="text-gray-800 font-semibold text-sm tracking-wide">
                {tripData?.destination || "New Trip"}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 text-gray-500">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors bg-white">
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              Share
            </button>
            <button className="material-symbols-outlined text-[20px] hover:text-black transition-colors ml-2">
              dark_mode
            </button>
            <button className="material-symbols-outlined text-[20px] hover:text-black transition-colors">
              notifications
            </button>
            <div className="flex items-center gap-2 ml-2 cursor-pointer group">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                D
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-black hidden sm:block">
                Demo User
              </span>
              <span className="material-symbols-outlined text-[18px]">
                expand_more
              </span>
            </div>
          </div>
        </header>

        {/* Sub Header Navigation */}
        <div className="h-12 border-b border-gray-200 flex items-center justify-center bg-white">
          <nav className="flex gap-2">
            {tripNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#E67E22] text-white shadow-sm"
                      : "text-gray-500 hover:text-black hover:bg-gray-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    );
  }

  // Global Header (My Trips, Vacay, Atlas)
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
        {globalNavLinks.map((link) => {
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
