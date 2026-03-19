import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

async def test_read_weather_empty(async_client: AsyncClient):
    response = await async_client.get("/weather")
    assert response.status_code == 200
    assert response.json() == []

async def test_fetch_and_create_weather(async_client: AsyncClient, monkeypatch):
    # Mock the external API call to return consistent data for testing
    from external_api import get_weather
    import schemas

    async def mock_get_weather(req):
        return schemas.WeatherDataCreate(
            city="Astana",
            country="Kazakhstan",
            latitude=51.18,
            longitude=71.44,
            temperature=10.5,
            humidity=60.0,
            pressure=1010.0
        )
    
    monkeypatch.setattr("main.external_api.get_weather", mock_get_weather)

    response = await async_client.post("/weather", json={"city": "Astana", "country": "Kazakhstan"})
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Astana"
    assert data["temperature"] == 10.5
    assert "id" in data

    # Verify that the record can be retrieved
    response = await async_client.get(f"/weather/{data['id']}")
    assert response.status_code == 200
    assert response.json()["city"] == "Astana"

async def test_update_weather(async_client: AsyncClient):
    response = await async_client.put("/weather/1", json={"temperature": 25.0})
    assert response.status_code == 200
    data = response.json()
    assert data["temperature"] == 25.0

async def test_delete_weather(async_client: AsyncClient):
    response = await async_client.delete("/weather/1")
    assert response.status_code == 200
    response = await async_client.get("/weather/1")
    assert response.status_code == 404
