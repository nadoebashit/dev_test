from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WeatherDataBase(BaseModel):
    city: str
    country: str
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    pressure: float

class WeatherDataCreate(WeatherDataBase):
    pass

class WeatherDataUpdate(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None

class WeatherDataOut(WeatherDataBase):
    id: int
    date_fetched: datetime

    class Config:
        from_attributes = True

class WeatherRequest(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
