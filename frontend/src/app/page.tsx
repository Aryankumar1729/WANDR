"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useTripData } from "@/context/TripContext";

export default function Home() {
  const { setTripData } = useTripData();
  const [origin, setOrigin] = useState("Delhi");
  const [destination, setDestination] = useState("Mumbai");
  const [departureDate, setDepartureDate] = useState("2026-10-01");
  const [arrivalDate, setArrivalDate] = useState("2026-10-04");
  const [adults, setAdults] = useState("1");
  const [budget, setBudget] = useState("50000");
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any>(null);
  const [budgetResult, setBudgetResult] = useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [mapCenter, setMapCenter] = useState({ lat: 19.0760, lng: 72.8777 });
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setWeather(null);
    setFlights([]);
    setHotels([]);
    setItinerary(null);
    setBudgetResult(null);
    setMapMarkers([]);
    setTripData({ origin, destination, departureDate, arrivalDate, adults: parseInt(adults), budget: parseFloat(budget) });

    const start = new Date(departureDate);
    const end = new Date(arrivalDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Adding 1 to include both start and end days
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;

    const payload = {
      origin,
      destination,
      date: departureDate,
      duration: durationDays,
      adults: parseInt(adults),
      budget: parseFloat(budget)
    };

    try {
      const response = await fetch("http://localhost:8000/api/orchestration/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            try {
              const data = JSON.parse(dataStr);
              setLogs((prev) => [...prev, data.event === "agent_running" ? `Running ${data.agent}...` : data.message || `Completed ${data.agent}`]);
              
              if (data.event === "agent_completed") {
                if (data.agent === "WeatherAgent") {
                  setWeather(data.result.data);
                  setTripData({ weather: data.result.data });
                }
                if (data.agent === "FlightAgent") {
                  setFlights(data.result.data || []);
                  setTripData({ flights: data.result.data || [] });
                }
                if (data.agent === "HotelAgent") {
                  setHotels(data.result.data || []);
                  setTripData({ hotels: data.result.data || [] });
                }
                if (data.agent === "ItineraryAgent") {
                  setItinerary(data.result.data);
                  setTripData({ itinerary: data.result.data });
                  
                  // Extract locations for map
                  const markers: any[] = [];
                  data.result.data?.days?.forEach((d: any) => {
                    d.activities?.forEach((a: any) => {
                      if (a.place_details?.location) {
                        const loc = { lat: a.place_details.location.latitude, lng: a.place_details.location.longitude };
                        markers.push({ ...loc, title: a.place_details.name });
                      }
                    });
                  });
                  if (markers.length > 0) {
                    setMapCenter({ lat: markers[0].lat, lng: markers[0].lng });
                    setMapMarkers(markers);
                    setTripData({ mapMarkers: markers, mapCenter: { lat: markers[0].lat, lng: markers[0].lng } });
                  }
                }
                if (data.agent === "BudgetAgent") {
                  setBudgetResult(data.result.data);
                  setTripData({ budgetResult: data.result.data });
                }
              }
            } catch (err) {
              console.error("Failed to parse SSE JSON", err);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setLogs((prev) => [...prev, "Connection error occurred."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8">
      {/* Left Content Column */}
      <div className="flex-1 max-w-4xl flex flex-col gap-8">
        
        {/* Search Header */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Where do you want to go?</h2>
          <p className="text-on-surface-variant mb-6 text-sm">Let Wandr's Multi-Agent AI plan your perfect trip.</p>
          
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold tracking-wider text-outline mb-2 uppercase">Origin</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary text-sm" required />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold tracking-wider text-outline mb-2 uppercase">Destination</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary text-sm" required />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-bold tracking-wider text-outline mb-2 uppercase">Departure</label>
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary text-sm cursor-pointer" required />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-bold tracking-wider text-outline mb-2 uppercase">Arrival</label>
              <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary text-sm cursor-pointer" required />
            </div>
            <div className="w-20">
              <label className="block text-xs font-bold tracking-wider text-outline mb-2 uppercase">Adults</label>
              <select value={adults} onChange={(e) => setAdults(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary text-sm cursor-pointer">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold tracking-wider text-outline mb-2 uppercase">Budget (₹)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 h-[44px] flex items-center justify-center">
              {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Generate"}
            </button>
          </form>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="flex flex-col gap-8 animate-fade-in">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
              <h3 className="font-bold text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined animate-pulse text-xl">psychology</span>
                Agents Thinking...
              </h3>
              <div className="flex flex-col gap-2 font-mono text-xs text-on-surface-variant">
                {logs.map((log, i) => (
                  <div key={i} className="border-l-2 border-primary-fixed pl-2">{log}</div>
                ))}
              </div>
            </div>

            {/* Flight Skeleton */}
            <div>
               <div className="h-6 w-48 bg-surface-variant rounded animate-pulse mb-4"></div>
               <div className="flex gap-4">
                 {[1,2].map(i => (
                   <div key={i} className="min-w-[280px] bg-white p-5 rounded-2xl border border-outline-variant/30 h-24 animate-pulse"></div>
                 ))}
               </div>
            </div>

            {/* Hotel Skeleton */}
            <div>
               <div className="h-6 w-48 bg-surface-variant rounded animate-pulse mb-4"></div>
               <div className="flex gap-4">
                 {[1,2].map(i => (
                   <div key={i} className="min-w-[300px] h-64 bg-white rounded-2xl border border-outline-variant/30 animate-pulse"></div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Results Stream */}
        {!loading && (flights.length > 0 || hotels.length > 0) && (
          <div className="flex flex-col gap-8 animate-slide-up">
            
            {flights.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-on-surface">Recommended Flights</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {flights.map((f, i) => (
                    <div key={i} className="min-w-[280px] bg-white p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded text-xs font-bold">{f.airline}</span>
                        <span className="font-bold text-primary">{f.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <span>{f.departure}</span>
                        <div className="flex-1 h-px bg-outline-variant relative"><span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-outline bg-white px-1 text-sm">flight_takeoff</span></div>
                        <span>{f.arrival}</span>
                      </div>
                      <button className="w-full py-2 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface text-sm font-bold rounded-lg border border-outline-variant/30">Book Flight</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hotels.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-on-surface">Top Hotel Stays</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {hotels.map((h, i) => (
                    <div key={i} className="min-w-[300px] max-w-[300px] bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
                      <div className="h-40 bg-surface-container relative">
                        {h.thumbnail && <img src={h.thumbnail} alt={h.name} className="w-full h-full object-cover" />}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded font-bold text-xs flex items-center gap-1 text-on-surface">
                          <span className="material-symbols-outlined text-amber-500" style={{fontSize: "14px"}}>star</span> {h.rating || "New"}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <h4 className="font-bold text-on-surface truncate">{h.name}</h4>
                        <p className="text-primary font-bold">{h.price} <span className="text-xs text-on-surface-variant font-normal">/ night</span></p>
                        <div className="flex gap-1 mt-1 mb-2">
                          {h.amenities?.slice(0,2).map((am: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-surface-container px-2 py-1 rounded text-on-surface-variant truncate">{am}</span>
                          ))}
                        </div>
                        <button className="mt-auto w-full py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors">Select Hotel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Itinerary Timeline */}
        {!loading && itinerary && (
          <div className="animate-slide-up mt-4">
            <h3 className="text-2xl font-bold mb-8 text-on-surface border-b border-outline-variant/30 pb-4">Daily Itinerary</h3>
            {itinerary.days?.map((day: any, i: number) => (
              <div key={i} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">Day {day.day}</span>
                </div>
                
                <div className="relative timeline-line">
                  {day.activities?.map((act: any, j: number) => (
                    <div key={j} className="mb-8 pl-10 relative group">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 border-4 border-background">
                        <div className="w-2 h-2 rounded-full bg-on-primary"></div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow relative">
                        {act.travel_info && (
                          <div className="absolute -top-4 right-6 flex items-center gap-1 text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded shadow-sm border border-outline-variant/20 z-20">
                            <span className="material-symbols-outlined text-xs">directions_car</span>
                            {act.travel_info.duration} ({act.travel_info.distance})
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <p className="text-primary font-bold text-xs mb-1">{act.time}</p>
                          <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold text-on-surface-variant">{act.type}</span>
                        </div>
                        <h4 className="font-bold text-lg text-on-surface mb-2">{act.title}</h4>
                        
                        {act.place_details && (
                          <div className="mt-4 bg-surface-container-low p-3 rounded-lg flex items-start gap-3 border border-outline-variant/20">
                            {act.place_details.photo_url ? (
                              <img src={act.place_details.photo_url} alt="place" className="w-16 h-16 rounded object-cover flex-shrink-0" />
                            ) : (
                              <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-on-surface truncate">{act.place_details.name}</p>
                              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed truncate">{act.place_details.address}</p>
                              {act.place_details.rating && <p className="text-xs font-bold text-amber-600 mt-1 flex items-center gap-1"><span className="material-symbols-outlined" style={{fontSize:"14px"}}>star</span> {act.place_details.rating}</p>}
                            </div>
                          </div>
                        )}

                        {act.alternatives && act.alternatives.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-outline-variant/20">
                            <h5 className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-widest flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">restaurant</span> Alternative Nearby Options
                            </h5>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {act.alternatives.map((alt: any, idx: number) => (
                                <div key={idx} className="flex-shrink-0 w-28 bg-surface-container-lowest rounded-md border border-outline-variant/30 overflow-hidden flex flex-col">
                                  {alt.photo_url ? (
                                    <img src={alt.photo_url} alt={alt.name} className="w-full h-14 object-cover" />
                                  ) : (
                                    <div className="w-full h-14 bg-surface-container flex items-center justify-center">
                                      <span className="material-symbols-outlined text-outline text-lg">restaurant</span>
                                    </div>
                                  )}
                                  <div className="p-1.5 flex flex-col justify-center flex-1">
                                    <p className="text-[9px] font-bold text-on-surface line-clamp-2 leading-tight" title={alt.name}>{alt.name}</p>
                                    {alt.rating && <p className="text-[8px] font-bold text-amber-600 flex items-center mt-0.5"><span className="material-symbols-outlined" style={{fontSize:"10px"}}>star</span> {alt.rating}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Right Sidebar */}
      <aside className="w-80 flex flex-col gap-6 sticky top-24 h-[calc(100vh-120px)]">
        
        {/* Weather Card */}
        {weather && (
          <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest">{destination} Weather</span>
              <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt="weather icon" className="w-8 h-8 filter brightness-0 invert" />
            </div>
            <div className="flex items-end gap-2">
              <h4 className="text-4xl font-bold leading-none">{weather.temp}°C</h4>
              <span className="text-sm opacity-80 pb-1">{weather.condition}</span>
            </div>
            <p className="mt-4 text-sm opacity-90">{weather.description}</p>
          </div>
        )}

        {/* Budget Card */}
        {budgetResult && (
          <div className={`p-6 rounded-2xl shadow-sm border animate-fade-in ${budgetResult.feasible ? "bg-primary-container/20 border-primary-container text-on-surface" : "bg-error-container border-error text-on-error-container"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">{budgetResult.feasible ? "check_circle" : "warning"}</span>
              <h4 className="font-bold uppercase tracking-wider text-xs">Budget Check</h4>
            </div>
            <p className="text-sm leading-relaxed font-semibold">{budgetResult.suggestion}</p>
          </div>
        )}

        {/* Map */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 flex flex-col flex-1 min-h-[300px]">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
            <h5 className="font-bold text-sm text-on-surface">Interactive Map</h5>
            <span className="material-symbols-outlined text-primary text-sm cursor-pointer">open_in_new</span>
          </div>
          <div className="flex-1 relative bg-surface-container">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={12}
                options={{ disableDefaultUI: true }}
              >
                {mapMarkers.map((m, i) => (
                  <Marker key={i} position={{ lat: m.lat, lng: m.lng }} title={m.title} />
                ))}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline text-sm font-bold">
                Loading Map...
              </div>
            )}
          </div>
        </div>

      </aside>
    </div>
  );
}
