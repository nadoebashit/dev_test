from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

import models, schemas, crud, external_api
from database import engine, get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Weather API Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = AsyncIOScheduler()

async def update_weather_task():
    logger.info("Starting periodic weather update task...")
    async for db in get_db():
        weather_records = await crud.get_all_weather(db)
        for record in weather_records:
            try:
                
                weather_data = await external_api.fetch_weather_by_coords(record.latitude, record.longitude, record.city, record.country)
                if weather_data:
                    await crud.update_weather_by_city_country(db, record.city, record.country, weather_data)
                    logger.info(f"Updated weather for {record.city}, {record.country}")
            except Exception as e:
                logger.error(f"Failed to update weather for {record.city}, {record.country}: {e}")

@app.on_event("startup")
async def startup_event():
    scheduler.add_job(update_weather_task, "interval", minutes=30)
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.post("/weather", response_model=schemas.WeatherDataOut)
async def fetch_and_create_weather(request: schemas.WeatherRequest, db: AsyncSession = Depends(get_db)):
    
    weather_data = await external_api.get_weather(request)
    if not weather_data:
        raise HTTPException(status_code=400, detail="Could not fetch weather data. Check your inputs.")
    
    
    db_weather = await crud.update_weather_by_city_country(
        db, 
        city=weather_data.city, 
        country=weather_data.country, 
        weather_update=weather_data
    )
    return db_weather

@app.get("/weather", response_model=list[schemas.WeatherDataOut])
async def read_weathers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    weathers = await crud.get_all_weather(db, skip=skip, limit=limit)
    return weathers

@app.get("/weather/{weather_id}", response_model=schemas.WeatherDataOut)
async def read_weather(weather_id: int, db: AsyncSession = Depends(get_db)):
    db_weather = await crud.get_weather_by_id(db, weather_id=weather_id)
    if db_weather is None:
        raise HTTPException(status_code=404, detail="Weather record not found")
    return db_weather

@app.put("/weather/{weather_id}", response_model=schemas.WeatherDataOut)
async def update_weather(weather_id: int, weather: schemas.WeatherDataUpdate, db: AsyncSession = Depends(get_db)):
    db_weather = await crud.update_weather(db, weather_id=weather_id, weather_update=weather)
    if db_weather is None:
        raise HTTPException(status_code=404, detail="Weather record not found")
    return db_weather

@app.delete("/weather/{weather_id}")
async def delete_weather(weather_id: int, db: AsyncSession = Depends(get_db)):
    db_weather = await crud.delete_weather(db, weather_id=weather_id)
    if db_weather is None:
        raise HTTPException(status_code=404, detail="Weather record not found")
    return {"detail": "Successfully deleted"}
