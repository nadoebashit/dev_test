from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
import models, schemas
import datetime

async def get_weather(db: AsyncSession, city: str, country: str):
    statement = select(models.WeatherData).where(
        models.WeatherData.city == city,
        models.WeatherData.country == country
    )
    result = await db.execute(statement)
    return result.scalar_one_or_none()

async def get_weather_by_id(db: AsyncSession, weather_id: int):
    statement = select(models.WeatherData).where(models.WeatherData.id == weather_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()

async def get_all_weather(db: AsyncSession, skip: int = 0, limit: int = 100):
    statement = select(models.WeatherData).offset(skip).limit(limit)
    result = await db.execute(statement)
    return result.scalars().all()

async def create_weather(db: AsyncSession, weather: schemas.WeatherDataCreate):
    db_weather = models.WeatherData(
        city=weather.city,
        country=weather.country,
        latitude=weather.latitude,
        longitude=weather.longitude,
        temperature=weather.temperature,
        humidity=weather.humidity,
        pressure=weather.pressure,
        date_fetched=datetime.datetime.utcnow()
    )
    db.add(db_weather)
    await db.commit()
    await db.refresh(db_weather)
    return db_weather

async def update_weather(db: AsyncSession, weather_id: int, weather_update: schemas.WeatherDataUpdate):
    db_weather = await get_weather_by_id(db, weather_id)
    if db_weather:
        update_data = weather_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_weather, key, value)
        db_weather.date_fetched = datetime.datetime.utcnow()
        await db.commit()
        await db.refresh(db_weather)
    return db_weather

async def update_weather_by_city_country(db: AsyncSession, city: str, country: str, weather_update: schemas.WeatherDataCreate):
    db_weather = await get_weather(db, city, country)
    if db_weather:
        db_weather.temperature = weather_update.temperature
        db_weather.humidity = weather_update.humidity
        db_weather.pressure = weather_update.pressure
        db_weather.latitude = weather_update.latitude
        db_weather.longitude = weather_update.longitude
        db_weather.date_fetched = datetime.datetime.utcnow()
        await db.commit()
        await db.refresh(db_weather)
        return db_weather
    return await create_weather(db, weather_update)

async def delete_weather(db: AsyncSession, weather_id: int):
    db_weather = await get_weather_by_id(db, weather_id)
    if db_weather:
        await db.delete(db_weather)
        await db.commit()
    return db_weather
