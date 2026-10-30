import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation } from '../types/meeting';

export function countryCodeToFlag(isoCode?: string): string {
  if (!isoCode || isoCode.length !== 2) return '📍';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Fallback inference from timezone if network reverse-geocoding fails or is offline
function inferLocationFromTimezone(): { city: string; country: string; countryCode: string; flagEmoji: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) {
      return { city: 'Mumbai', country: 'India', countryCode: 'IN', flagEmoji: '🇮🇳' };
    }
    if (tz.includes('London')) {
      return { city: 'London', country: 'United Kingdom', countryCode: 'GB', flagEmoji: '🇬🇧' };
    }
    if (tz.includes('New_York')) {
      return { city: 'New York', country: 'United States', countryCode: 'US', flagEmoji: '🇺🇸' };
    }
    if (tz.includes('Los_Angeles') || tz.includes('San_Francisco')) {
      return { city: 'Los Angeles', country: 'United States', countryCode: 'US', flagEmoji: '🇺🇸' };
    }
    if (tz.includes('Tokyo')) {
      return { city: 'Tokyo', country: 'Japan', countryCode: 'JP', flagEmoji: '🇯🇵' };
    }
    if (tz.includes('Berlin') || tz.includes('Paris')) {
      return { city: 'Berlin', country: 'Germany', countryCode: 'DE', flagEmoji: '🇩🇪' };
    }
    if (tz.includes('Singapore')) {
      return { city: 'Singapore', country: 'Singapore', countryCode: 'SG', flagEmoji: '🇸🇬' };
    }
    if (tz.includes('Dubai')) {
      return { city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', flagEmoji: '🇦🇪' };
    }
    if (tz.includes('Sydney') || tz.includes('Melbourne')) {
      return { city: 'Sydney', country: 'Australia', countryCode: 'AU', flagEmoji: '🇦🇺' };
    }
    if (tz.includes('Toronto')) {
      return { city: 'Toronto', country: 'Canada', countryCode: 'CA', flagEmoji: '🇨🇦' };
    }
  } catch {
    // ignore
  }
  return { city: 'Mumbai', country: 'India', countryCode: 'IN', flagEmoji: '🇮🇳' };
}

const STORAGE_KEY = 'nainocall_user_location';
const SHARING_KEY = 'nainocall_share_location';

export function useUserLocation() {
  const [permissionState, setPermissionState] = useState<UserLocation['permissionState']>('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<UserLocation | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const sharing = localStorage.getItem(SHARING_KEY) !== 'false';
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          sharingEnabled: sharing,
        };
      }
    } catch {
      // fallback
    }
    return null;
  });

  const permissionStatusRef = useRef<PermissionStatus | null>(null);

  // Monitor permission state changes if supported by browser
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionState('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          permissionStatusRef.current = status;
          setPermissionState(status.state as UserLocation['permissionState']);

          status.onchange = () => {
            const nextState = status.state as UserLocation['permissionState'];
            setPermissionState(nextState);
            if (nextState === 'denied') {
              setError('Location permission was denied in your browser settings.');
            } else if (nextState === 'granted') {
              setError(null);
            }
          };
        })
        .catch(() => {
          // Fallback if permissions.query fails
          setPermissionState('prompt');
        });
    }
  }, []);

  // Request browser location permission & retrieve coordinates
  const requestLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!('geolocation' in navigator)) {
      const err = 'Geolocation is not supported by your browser.';
      setError(err);
      setPermissionState('unsupported');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          let city = '';
          let region = '';
          let country = '';
          let countryCode = '';
          let formattedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          // Attempt reverse geocoding via OpenStreetMap Nominatim
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                signal: controller.signal,
                headers: {
                  'Accept-Language': 'en',
                },
              }
            );
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const addr = data.address;
                city =
                  addr.city ||
                  addr.town ||
                  addr.village ||
                  addr.suburb ||
                  addr.county ||
                  addr.state_district ||
                  '';
                region = addr.state || addr.region || '';
                country = addr.country || '';
                countryCode = (addr.country_code || '').toUpperCase();
                if (city && country) {
                  formattedAddress = `${city}, ${country}`;
                } else if (data.display_name) {
                  formattedAddress = data.display_name.split(',').slice(0, 2).join(',').trim();
                }
              }
            }
          } catch {
            // Reverse geocode failed or was rate-limited; fallback to timezone inference
          }

          // If reverse geocoding didn't fill in city/country, use timezone heuristic
          if (!city || !country) {
            const inferred = inferLocationFromTimezone();
            city = city || inferred.city;
            country = country || inferred.country;
            countryCode = countryCode || inferred.countryCode;
            formattedAddress = `${city}, ${country}`;
          }

          const flagEmoji = countryCodeToFlag(countryCode);
          const sharingEnabled = localStorage.getItem(SHARING_KEY) !== 'false';

          const newLocation: UserLocation = {
            latitude,
            longitude,
            accuracy,
            city,
            region,
            country,
            countryCode,
            flagEmoji,
            formattedAddress,
            timestamp: Date.now(),
            permissionState: 'granted',
            sharingEnabled,
          };

          setLocation(newLocation);
          setPermissionState('granted');
          setIsLoading(false);
          setError(null);

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
          } catch {
            // ignore
          }

          resolve(newLocation);
        },
        (err) => {
          setIsLoading(false);
          let message = 'Unable to retrieve location.';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location permission denied. Please allow access in browser site settings.';
            setPermissionState('denied');
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Location information is temporarily unavailable.';
          } else if (err.code === err.TIMEOUT) {
            message = 'The request to obtain your location timed out.';
          }
          setError(message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  // Toggle whether participant wants their location shared with call peers
  const toggleSharing = useCallback((enabled: boolean) => {
    localStorage.setItem(SHARING_KEY, enabled ? 'true' : 'false');
    setLocation((prev) => {
      if (!prev) return null;
      const updated = { ...prev, sharingEnabled: enabled };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Manually override/select a city (e.g. from the Discover cities dropdown)
  const setManualCity = useCallback((cityName: string, countryName = 'India') => {
    const inferred = inferLocationFromTimezone();
    const isLondon = cityName.toLowerCase().includes('london');
    const country = isLondon ? 'United Kingdom' : countryName;
    const countryCode = isLondon ? 'GB' : 'IN';
    const flagEmoji = countryCodeToFlag(countryCode);

    const manualLocation: UserLocation = {
      city: cityName.split(',')[0].trim(),
      country,
      countryCode,
      flagEmoji,
      formattedAddress: cityName,
      timestamp: Date.now(),
      permissionState: 'granted',
      sharingEnabled: true,
    };

    setLocation(manualLocation);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(manualLocation));
    } catch {
      // ignore
    }
    return manualLocation;
  }, []);

  // Clear saved location data
  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation(null);
  }, []);

  return {
    location,
    permissionState,
    isLoading,
    error,
    requestLocation,
    toggleSharing,
    setManualCity,
    clearLocation,
  };
}
