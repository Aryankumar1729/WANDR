"use client";

import { useTripData } from "@/context/TripContext";
import CurrencyWidget from "@/components/CurrencyWidget";
import HolidaysWidget from "@/components/HolidaysWidget";
import Link from "next/link";

export default function LogisticsPage() {
  const { tripData } = useTripData();

  if (!tripData) {
    return (
      <div className="min-h-screen pt-32 px-8 flex flex-col items-center max-w-[1200px] mx-auto text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">explore_off</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trip Selected</h2>
        <p className="text-gray-500 mb-6 max-w-md">Please generate a new trip or select an existing one from your dashboard to view its logistics.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-full font-bold shadow-sm">
          Plan a Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 max-w-[1200px] mx-auto">
      <div className="mb-10 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Logistics</h1>
        <p className="text-gray-500 font-medium">Holidays, currency exchange, and timezones for {tripData.destination}.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <HolidaysWidget 
          destination={tripData.destination} 
          startDate={tripData.departureDate || (tripData as any).departure_date} 
          endDate={tripData.arrivalDate || (tripData as any).arrival_date} 
        />
        
        <CurrencyWidget />

        {/* Timezones Widget */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6 text-gray-500 text-xs font-bold tracking-widest">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              TIMEZONES
            </div>
            <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-gray-900">add</span>
          </div>

          <div className="flex flex-col gap-6 flex-1 justify-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">L</div>
                <div>
                  <p className="text-base font-bold text-gray-900">Local Time</p>
                  <p className="text-xs font-semibold text-gray-400">{tripData.destination}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">14:30</p>
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">H</div>
                <div>
                  <p className="text-base font-bold text-gray-900">Home</p>
                  <p className="text-xs font-semibold text-gray-400">GMT</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">09:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
