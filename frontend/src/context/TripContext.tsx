"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TripData {
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  adults: number;
  budget: number;
  weather: any;
  flights: any[];
  hotels: any[];
  itinerary: any;
  budgetResult: any;
  mapMarkers: any[];
  mapCenter: { lat: number; lng: number };
}

interface TripContextType {
  tripData: TripData;
  setTripData: (data: Partial<TripData>) => void;
}

const defaultTrip: TripData = {
  origin: "",
  destination: "",
  departureDate: "",
  arrivalDate: "",
  adults: 1,
  budget: 50000,
  weather: null,
  flights: [],
  hotels: [],
  itinerary: null,
  budgetResult: null,
  mapMarkers: [],
  mapCenter: { lat: 19.076, lng: 72.8777 },
};

const TripContext = createContext<TripContextType>({
  tripData: defaultTrip,
  setTripData: () => {},
});

export function TripProvider({ children }: { children: ReactNode }) {
  const [tripData, setTripDataState] = useState<TripData>(defaultTrip);

  const setTripData = (data: Partial<TripData>) => {
    setTripDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <TripContext.Provider value={{ tripData, setTripData }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripData() {
  return useContext(TripContext);
}
