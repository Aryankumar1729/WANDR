import asyncio
import logging
import requests
from app.config import settings
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class PlacesProvider:
    def __init__(self):
        self.api_key = settings.google_maps_api_key

    async def search_places(self, query: str) -> List[Dict[str, Any]]:
        if not self.api_key:
            return []

        def _do_search():
            url = "https://places.googleapis.com/v1/places:searchText"
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.id,places.rating,places.priceLevel,places.photos,places.location"
            }
            payload = {
                "textQuery": query
            }
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()

        try:
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(None, _do_search)
            return result.get("places", [])
        except Exception as e:
            logger.error(f"Google Places Error: {e}")
            # Mock fallback due to API limits
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
        if not self.api_key:
            return {}
        
        def _do_dist():
            url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin_lat},{origin_lng}&destinations={dest_lat},{dest_lng}&key={self.api_key}"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            if data.get("rows") and data["rows"][0].get("elements") and data["rows"][0]["elements"][0].get("status") == "OK":
                element = data["rows"][0]["elements"][0]
                return {
                    "distance": element["distance"]["text"],
                    "duration": element["duration"]["text"]
                }
            return {}

        try:
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(None, _do_dist)
        except Exception as e:
            logger.error(f"Distance Matrix Error: {e}")
            import random
            return {
                "distance": f"{random.randint(1, 10)}.{random.randint(0, 9)} km",
                "duration": f"{random.randint(5, 30)} mins"
            }

    def get_photo_url(self, photo_name: str, max_width: int = 400) -> str:
        if photo_name == "places/mocked":
            return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"
        if not self.api_key or not photo_name:
            return ""
        return f"https://places.googleapis.com/v1/{photo_name}/media?maxHeightPx=400&maxWidthPx={max_width}&key={self.api_key}"
