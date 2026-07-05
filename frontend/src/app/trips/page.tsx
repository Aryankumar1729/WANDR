"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTripData } from "@/context/TripContext";
import Link from "next/link";

export default function MyTripsDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setTripData } = useTripData();

  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch("http://localhost:8000/api/trips/");
        if (res.ok) {
          const data = await res.json();
          setTrips(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const loadTrip = (trip: any) => {
    if (trip.trip_data) {
      setTripData(trip.trip_data);
      router.push("/itinerary");
    }
  };

  const colors = [
    "from-[#FF8F71] to-[#D5A233]", // Orange to Gold
    "from-[#F66BAF] to-[#7C365C]", // Pink to Dark Purple
    "from-[#4CA1AF] to-[#2C3E50]", // Cyan to Navy
    "from-[#56CCF2] to-[#2F80ED]", // Light Blue to Deep Blue
  ];

  return (
    <div className="flex flex-col gap-8 text-[#111827]">
      {/* Top Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#1C1C1E] text-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-40">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-bold tracking-tight">3</h2>
              <span className="text-gray-400 font-medium">of 195</span>
            </div>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-[#1C1C1E] z-10 flex items-center justify-center text-[10px]">🇦🇫</div>
            <div className="w-8 h-8 rounded-full bg-white border-2 border-[#1C1C1E] z-0 flex items-center justify-center text-[10px]">🇯🇵</div>
          </div>
        </div>
        
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <h2 className="text-5xl font-bold tracking-tight text-gray-900">5</h2>
            <span className="text-gray-500 font-medium text-sm mt-1 block">15 places mapped</span>
          </div>
          <svg className="absolute bottom-4 right-4 w-16 h-8 text-gray-400" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M0 30 L20 35 L40 20 L60 25 L80 10 L100 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-bold tracking-tight text-gray-900">43</h2>
              <span className="text-gray-500 font-medium text-lg">days</span>
            </div>
            <span className="text-gray-500 font-medium text-sm mt-1 block">across all trips</span>
          </div>
          <svg className="absolute bottom-4 right-4 w-20 h-8 text-gray-400" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M0 35 L30 30 L60 25 L80 15 L100 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-bold tracking-tight text-gray-900">0</h2>
              <span className="text-gray-500 font-medium text-lg">km</span>
            </div>
            <span className="text-gray-500 font-medium text-sm mt-1 block w-2/3 leading-tight">≈ 0.00× around the equator</span>
          </div>
          <div className="absolute bottom-4 right-6 w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-400 transform -rotate-45"></div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex gap-10">
        
        {/* Left Side: My Trips List */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Trips</h1>
            
            <div className="flex items-center gap-6">
              <div className="flex bg-[#f9f9f9] border border-gray-200 rounded-full p-1 shadow-sm">
                <button className="px-5 py-1.5 rounded-full bg-white text-gray-900 font-semibold text-sm shadow-sm">Planned</button>
                <button className="px-5 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors">Archived</button>
                <button className="px-5 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors">Completed</button>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="material-symbols-outlined cursor-pointer hover:text-gray-900 transition-colors text-[20px]">calendar_today</span>
                <span className="material-symbols-outlined cursor-pointer text-gray-900 text-[20px]">format_list_bulleted</span>
              </div>
            </div>
          </div>

          {/* Grid of Trips */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Real Trips from DB */}
            {trips.map((trip, idx) => {
              const bgGradient = colors[idx % colors.length];
              const depDate = new Date(trip.departure_date);
              const arrDate = new Date(trip.arrival_date);
              const daysDiff = Math.max(1, Math.ceil((arrDate.getTime() - depDate.getTime()) / (1000 * 3600 * 24)));
              
              // Calculate days until trip
              const daysUntil = Math.ceil((depDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              const inDaysText = daysUntil > 0 ? `IN ${daysUntil} DAYS` : daysUntil === 0 ? "TODAY" : "PAST TRIP";

              return (
                <div 
                  key={trip.id} 
                  onClick={() => loadTrip(trip)}
                  className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group flex flex-col h-72"
                >
                  <div className={`flex-1 bg-gradient-to-br ${bgGradient} p-5 relative flex items-end`}>
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300"></div>
                      <span className="text-[10px] font-bold text-white tracking-widest">{inDaysText}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white leading-tight tracking-tight shadow-sm z-10 w-3/4">
                      {trip.destination}
                    </h3>
                  </div>
                  
                  <div className="h-32 p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 border-b border-gray-100 pb-3">
                      <span>{depDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="material-symbols-outlined text-[14px] text-gray-300">arrow_forward</span>
                      <span>{arrDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between text-center pt-2">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{daysDiff}</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Days</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">1</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Places</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{trip.adults}</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Buddy</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty "New Trip" Card */}
            <Link href="/" className="rounded-[24px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-72 hover:border-gray-400 transition-colors group cursor-pointer bg-transparent">
              <div className="w-12 h-12 bg-[#1C1C1E] rounded-full flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">add</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">New Trip</h3>
              <p className="text-sm text-gray-500 font-medium">Plan a new trip from scratch</p>
            </Link>

          </div>
        </div>

        {/* Right Side: Widgets Column */}
        <div className="w-80 flex flex-col gap-6">
          
          {/* Currency Widget */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 text-gray-500 text-xs font-bold tracking-widest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
                CURRENCY
              </div>
              <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-gray-900">sync</span>
            </div>

            <div className="flex items-center gap-3 relative">
              <div className="flex-1 bg-[#F9F9F9] rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">FROM</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">100</p>
                <div className="flex items-center justify-between text-sm font-semibold text-gray-900 border border-gray-200 bg-white rounded-lg px-2 py-1">
                  EUR <span className="material-symbols-outlined text-[16px] text-gray-400">expand_more</span>
                </div>
              </div>
              
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#1C1C1E] rounded-full flex items-center justify-center text-white shadow-md z-10 border-2 border-white">
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              </div>

              <div className="flex-1 bg-[#F9F9F9] rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">TO</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">114.46</p>
                <div className="flex items-center justify-between text-sm font-semibold text-gray-900 border border-gray-200 bg-white rounded-lg px-2 py-1">
                  USD <span className="material-symbols-outlined text-[16px] text-gray-400">expand_more</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-500 mt-4 text-center">1 EUR = 1.1446 USD</p>
          </div>

          {/* Timezones Widget */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 text-gray-500 text-xs font-bold tracking-widest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                TIMEZONES
              </div>
              <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-gray-900">add</span>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">C</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Calcutta</p>
                    <p className="text-[10px] font-semibold text-gray-400">GMT+5:30</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">16:28</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">L</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">London</p>
                    <p className="text-[10px] font-semibold text-gray-400">GMT+1</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">11:58</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">T</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Tokyo</p>
                    <p className="text-[10px] font-semibold text-gray-400">GMT+9</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">19:58</p>
              </div>
            </div>
          </div>

          {/* Upcoming Reservations */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 text-gray-500 text-xs font-bold tracking-widest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                UPCOMING RESERVATIONS
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium pb-2">Nothing booked yet.</p>
          </div>

        </div>
      </div>
      
      {/* Floating New Trip Button */}
      <div className="fixed bottom-8 right-32 z-50">
        <Link href="/" className="bg-[#1C1C1E] text-white px-6 py-4 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-black transition-colors hover:scale-105 active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Trip
        </Link>
      </div>

    </div>
  );
}
