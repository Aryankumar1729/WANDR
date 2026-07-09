"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTripData } from "@/context/TripContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function TopNav() {
  const pathname = usePathname();
  const { tripData } = useTripData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Hide TopNav completely on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Trip link copied to clipboard!");
    } catch {
      toast.error("Copy failed. Please copy the URL manually.");
    }
  };

  const globalNavLinks = [
    { name: "My Trips", href: "/trips", icon: "luggage" },
    { name: "Time Off", href: "/vacation", icon: "event_available" },
    { name: "Plan", href: "/", icon: "explore" },
    { name: "Atlas", href: "/itinerary", icon: "public" },
    { name: "Journey", href: "/itinerary", icon: "map" }
  ];

  const isTripView = ["/itinerary", "/flights", "/hotels", "/budget", "/lists", "/logistics"].includes(pathname);

  // When inside a trip view, render the specific trip header and subheader
  if (isTripView) {
    const tripNavLinks = [
      { name: "Plan", href: "/itinerary", icon: "event_note" },
      { name: "Transports", href: "/flights", icon: "directions_car" },
      { name: "Book", href: "/hotels", icon: "hotel" },
      { name: "Logistics", href: "/logistics", icon: "local_shipping" },
      { name: "Lists", href: "/lists", icon: "list_alt" },
      { name: "Costs", href: "/budget", icon: "payments" },
      { name: "Files", href: "/lists", icon: "folder" },
      { name: "Collab", href: "/trips", icon: "group" }
    ];

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FA]">
        {/* Top Header */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-black font-semibold text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">home</span>
              Home
            </Link>
            <div className="w-px h-4 bg-gray-300"></div>
            <Link href="/trips" className="flex items-center gap-1 text-gray-500 hover:text-black font-semibold text-sm transition-colors">
              Trips
            </Link>
            <Link href="/vacation" className="flex items-center gap-1 text-gray-500 hover:text-black font-semibold text-sm transition-colors">
              Vacation
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <img src="/assets/logo.png" alt="WANDR" className="h-10 w-auto object-contain" />
              </Link>
              <span className="text-gray-400 font-light mx-1">/</span>
              <span className="text-gray-800 font-semibold text-sm tracking-wide">
                {tripData?.destination || "New Trip"}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 text-gray-500">
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors bg-white"
              onClick={copyShareLink}
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              Share
            </button>
            <button 
              className="material-symbols-outlined text-[20px] hover:text-black transition-colors ml-2"
              onClick={() => setIsDarkMode((current) => !current)}
              aria-pressed={isDarkMode}
              title={isDarkMode ? "Disable dark mode" : "Enable dark mode"}
            >
              {isDarkMode ? "light_mode" : "dark_mode"}
            </button>
            <button 
              className="material-symbols-outlined text-[20px] hover:text-black transition-colors"
              onClick={() => toast.success(tripData?.destination ? `${tripData.destination} trip is loaded.` : "No active trip loaded.")}
            >
              notifications
            </button>

            <div className="relative">
              {!isAuthenticated ? (
                <button onClick={() => window.location.assign("/login")} className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors">
                  Login
                </button>
              ) : (
                <div 
                  className="flex items-center gap-2 ml-2 cursor-pointer group"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-black hidden sm:block">
                    {user?.name || "User"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    expand_more
                  </span>
                </div>
              )}

              {/* Dropdown */}
              {profileOpen && isAuthenticated && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      My Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Settings
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Sub Header Navigation */}
        <div className="h-12 border-b border-gray-200 flex items-center justify-center bg-white">
          <nav className="flex gap-2">
            {tripNavLinks.map((link) => {
              const isActive = pathname === link.href || (pathname === "/" && link.href === "/");
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
  const isHome = pathname === "/";

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 transition-colors duration-300 ${isHome ? 'bg-transparent border-transparent' : 'bg-white border-b border-gray-200'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center">
          <img src="/assets/logo.png" alt="WANDR" className="h-14 w-auto object-contain scale-110 origin-left" />
        </Link>
      </div>

      {/* Center Pill Nav */}
      <nav className={`flex rounded-full p-1 transition-colors duration-300 ${isHome ? 'bg-white/20 backdrop-blur-md border border-white/30 shadow-sm' : 'bg-gray-50 border border-gray-200'}`}>
        {globalNavLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? isHome ? "bg-white text-gray-900 shadow-sm" : "bg-white text-black shadow-sm"
                  : isHome ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-black"
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
      <div className={`flex items-center gap-4 transition-colors ${isHome ? 'text-white/90' : 'text-gray-500'}`}>
        <button
          className={`material-symbols-outlined text-[20px] transition-colors ${isHome ? 'hover:text-white' : 'hover:text-black'}`}
          onClick={() => setIsDarkMode((current) => !current)}
          aria-pressed={isDarkMode}
          title={isDarkMode ? "Disable dark mode" : "Enable dark mode"}
        >
          {isDarkMode ? "light_mode" : "dark_mode"}
        </button>
        <button
          className={`material-symbols-outlined text-[20px] transition-colors ${isHome ? 'hover:text-white' : 'hover:text-black'}`}
          onClick={() => toast.success(tripData?.destination ? `${tripData.destination} trip is loaded.` : "No active trip loaded.")}
        >
          notifications
        </button>

            <div className="relative">
              {!isAuthenticated ? (
                <button onClick={() => window.location.assign("/login")} className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors">
                  Login
                </button>
              ) : (
                <div 
                  className="flex items-center gap-2 ml-2 cursor-pointer group"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-black hidden sm:block">
                    {user?.name || "User"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    expand_more
                  </span>
                </div>
              )}

              {/* Dropdown */}
              {profileOpen && isAuthenticated && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      My Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Settings
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

      </div>
    </header>
  );
}
