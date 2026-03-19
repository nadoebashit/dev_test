"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeatherStore } from '@/store/weatherStore';
import { fetchWeather } from '@/lib/api';
import Notification from '@/components/Notification';
import { MapPin, Globe } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { setWeatherData, setLoading, setNotification } = useWeatherStore();
  const isLoading = useWeatherStore((state) => state.isLoading);

  const [inputType, setInputType] = useState<'city' | 'coords'>('city');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (inputType === 'city') {
      if (!city.trim()) newErrors.city = 'City is required';
      if (!country.trim()) newErrors.country = 'Country is required';
    } else {
      if (!latitude.trim() || isNaN(Number(latitude))) newErrors.latitude = 'Valid latitude is required';
      if (!longitude.trim() || isNaN(Number(longitude))) newErrors.longitude = 'Valid longitude is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setNotification(null);
    try {
      const requestPayload =
        inputType === 'city'
          ? { city, country }
          : { latitude: Number(latitude), longitude: Number(longitude) };

      const data = await fetchWeather(requestPayload);
      setWeatherData(data);
      setNotification({ type: 'success', message: 'Weather data fetched successfully!' });
      router.push('/weather');
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-white">
      <Notification />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8">
        <h1 className="text-3xl font-extrabold text-neutral-800 mb-6 text-center">Weather API</h1>
        
        <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setInputType('city'); setErrors({}); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              inputType === 'city' ? 'bg-white shadow-sm text-indigo-600' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Globe size={18} /> City & Country
          </button>
          <button
            onClick={() => { setInputType('coords'); setErrors({}); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              inputType === 'coords' ? 'bg-white shadow-sm text-indigo-600' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <MapPin size={18} /> Coordinates
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {inputType === 'city' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.country ? 'border-red-500' : 'border-neutral-200'}`}
                  placeholder="e.g. Kazakhstan"
                />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.city ? 'border-red-500' : 'border-neutral-200'}`}
                  placeholder="e.g. Astana"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.latitude ? 'border-red-500' : 'border-neutral-200'}`}
                  placeholder="e.g. 51.1801"
                />
                {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.longitude ? 'border-red-500' : 'border-neutral-200'}`}
                  placeholder="e.g. 71.446"
                />
                {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center"
          >
            {isLoading ? (
               <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : "Get Weather"}
          </button>
        </form>
      </div>
    </main>
  );
}
