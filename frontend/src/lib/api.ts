export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface WeatherRequest {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
}

export async function fetchWeather(data: WeatherRequest) {
    const response = await fetch(`${API_URL}/weather`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        let errorMsg = "Failed to fetch weather data";
        try {
            const errBody = await response.json();
            if (errBody.detail) errorMsg = errBody.detail;
        } catch(e) {}
        throw new Error(errorMsg);
    }

    return response.json();
}
