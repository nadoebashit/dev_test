"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeatherStore } from '@/store/weatherStore';
import Notification from '@/components/Notification';
import { ArrowLeft, Cloud, Droplets, Thermometer, Gauge } from 'lucide-react';

export default function WeatherResult() {
  const router = useRouter();
  const { weatherData } = useWeatherStore();
  const [bgColor, setBgColor] = useState('bg-white');

  useEffect(() => {
    if (!weatherData) {
      router.push('/');
      return;
    }
    
    // Calculate color based on temperature
    const temp = weatherData.temperature;
    if (temp <= 0) {
      setBgColor('bg-blue-100'); // Cold
    } else if (temp > 0 && temp <= 15) {
      setBgColor('bg-cyan-100'); // Cool
    } else if (temp > 15 && temp <= 25) {
      setBgColor('bg-yellow-100'); // Warm
    } else {
      setBgColor('bg-orange-100'); // Hot
    }
  }, [weatherData, router]);

  if (!weatherData) return null;

  return (
    <main className={`min-h-screen p-6 transition-colors duration-1000 flex flex-col items-center justify-center ${bgColor}`}>
      <Notification />
      <div className="w-full max-w-lg bg-white/60 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/40">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Search
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">
            {weatherData.city}
          </h1>
          <p className="text-lg text-neutral-600 font-medium">
            {weatherData.country}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mb-10">
          <div className="text-7xl font-black text-neutral-900 tracking-tighter flex items-start">
            {weatherData.temperature.toFixed(1)}
            <span className="text-4xl mt-2 select-none">°C</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-2xl p-4 flex items-center shadow-sm">
            <Thermometer className="text-blue-500 mr-3" size={24} />
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Temp</p>
              <p className="font-bold text-neutral-800">{weatherData.temperature}°C</p>
            </div>
          </div>
          <div className="bg-white/70 rounded-2xl p-4 flex items-center shadow-sm">
            <Droplets className="text-cyan-500 mr-3" size={24} />
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Humidity</p>
              <p className="font-bold text-neutral-800">{weatherData.humidity}%</p>
            </div>
          </div>
          <div className="bg-white/70 col-span-2 rounded-2xl p-4 flex items-center shadow-sm">
            <Gauge className="text-indigo-500 mr-3" size={24} />
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pressure</p>
              <p className="font-bold text-neutral-800">{weatherData.pressure} hPa</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
