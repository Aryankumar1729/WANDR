"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Plan", href: "/", icon: "explore" },
    { name: "Flights", href: "/flights", icon: "flight" },
    { name: "Hotels", href: "/hotels", icon: "hotel" },
    { name: "Itinerary", href: "/itinerary", icon: "event_note" },
    { name: "Budget", href: "/budget", icon: "payments" },
    { name: "Saved", href: "#", icon: "bookmark" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-4 gap-2 z-50">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-primary tracking-widest">WANDR</h1>
        <p className="text-xs font-semibold text-on-surface-variant opacity-70 tracking-widest uppercase mt-1">AI Travel Planner</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-all duration-200 ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className={`material-symbols-outlined transition-transform ${isActive ? "" : "group-hover:scale-110"}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {link.icon}
              </span>
              <span className="text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <button className="mt-auto bg-primary text-on-primary font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm">
        <span className="material-symbols-outlined text-sm">add</span>
        New Trip
      </button>
    </aside>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 z-40">
      <div className="flex items-center gap-4 bg-surface-container-high px-4 py-2 rounded-full w-96 group transition-all focus-within:ring-2 focus-within:ring-primary-container">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full text-on-surface" placeholder="Search transactions or trips..." type="text" />
      </div>
      <div className="flex items-center gap-6">
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative">
          notifications
          <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full border-2 border-surface"></span>
        </button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">settings</button>
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant">
          <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNsznC4WFD7eVSOsuATogPdlssuJKLXuwsjP3JfxazDFKKROrtm2xe0psctqSpleqS5P8MUHZnjrhd2Rn__WPH0J9Q5yfYwD4qnKX7M0gnuybmzdlBD7RcpdQEJQin7jEp8JavdQUhnkC3pJT1HdcsLJ6ZtYLvCGe4qLA1aDr6Dj7lhAfTDPKZuWW2ZpzLj_UtQ8EtRJFsymnhr-tgkc_STJMQBs3zqJeES_hZ5VJHPAt3y9YEPDCeJV8CEkH_4PsH7hrNch5AoetH" />
        </div>
      </div>
    </header>
  );
}
