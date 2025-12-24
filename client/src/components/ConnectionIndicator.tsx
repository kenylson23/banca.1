/**
 * Connection Indicator - Shows online/offline status
 * 
 * Simple online/offline indicator (IndexedDB/offline mode removed)
 */

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show when offline
  if (isOnline) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-red-100 text-red-700">
      <WifiOff className="h-3 w-3" />
      <span className="text-xs">Offline</span>
    </div>
  );
}
