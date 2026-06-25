import asyncio
import logging
import requests
from app.config import settings
from app.agents.base_agent import ADKAgent, A2AMessage

logger = logging.getLogger(__name__)

class WeatherAgent(ADKAgent):
    def __init__(self):
        super().__init__("WeatherAgent")
        self.api_key = settings.openweather_api_key

    async def process_message(self, message: A2AMessage) -> dict:
        payload = message.payload
        destination = payload.get("destination", "Mumbai")

        if not self.api_key:
            return {"status": "error", "agent": self.name, "message": "OPENWEATHER_API_KEY missing", "data": None}

        def _fetch_weather():
            url = f"https://api.openweathermap.org/data/2.5/weather?q={destination}&appid={self.api_key}&units=metric"
            response = requests.get(url)
            response.raise_for_status()
            return response.json()

        try:
            loop = asyncio.get_running_loop()
            data = await loop.run_in_executor(None, _fetch_weather)
            
            weather_data = {
                "temp": round(data["main"]["temp"]),
                "condition": data["weather"][0]["main"],
                "description": data["weather"][0]["description"].capitalize(),
                "icon": data["weather"][0]["icon"]
            }

            return {
                "status": "success",
                "agent": self.name,
                "data": weather_data
            }
        except Exception as e:
            logger.error(f"Weather Fetch Error: {e}")
            return {"status": "error", "agent": self.name, "message": str(e), "data": None}
