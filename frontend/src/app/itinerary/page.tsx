"use client";

import { useTripData } from "@/context/TripContext";
import { useState, useRef } from "react";

/** Maps activity type keywords to icon names and colors */
function getTypeConfig(type: string): { icon: string; bg: string; text: string } {
  const t = (type || "").toLowerCase();
  if (t.includes("meal") || t.includes("food") || t.includes("breakfast") || t.includes("lunch") || t.includes("dinner"))
    return { icon: "restaurant", bg: "bg-tertiary-fixed/40", text: "text-tertiary" };
  if (t.includes("sight") || t.includes("visit") || t.includes("tour") || t.includes("explore"))
    return { icon: "photo_camera", bg: "bg-primary-fixed/40", text: "text-primary" };
  if (t.includes("travel") || t.includes("transit") || t.includes("transport"))
    return { icon: "directions_car", bg: "bg-surface-container-high", text: "text-on-surface-variant" };
  if (t.includes("adventure") || t.includes("activity") || t.includes("sport"))
    return { icon: "hiking", bg: "bg-secondary-fixed/40", text: "text-secondary" };
  if (t.includes("rest") || t.includes("relax") || t.includes("hotel") || t.includes("check"))
    return { icon: "bed", bg: "bg-primary-fixed/30", text: "text-primary" };
  if (t.includes("shop"))
    return { icon: "shopping_bag", bg: "bg-tertiary-fixed/30", text: "text-tertiary" };
  return { icon: "event", bg: "bg-surface-container-high", text: "text-on-surface-variant" };
}

