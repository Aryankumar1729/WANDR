"use client";

import { useTripData } from "@/context/TripContext";

export default function BudgetPage() {
  const { tripData } = useTripData();
  const { destination, departureDate, arrivalDate, adults, budget, budgetResult, flights, hotels } = tripData;

  const hasData = budgetResult || flights.length > 0 || hotels.length > 0;

  // Calculate budget breakdown from real data
  const flightTotal = flights.reduce((sum: number, f: any) => {
    const price = parseInt(String(f.price).replace(/[^\d]/g, "")) || 0;
    return sum + price;
  }, 0);

  const hotelTotal = hotels.reduce((sum: number, h: any) => {
    const price = parseInt(String(h.price).replace(/[^\d]/g, "")) || 0;
    return sum + price;
  }, 0);

  const activityTotal = Math.round(budget * 0.1);
  const foodTotal = Math.round(budget * 0.15);
  const totalSpent = flightTotal + hotelTotal + activityTotal + foodTotal;
  const remaining = budget - totalSpent;

  const categories = [
    { name: "Flights", amount: flightTotal, icon: "flight", color: "bg-secondary-container" },
    { name: "Hotels", amount: hotelTotal, icon: "hotel", color: "bg-primary-container" },
    { name: "Food", amount: foodTotal, icon: "restaurant", color: "bg-[#4ADE80]" },
    { name: "Activities", amount: activityTotal, icon: "local_activity", color: "bg-tertiary-container" },
  ];

  const total = categories.reduce((s, c) => s + c.amount, 0) || 1;
  const percentages = categories.map((c) => Math.round((c.amount / total) * 100));

  if (!hasData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in gap-4 min-h-[60vh]">
        <span className="material-symbols-outlined text-6xl text-outline">payments</span>
        <h2 className="text-2xl font-bold text-on-surface">No Budget Data Yet</h2>
        <p className="text-on-surface-variant text-sm max-w-md text-center">
          Generate a trip from the <a href="/" className="text-primary font-bold hover:underline">Plan</a> page first. Your budget breakdown will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-fade-in pt-[136px] px-8 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">{destination || "Your Trip"} Budget</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {departureDate && arrivalDate ? `${departureDate} — ${arrivalDate}` : "Trip dates"} • {adults} Traveler{adults > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-bold hover:bg-surface-container transition-colors">
            Export PDF
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Budget Summary Card (Donut Chart) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center gap-12">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle className="stroke-surface-container-high" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
              <circle className="stroke-secondary-container transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${percentages[0]} 100`} strokeDashoffset="0" strokeWidth="4" />
              <circle className="stroke-primary-container transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${percentages[1]} 100`} strokeDashoffset={`${-percentages[0]}`} strokeWidth="4" />
              <circle stroke="#4ADE80" className="transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${percentages[2]} 100`} strokeDashoffset={`${-(percentages[0] + percentages[1])}`} strokeWidth="4" />
              <circle className="stroke-tertiary-container transition-all duration-1000 ease-out" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${percentages[3]} 100`} strokeDashoffset={`${-(percentages[0] + percentages[1] + percentages[2])}`} strokeWidth="4" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-on-surface">₹{totalSpent.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {categories.map((cat, i) => (
              <div key={i} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="text-xs font-bold text-on-surface-variant">{cat.name}</span>
                </div>
                <p className="text-xl font-bold text-on-surface">₹{cat.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Health */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className={`p-6 rounded-xl border shadow-sm h-full flex flex-col justify-center gap-4 ${remaining >= 0 ? "bg-primary-container/20 border-primary-container" : "bg-red-50 border-red-300"}`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">{remaining >= 0 ? "check_circle" : "warning"}</span>
              <h4 className="font-bold uppercase tracking-wider text-xs">{remaining >= 0 ? "Within Budget" : "Over Budget"}</h4>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">Your budget</p>
              <p className="text-2xl font-bold text-on-surface">₹{budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">{remaining >= 0 ? "Remaining" : "Exceeded by"}</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? "text-primary" : "text-red-600"}`}>₹{Math.abs(remaining).toLocaleString()}</p>
            </div>
            {budgetResult?.suggestion && (
              <p className="text-sm leading-relaxed font-semibold text-on-surface-variant border-t border-outline-variant/30 pt-3">{budgetResult.suggestion}</p>
            )}
          </div>
        </div>

        {/* Cost Breakdown List */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
            <h3 className="text-xl font-bold">Detailed Breakdown</h3>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {/* Flights */}
            {flights.length > 0 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary-container p-2 bg-secondary-fixed rounded-lg">flight</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Flights</h4>
                </div>
                <div className="space-y-4">
                  {flights.map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant">airplane_ticket</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold">{f.airline}</p>
                          <p className="text-xs text-on-surface-variant">{f.departure} → {f.arrival}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-on-surface">{f.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels */}
            {hotels.length > 0 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary-container p-2 bg-primary-fixed rounded-lg">hotel</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Hotels</h4>
                </div>
                <div className="space-y-4">
                  {hotels.map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant">bed</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold">{h.name}</p>
                          <p className="text-xs text-on-surface-variant">{h.price} / night</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-500" style={{ fontSize: "14px" }}>star</span>
                        <span className="text-sm font-bold">{h.rating || "New"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
