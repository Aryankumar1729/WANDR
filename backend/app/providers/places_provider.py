import asyncio
import logging
import requests
from app.config import settings
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class PlacesProvider:
    def __init__(self):
        self.api_key = settings.foursquare_api_key

    async def search_places(self, query: str) -> List[Dict[str, Any]]:
        if not self.api_key:
            return self._mock_places(query)

        def _do_search():
            url = "https://api.foursquare.com/v3/places/search"
            headers = {
                "Accept": "application/json",
                "Authorization": self.api_key
            }
            params = {
                "query": query,
                "limit": 4,
                "fields": "fsq_id,name,location,geocodes,rating,photos"
            }
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            fsq_data = response.json()
            places = []
            for item in fsq_data.get("results", []):
                # Format exactly like the old Google Places response so ItineraryAgent doesn't need changes
                photo_url = ""
                photos = item.get("photos", [])
                if photos:
                    photo_url = f"{photos[0].get('prefix')}400x400{photos[0].get('suffix')}"
                
                place = {
                    "displayName": {"text": item.get("name")},
                    "formattedAddress": item.get("location", {}).get("formatted_address", ""),
                    "rating": item.get("rating", 0.0) / 2.0, # Foursquare ratings are out of 10
                    "location": item.get("geocodes", {}).get("main", {}),
                    "photos": [{"name": photo_url}] if photo_url else []
                }
                places.append(place)
            return places

        try:
            loop = asyncio.get_running_loop()
            places = await loop.run_in_executor(None, _do_search)
            if not places:
                return self._mock_places(query)
            return places
        except Exception as e:
            logger.error(f"Foursquare Places Error: {e}")
            return self._mock_places(query)

    def _mock_places(self, query: str) -> List[Dict[str, Any]]:
        return [
            {
                "displayName": {"text": f"Mocked {query}"},
                "formattedAddress": "123 Mock Street, City",
                "rating": 4.5,
                "location": {"latitude": 19.0, "longitude": 72.8},
                "photos": [{"name": "places/mocked"}]
            },
            {
                "displayName": {"text": f"Mock Alternative 1"},
                "formattedAddress": "456 Fake Ave, City",
                "rating": 4.2,
                "location": {"latitude": 19.01, "longitude": 72.81},
                "photos": [{"name": "places/mocked"}]
            },
            {
                "displayName": {"text": f"Mock Alternative 2"},
                "formattedAddress": "789 False Blvd, City",
                "rating": 4.8,
                "location": {"latitude": 19.02, "longitude": 72.82},
                "photos": [{"name": "places/mocked"}]
            },
            {
                "displayName": {"text": f"Mock Alternative 3"},
                "formattedAddress": "101 Ghost Lane, City",
                "rating": 3.9,
                "location": {"latitude": 19.03, "longitude": 72.83},
                "photos": [{"name": "places/mocked"}]
            }
        ]

    async def get_distance_and_time(self, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> dict:
        def _do_dist():
            # OSRM requires coordinates in longitude,latitude order
            url = f"http://router.project-osrm.org/route/v1/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=false"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            if data.get("routes") and len(data["routes"]) > 0:
                route = data["routes"][0]
                distance_km = route["distance"] / 1000.0
                duration_mins = route["duration"] / 60.0
                return {
                    "distance": f"{distance_km:.1f} km",
                    "duration": f"{int(duration_mins)} mins"
                }
            return {}

        try:
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(None, _do_dist)
        except Exception as e:
            logger.error(f"OSRM Distance Error: {e}")
            import random
            return {
                "distance": f"{random.randint(1, 10)}.{random.randint(0, 9)} km",
                "duration": f"{random.randint(5, 30)} mins"
            }

    def get_photo_url(self, photo_name: str, max_width: int = 400) -> str:
        if photo_name == "places/mocked":
            return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"
        # Since we format the photo URL directly in search_places, we just return it here
        return photo_name