export default function ItineraryPage() {
  const { tripData } = useTripData();
  const itinerary = tripData.itinerary;
  const days: any[] = itinerary?.days || [];

  const [expandedDay, setExpandedDay] = useState<number | null>(
    days.length > 0 ? 0 : null
  );

  if (!itinerary || days.length === 0) {
    return (
      <div className="max-w-5xl mx-auto w-full animate-fade-in">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 rounded-full bg-primary-fixed/30 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-5xl">
              event_note
            </span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">
            No Itinerary Yet
          </h2>
          <p className="text-on-surface-variant max-w-md">
            Generate a trip first from the home page. Your detailed day-by-day
            itinerary will appear here.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm transition-transform active:scale-95 hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            Plan a Trip
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Itinerary</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {tripData.destination || "Your Trip"} •{" "}
            {days.length} day{days.length !== 1 ? "s" : ""} planned
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-bold hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">share</span>
            Share
          </button>
        </div>
      </div>

      {/* Day Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day: any, dIdx: number) => (
          <button
            key={dIdx}
            onClick={() => setExpandedDay(dIdx)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              expandedDay === dIdx
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            Day {day.day || dIdx + 1}
          </button>
        ))}
        <button
          onClick={() => setExpandedDay(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            expandedDay === null
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
          }`}
        >
          All Days
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {days
          .filter((_: any, dIdx: number) =>
            expandedDay === null ? true : expandedDay === dIdx
          )
          .map((day: any, filteredIdx: number) => {
            const dayNumber = day.day || filteredIdx + 1;
            const activities: any[] = day.activities || [];

            return (
              <div
                key={dayNumber}
                className="animate-slide-up"
                style={{ animationDelay: `${filteredIdx * 100}ms` }}
              >
                {/* Day Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary text-xl font-bold shadow-md shrink-0">
                    {dayNumber}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">
                      Day {dayNumber}
                    </h3>
                    {day.date && (
                      <p className="text-xs text-on-surface-variant">
                        {day.date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Activity Cards with Timeline */}
                <div className="relative pl-8 space-y-4">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[23px] top-0 bottom-4 w-[2px] bg-outline-variant/50 rounded-full" />

                  {activities.map((activity: any, aIdx: number) => {
                    const typeConfig = getTypeConfig(activity.type || "");
                    const isMeal = (activity.type || "")
                      .toLowerCase()
                      .includes("meal") || (activity.type || "").toLowerCase().includes("food") || (activity.type || "").toLowerCase().includes("dinner") || (activity.type || "").toLowerCase().includes("lunch") || (activity.type || "").toLowerCase().includes("breakfast");

                    return (
                      <div key={aIdx} className="relative">
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-8 top-5 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 border-surface ${typeConfig.bg}`}
                        >
                          <span
                            className={`material-symbols-outlined text-[14px] ${typeConfig.text}`}
                          >
                            {typeConfig.icon}
                          </span>
                        </div>

                        {/* Card */}
                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                          <div className="p-5">
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary-fixed/40 px-3 py-1 rounded-lg">
                                  <span className="material-symbols-outlined text-[14px]">
                                    schedule
                                  </span>
                                  {activity.time}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${typeConfig.bg} ${typeConfig.text}`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {typeConfig.icon}
                                  </span>
                                  {activity.type}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-base font-bold text-on-surface mb-3">
                              {activity.title}
                            </h4>

                            {/* Place Details */}
                            {activity.place_details && (
                              <div className="flex gap-4 mb-3 p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/30">
                                {activity.place_details.photo_url && (
                                  <img
                                    src={activity.place_details.photo_url}
                                    alt={activity.place_details.name}
                                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <p className="text-sm font-semibold text-on-surface truncate">
                                    {activity.place_details.name}
                                  </p>
                                  {activity.place_details.address && (
                                    <p className="text-xs text-on-surface-variant flex items-start gap-1">
                                      <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">
                                        location_on
                                      </span>
                                      <span className="line-clamp-2">
                                        {activity.place_details.address}
                                      </span>
                                    </p>
                                  )}
                                  {activity.place_details.rating && (
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="material-symbols-outlined text-amber-500 text-[14px]"
                                        style={{
                                          fontVariationSettings: "'FILL' 1",
                                        }}
                                      >
                                        star
                                      </span>
                                      <span className="text-xs font-bold text-on-surface">
                                        {activity.place_details.rating}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Travel Info Badge */}
                            {activity.travel_info && (
                              <div className="inline-flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/30 mb-3">
                                <span className="material-symbols-outlined text-[14px]">
                                  directions_car
                                </span>
                                {activity.travel_info.distance && (
                                  <span className="font-semibold">
                                    {activity.travel_info.distance}
                                  </span>
                                )}
                                {activity.travel_info.distance &&
                                  activity.travel_info.duration && (
                                    <span className="text-outline">•</span>
                                  )}
                                {activity.travel_info.duration && (
                                  <span className="font-semibold">
                                    {activity.travel_info.duration}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Alternatives Carousel for Meal Activities */}
                            {isMeal &&
                              activity.alternatives &&
                              activity.alternatives.length > 0 && (
                                <AlternativesCarousel
                                  alternatives={activity.alternatives}
                                />
                              )}
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

      {/* Summary Footer */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container p-2 bg-primary-fixed rounded-lg">
            auto_awesome
          </span>
          <p className="text-sm text-on-surface-variant">
            This itinerary was generated by Wandr AI. Customize activities by
            tapping on any card.
          </p>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">
          Regenerate
        </button>
      </div>
    </div>
  );
}

/** Horizontal scrollable carousel for meal alternatives */
function AlternativesCarousel({
  alternatives,
}: {
  alternatives: any[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-outline-variant/30">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-tertiary">
            swap_horiz
          </span>
          Alternatives
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_left
            </span>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
      >
        {alternatives.map((alt: any, i: number) => (
          <div
            key={i}
            className="shrink-0 w-44 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden hover:border-tertiary/40 transition-all cursor-pointer hover:shadow-md group"
          >
            {alt.photo_url ? (
              <img
                src={alt.photo_url}
                alt={alt.name}
                className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-24 bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
                  restaurant
                </span>
              </div>
            )}
            <div className="p-2.5">
              <p className="text-xs font-semibold text-on-surface truncate mb-1">
                {alt.name}
              </p>
              {alt.rating && (
                <div className="flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-amber-500 text-[12px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="text-[11px] font-bold text-on-surface-variant">
                    {alt.rating}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
