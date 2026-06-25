"""
OpenWeatherMap Service — weather forecasts and outdoor suitability.

Uses the 5-day / 3-hour forecast endpoint (free tier).
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import date, datetime

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


class WeatherService:
    """Async wrapper for OpenWeatherMap forecast API."""

    def __init__(self) -> None:
        self.api_key = settings.openweather_api_key

    # ── Forecast ──────────────────────────────────────────────────

    async def get_forecast(self, lat: float, lon: float) -> dict:
        """
        Fetch 5-day / 3-hour forecast and aggregate into daily summaries.

        Returns:
            {
              "latitude": float,
              "longitude": float,
              "city": str,
              "days": [WeatherDay-like dicts]
            }
        """
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(FORECAST_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        city_name = data.get("city", {}).get("name", "")
        forecasts = data.get("list", [])

        # Group 3-hour entries by date
        by_date: dict[str, list[dict]] = defaultdict(list)
        for entry in forecasts:
            dt_str = entry.get("dt_txt", "")
            day_str = dt_str.split(" ")[0] if dt_str else ""
            if day_str:
                by_date[day_str].append(entry)

        days = []
        for day_str in sorted(by_date.keys()):
            entries = by_date[day_str]
            days.append(self._aggregate_day(day_str, entries))

        return {
            "latitude": lat,
            "longitude": lon,
            "city": city_name,
            "days": days,
        }

    # ── Specific date ─────────────────────────────────────────────

    async def get_weather_for_date(
        self,
        lat: float,
        lon: float,
        target_date: date,
    ) -> dict | None:
        """
        Get weather for a specific date (within 5-day forecast window).

        Returns a WeatherDay-like dict or None if the date is out of range.
        """
        forecast = await self.get_forecast(lat, lon)
        target_str = target_date.isoformat()

        for day in forecast.get("days", []):
            if day["date"] == target_str:
                return day
        return None

    # ── Suitability ───────────────────────────────────────────────

    def classify_weather(self, weather_day: dict) -> dict:
        """
        Classify a day's weather for outdoor suitability.

        Returns:
            {
                "suitability": "outdoor_friendly" | "indoor_preferred" | "weather_dependent",
                "reason": str
            }
        """
        main = weather_day.get("weather_main", "").lower()
        temp_max = weather_day.get("temp_max", 30)
        rain_prob = weather_day.get("rain_probability", 0)
        wind = weather_day.get("wind_speed", 0)

        # Heavy rain / thunderstorm → indoor
        if main in ("thunderstorm", "drizzle") or rain_prob > 0.7:
            return {
                "suitability": "indoor_preferred",
                "reason": f"High chance of rain ({rain_prob:.0%}) with {main} expected. "
                          "Consider museums, indoor markets, or cooking classes.",
            }

        # Extreme heat
        if temp_max > 42:
            return {
                "suitability": "indoor_preferred",
                "reason": f"Extreme heat ({temp_max}°C). Limit outdoor exposure; "
                          "schedule sightseeing for early morning or evening.",
            }

        # Rain but not heavy
        if main == "rain" or 0.4 < rain_prob <= 0.7:
            return {
                "suitability": "weather_dependent",
                "reason": f"Moderate rain chance ({rain_prob:.0%}). Carry an umbrella; "
                          "have indoor backup plans ready.",
            }

        # Strong wind
        if wind > 15:
            return {
                "suitability": "weather_dependent",
                "reason": f"Windy conditions ({wind} m/s). Avoid hilltop forts or "
                          "open desert; prefer sheltered attractions.",
            }

        # Clear / mild
        return {
            "suitability": "outdoor_friendly",
            "reason": f"Pleasant weather ({main}, {temp_max}°C). Great day for "
                      "outdoor sightseeing and walks.",
        }

    # ── Helpers ───────────────────────────────────────────────────

    @staticmethod
    def _aggregate_day(day_str: str, entries: list[dict]) -> dict:
        """Aggregate 3-hour slots into a single day summary."""
        temps = []
        humidities = []
        winds = []
        rain_probs = []
        weather_mains: list[str] = []
        weather_descs: list[str] = []
        icons: list[str] = []

        for e in entries:
            main_info = e.get("main", {})
            temps.append(main_info.get("temp", 0))
            humidities.append(main_info.get("humidity", 0))
            winds.append(e.get("wind", {}).get("speed", 0))
            rain_probs.append(e.get("pop", 0))

            weather_list = e.get("weather", [{}])
            if weather_list:
                w = weather_list[0]
                weather_mains.append(w.get("main", ""))
                weather_descs.append(w.get("description", ""))
                icons.append(w.get("icon", ""))

        # Pick the most common weather condition
        most_common_main = max(set(weather_mains), key=weather_mains.count) if weather_mains else ""
        most_common_desc = max(set(weather_descs), key=weather_descs.count) if weather_descs else ""
        # Pick the midday icon (index ~4 for 12:00) or first available
        midday_icon = icons[len(icons) // 2] if icons else ""

        return {
            "date": day_str,
            "temp_min": round(min(temps), 1) if temps else 0,
            "temp_max": round(max(temps), 1) if temps else 0,
            "temp_avg": round(sum(temps) / len(temps), 1) if temps else 0,
            "humidity": round(sum(humidities) / len(humidities), 1) if humidities else 0,
            "wind_speed": round(max(winds), 1) if winds else 0,
            "weather_main": most_common_main,
            "weather_description": most_common_desc,
            "icon": midday_icon,
            "rain_probability": round(max(rain_probs), 2) if rain_probs else 0,
        }


# Module-level singleton
weather_service = WeatherService()
