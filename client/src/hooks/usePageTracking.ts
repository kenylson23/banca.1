import { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Generate or retrieve session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

// Detect source from URL parameters or referrer
const detectSource = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check UTM parameters
  if (urlParams.has('utm_source')) {
    return urlParams.get('utm_source');
  }
  
  // Check custom source parameter
  if (urlParams.has('source')) {
    return urlParams.get('source');
  }
  
  // Detect from referrer
  const referrer = document.referrer;
  if (referrer) {
    if (referrer.includes('facebook.com')) return 'facebook';
    if (referrer.includes('instagram.com')) return 'instagram';
    if (referrer.includes('whatsapp') || referrer.includes('wa.me')) return 'whatsapp';
    if (referrer.includes('google.com')) return 'google';
    if (referrer.includes('t.me') || referrer.includes('telegram')) return 'telegram';
    return 'referral';
  }
  
  return 'direct';
};

export function usePageTracking(restaurantId: number | string | undefined) {
  useEffect(() => {
    if (!restaurantId) return;

    // Track page visit
    const trackVisit = async () => {
      try {
        const sessionId = getSessionId();
        const source = detectSource();
        
        await apiRequest('POST', '/api/analytics/link/track', {
          restaurantId: parseInt(String(restaurantId)),
          source,
          sessionId,
        });
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    };

    trackVisit();
  }, [restaurantId]);
}

// Hook to track conversion (when order is placed)
export function useConversionTracking() {
  const trackConversion = async (restaurantId: number | string) => {
    try {
      const sessionId = getSessionId();
      
      await apiRequest('POST', '/api/analytics/link/convert', {
        restaurantId: parseInt(String(restaurantId)),
        sessionId,
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  };

  return { trackConversion };
}
