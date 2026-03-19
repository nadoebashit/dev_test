import httpx
from typing import Tuple, Optional
import schemas

async def fetch_coordinates(city: str, country: str) -> Optional[Tuple[float, float, str, str]]:
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=10&language=en&format=json"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            if "results" in data:
                for result in data["results"]:
                    if not country or result.get("country", "").lower() == country.lower():
                        return result["latitude"], result["longitude"], result.get("name", city), result.get("country", country)
                
                return data["results"][0]["latitude"], data["results"][0]["longitude"], data["results"][0].get("name", city), data["results"][0].get("country", country)
    return None

async def fetch_weather_by_coords(lat: float, lon: float, city: str, country: str) -> Optional[schemas.WeatherDataCreate]:
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,surface_pressure"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            return schemas.WeatherDataCreate(
                city=city,
                country=country,
                latitude=lat,
                longitude=lon,
                temperature=current.get("temperature_2m", 0.0),
                humidity=current.get("relative_humidity_2m", 0.0),
                pressure=current.get("surface_pressure", 0.0)
            )
    return None

async def get_weather(req: schemas.WeatherRequest) -> Optional[schemas.WeatherDataCreate]:
    if req.latitude is not None and req.longitude is not None:
        # User supplied lat/lon
        return await fetch_weather_by_coords(req.latitude, req.longitude, req.city or "Unknown City", req.country or "Unknown Country")
    elif req.city:
        coords = await fetch_coordinates(req.city, req.country or "")
        if coords:
            lat, lon, res_city, res_country = coords
            return await fetch_weather_by_coords(lat, lon, res_city, res_country)
    return None
