"use client";

import { useTripData } from "@/context/TripContext";
import { useState } from "react";

export default function ItineraryPage() {
  const { tripData } = useTripData();
  const itinerary = tripData.itinerary;
  const days: any[] = itinerary?.days || [];

  if (!itinerary || days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-104px)] text-center text-gray-500">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">map</span>
        <h2 className="text-xl font-bold text-gray-700">No Itinerary Generated Yet</h2>
        <p className="text-sm mt-2">Go back and generate a trip first.</p>
      </div>
    );
  }

  // Calculate generic start date for UI
  const startDate = tripData.departureDate ? new Date(tripData.departureDate) : new Date();

  return (
    <div className="flex h-[calc(100vh-104px)] w-full overflow-hidden bg-white -mx-8 -mt-24">
      
      {/* Left Sidebar: Timeline */}
      <div className="w-[360px] bg-[#F8F9FA] flex flex-col border-r border-gray-200 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10 relative">
        {/* Top Actions */}
        <div className="p-4 flex gap-2 border-b border-gray-200 bg-white sticky top-0 z-20">
          <button className="flex items-center gap-1.5 bg-[#E67E22] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            PDF
          </button>
          <button className="flex items-center gap-1.5 bg-[#F3F4F6] text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-200 border border-gray-200">
            <span className="material-symbols-outlined text-[16px]">event</span>
            ICS
          </button>
          <div className="flex-1"></div>
          <button className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-400 border border-transparent">
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-md bg-white border border-gray-200 shadow-sm text-gray-700">
            <span className="material-symbols-outlined text-[18px]">swap_vert</span>
          </button>
        </div>

        {/* Days List */}
        <div className="flex-1 overflow-y-auto">
          {days.map((day, idx) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + idx);
            const dateStr = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={idx} className="border-b border-gray-200 pb-4">
                {/* Day Header */}
                <div className="flex gap-3 p-4 sticky top-0 bg-[#F8F9FA] z-10">
                  <div className="flex flex-col items-center justify-center w-12 h-14 bg-white rounded-lg shadow-sm border border-gray-200 shrink-0">
                    <span className="text-sm font-black text-gray-900">{idx + 1}</span>
                    <div className="w-4 border-t border-gray-200 my-1"></div>
                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">cloud</span> 22°
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-bold text-gray-900">Day {idx + 1}</h3>
                      <span className="text-xs font-semibold text-gray-400">{dateStr}</span>
                    </div>
                    {/* Hotel Indicator */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-emerald-100">
                      <span className="material-symbols-outlined text-[12px]">bed</span>
                      Hotel {tripData.destination}
                    </div>
                  </div>
                </div>

                {/* Activities List */}
                <div className="flex flex-col">
                  {day.activities?.map((activity: any, actIdx: number) => {
                    const time = typeof activity.time === "string" ? activity.time.replace(/[^0-9:]/g, '') || "10:00" : "10:00";
                    return (
                      <div key={actIdx} className="flex group hover:bg-white transition-colors py-3 pr-4 cursor-pointer relative">
                        {/* Drag Handle */}
                        <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-gray-300 text-[18px] cursor-grab">drag_indicator</span>
                        </div>
                        
                        {/* Dot / Line */}
                        <div className="w-4 flex flex-col items-center mr-3 relative">
                          <div className="w-2 h-2 rounded-full bg-[#1C1C1E] z-10 mt-2"></div>
                          {actIdx !== day.activities.length - 1 && (
                            <div className="w-0.5 bg-gray-200 absolute top-4 bottom-[-16px]"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <h4 className="text-sm font-bold text-gray-900 leading-tight">{activity.activity || activity.name}</h4>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[10px]">schedule</span> {time}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-tight line-clamp-1">{activity.description || "Activity description"}</p>
                          
                          {/* Tags */}
                          <div className="flex gap-2 mt-2">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded text-[9px] font-bold border border-[#C8E6C9]">
                              <span className="material-symbols-outlined text-[10px]">check_circle</span>
                              Planned
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: Map */}
      <div className="flex-1 relative bg-[#E5E3DF] overflow-hidden">
        {/* Floating Map Filters */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-4 z-10">
          {["restaurant", "local_cafe", "wine_bar", "bed", "photo_camera", "museum", "park", "local_activity"].map((icon, i) => (
            <button key={i} className="text-gray-400 hover:text-gray-900 transition-colors">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </button>
          ))}
        </div>

        {/* Embedded Google Maps */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=${encodeURIComponent(tripData.destination || "Tokyo")}`}
          className="grayscale opacity-80"
        ></iframe>
        
        {/* Fallback Overlay to make it look like the map is loaded even without API Key */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay bg-gradient-to-br from-blue-50/50 to-orange-50/50"></div>
        
        {/* Fake Map Markers matching the design */}
        <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-md z-10">
          3
        </div>
        <div className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-md z-10">
          6
        </div>
      </div>

      {/* Right Sidebar: Atlas / Places */}
      <div className="w-[340px] bg-[#F8F9FA] flex flex-col border-l border-gray-200 shadow-[-2px_0_10px_rgba(0,0,0,0.02)] z-10">
        <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-4">
          <button className="w-full bg-[#E67E22] hover:bg-[#d6711c] text-white py-2.5 rounded-lg font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Place/Activity
          </button>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-[#F9F9F9] border border-gray-200 text-gray-600 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-[14px]">upload_file</span>
              Import file
            </button>
            <button className="flex-1 bg-[#F9F9F9] border border-gray-200 text-gray-600 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-[14px]">list_alt</span>
              List Import
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button className="flex items-center gap-1.5 bg-[#E67E22] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              All <span className="bg-white/30 px-1.5 rounded-full text-[10px]">10</span>
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors">
              Unplanned <span className="bg-gray-100 text-gray-500 px-1.5 rounded-full text-[10px]">2</span>
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search places..." 
              className="w-full bg-[#F3F4F6] border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
            />
          </div>

          <div className="flex gap-2">
            <select className="flex-1 bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-gray-700 focus:outline-none appearance-none">
              <option>All Categories</option>
            </select>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">10 places</p>
          
          <div className="flex flex-col gap-4">
            {/* Flatten all activities for the places list */}
            {days.flatMap(d => d.activities).map((activity: any, idx: number) => (
              <div key={idx} className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1542051812871-757500850028?w=100&h=100&fit=crop" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-purple-500">location_on</span>
                    {activity.activity || activity.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{activity.description || "Location details"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
