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
            url = f"https://api.openweathermap.org/data/2.5/forecast?q={destination}&appid={self.api_key}&units=metric"
            response = requests.get(url)
            response.raise_for_status()
            return response.json()

        try:
            loop = asyncio.get_running_loop()
            data = await loop.run_in_executor(None, _fetch_weather)
            
            # Group 3-hour forecast chunks by day
            daily_forecasts = {}
            for item in data.get("list", []):
                date_str = item["dt_txt"].split(" ")[0] # YYYY-MM-DD
                if date_str not in daily_forecasts:
                    daily_forecasts[date_str] = {
                        "temp_max": -100,
                        "temp_min": 100,
                        "conditions": [],
                        "icons": []
                    }
                
                day_data = daily_forecasts[date_str]
                day_data["temp_max"] = max(day_data["temp_max"], item["main"]["temp_max"])
                day_data["temp_min"] = min(day_data["temp_min"], item["main"]["temp_min"])
                day_data["conditions"].append(item["weather"][0]["main"])
                day_data["icons"].append(item["weather"][0]["icon"])

            # Format the output for the LLM
            forecast_summary = []
            for date, stats in daily_forecasts.items():
                # Get most frequent condition for the day
                main_condition = max(set(stats["conditions"]), key=stats["conditions"].count)
                main_icon = max(set(stats["icons"]), key=stats["icons"].count)
                
                forecast_summary.append({
                    "date": date,
                    "temp": round((stats["temp_max"] + stats["temp_min"]) / 2),
                    "condition": main_condition,
                    "icon": main_icon
                })

            return {
                "status": "success",
                "agent": self.name,
                "data": {
                    "forecast": forecast_summary[:5], # Return next 5 days
                    # Fallback current weather for backwards compatibility
                    "temp": forecast_summary[0]["temp"] if forecast_summary else 25,
                    "condition": forecast_summary[0]["condition"] if forecast_summary else "Clear"
                }
            }
        except Exception as e:
            logger.error(f"Weather Fetch Error: {e}")
            return {"status": "error", "agent": self.name, "message": str(e), "data": None}
