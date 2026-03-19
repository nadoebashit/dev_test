import { create } from 'zustand';

interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    humidity: number;
    pressure: number;
    latitude: number;
    longitude: number;
}

interface WeatherStore {
    weatherData: WeatherData | null;
    isLoading: boolean;
    error: string | null;
    notification: { type: 'success' | 'error', message: string } | null;
    
    setWeatherData: (data: WeatherData | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
    weatherData: null,
    isLoading: false,
    error: null,
    notification: null,
    
    setWeatherData: (data) => set({ weatherData: data, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setNotification: (notification) => {
        set({ notification });
        if (notification) {
            setTimeout(() => {
                set({ notification: null });
            }, 3000);
        }
    }
}));
