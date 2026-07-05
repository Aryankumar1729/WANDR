"use client";

import { useTripData } from "@/context/TripContext";

export default function ListsPage() {
  const { tripData } = useTripData();
  const packing = tripData?.packing;

  if (!packing || !packing.categories) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-104px)] text-center text-gray-500">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">luggage</span>
        <h2 className="text-xl font-bold text-gray-700">No Packing List Yet</h2>
        <p className="text-sm mt-2">Generate a trip first to get your AI-powered smart packing list.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in pb-12 pt-[136px] px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#E67E22] rounded-full flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-white text-[24px]">luggage</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Smart Packing List</h2>
          <p className="text-gray-500 font-medium">Curated for {tripData.destination} based on weather and itinerary.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {packing.categories.map((cat: any, idx: number) => {
          const catName = (cat.name || "").toLowerCase();
          const formattedName = cat.name || "Category";
          
          return (
            <div key={idx} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                {catName.includes("clothing") && <span className="material-symbols-outlined text-orange-500">checkroom</span>}
                {catName.includes("toiletries") && <span className="material-symbols-outlined text-blue-500">soap</span>}
                {catName.includes("electronics") && <span className="material-symbols-outlined text-gray-800">devices</span>}
                {catName.includes("weather") && <span className="material-symbols-outlined text-red-500">ac_unit</span>}
                {formattedName}
              </h3>
              
              <div className="space-y-3 flex-1 overflow-y-auto">
                {Array.isArray(cat.items) ? cat.items.map((item: any, itemIdx: number) => {
                  // Support both string items or object items
                  const itemName = typeof item === 'string' ? item : (item.name || item.item);
                  const itemQuantity = typeof item === 'object' && item.quantity ? item.quantity : null;
                  const itemReason = typeof item === 'object' && item.reason ? item.reason : null;

                  return (
                    <label key={itemIdx} className="flex items-start gap-3 cursor-pointer group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-[#E67E22] checked:border-[#E67E22] transition-colors cursor-pointer"
                        />
                        <span className="material-symbols-outlined absolute text-white text-[16px] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-[#E67E22] transition-colors peer-checked:line-through peer-checked:text-gray-400">
                          {itemName}
                          {itemQuantity && <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 not-italic no-underline">x{itemQuantity}</span>}
                        </p>
                        {itemReason && (
                          <p className="text-xs text-gray-500 opacity-80 mt-0.5 peer-checked:line-through truncate">{itemReason}</p>
                        )}
                      </div>
                    </label>
                  );
                }) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
