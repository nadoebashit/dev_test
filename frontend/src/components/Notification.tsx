"use client";
import { useWeatherStore } from '@/store/weatherStore';

export default function Notification() {
  const { notification, setNotification } = useWeatherStore();

  if (!notification) return null;

  const bgClass =
    notification.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border shadow-sm transition-all flex items-center gap-3 ${bgClass}`}>
      <span>{notification.message}</span>
      <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100 font-bold ml-4">
        ✕
      </button>
    </div>
  );
}
