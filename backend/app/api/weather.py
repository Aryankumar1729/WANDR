from fastapi import APIRouter, Query
from app.models.schemas import WeatherForecast
from app.services.weather_service import weather_service

router = APIRouter()

@router.get("/", response_model=WeatherForecast)
async def get_weather(lat: float = Query(...), lon: float = Query(...)):
    res = await weather_service.get_forecast(lat, lon)
    return WeatherForecast(**res)
