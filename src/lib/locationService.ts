// Interface for location data
export interface LocationData {
  // Geographic coordinates
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;

  // Administrative divisions
  country?: string;
  countryCode?: string;
  region?: string;
  regionCode?: string;
  city?: string;
  district?: string;  // Quận/huyện
  ward?: string;      // Phường/xã
  street?: string;    // Đường
  streetNumber?: string; // Số nhà
  postalCode?: string; // Mã bưu chính
  formattedAddress?: string; // Địa chỉ đầy đủ

  // Time information
  timezone?: string;
  timezoneOffset?: number;
  localTime?: string;

  // Network information
  ip?: string;
  isp?: string;       // Nhà cung cấp dịch vụ internet
  connectionType?: string; // Loại kết nối (mobile, wifi, etc.)
  asn?: string;       // Autonomous System Number
  organization?: string; // Tổ chức sở hữu IP
  proxy?: boolean;    // Whether the user is using a proxy
  hosting?: boolean;  // Whether the IP belongs to a hosting provider

  // Device information
  deviceType?: string; // desktop, mobile, tablet, etc.
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;

  // Additional metadata
  lastUpdated?: number; // Timestamp of when this data was collected
}

// Get user's geolocation from browser API with enhanced data collection
export const getUserGeolocation = (): Promise<{
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      resolve({});
      return;
    }

    // Request with high accuracy for more precise location data
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        });
      },
      (error) => {
        console.log('Error getting geolocation:', error.message);
        resolve({});
      },
      {
        timeout: 15000,
        enableHighAccuracy: true,
        maximumAge: 0 // Always get fresh position data
      }
    );
  });
};

// Get location data from IP address using multiple services for enhanced accuracy
export const getLocationFromIP = async (): Promise<LocationData> => {
  // Initialize with default values
  let location: LocationData = {
    country: 'Unknown',
    city: 'Unknown',
    lastUpdated: Date.now(),
  };

  try {
    // Try using our own API endpoint first (which has better error handling)
    try {
      const apiResponse = await fetch('/api/geo');

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();

        if (apiData.success && apiData.data) {
          // Use the data from our API
          return {
            ...apiData.data,
            lastUpdated: Date.now()
          };
        }
      }
    } catch (apiError) {
      console.error('Error fetching location from our API:', apiError);
      // Continue with browser-based fallbacks
    }

    // Get timezone information from browser
    try {
      location.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Try to extract country and city from timezone
      const timezoneParts = location.timezone.split('/');
      if (timezoneParts.length > 1) {
        // Convert something like "America/New_York" to "America"
        location.country = timezoneParts[0].replace('_', ' ');

        // If there's a city part, use it
        if (timezoneParts.length > 1) {
          location.city = timezoneParts[timezoneParts.length - 1].replace('_', ' ');
        }
      }
    } catch (timezoneError) {
      console.error('Error getting timezone information:', timezoneError);
    }

    // Calculate timezone offset
    try {
      const date = new Date();
      const timeZoneOffset = -date.getTimezoneOffset() / 60;
      location.timezoneOffset = timeZoneOffset;
    } catch (tzError) {
      console.error('Error calculating timezone offset:', tzError);
    }

    // Get device and browser information
    try {
      const userAgent = navigator.userAgent;
      const browserInfo = detectBrowser(userAgent);

      location.browser = browserInfo.browser;
      location.browserVersion = browserInfo.version;
      location.os = browserInfo.os;
      location.osVersion = browserInfo.osVersion;
      location.deviceType = detectDeviceType(userAgent);
    } catch (deviceError) {
      console.error('Error detecting device information:', deviceError);
    }

    return location;
  } catch (error) {
    console.error('Error fetching location from IP:', error);

    // Return minimal location data based on browser information
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneParts = timezone.split('/');

      return {
        country: timezoneParts.length > 1 ? timezoneParts[0].replace('_', ' ') : 'Unknown',
        city: timezoneParts.length > 1 ? timezoneParts[timezoneParts.length - 1].replace('_', ' ') : 'Unknown',
        timezone: timezone,
        lastUpdated: Date.now()
      };
    } catch (fallbackError) {
      console.error('Error creating fallback location data:', fallbackError);
      return {
        country: 'Unknown',
        city: 'Unknown',
        lastUpdated: Date.now()
      };
    }
  }
};

// Helper function to detect browser and OS information
const detectBrowser = (userAgent: string): { browser: string; version: string; os: string; osVersion: string } => {
  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';
  let osVersion = 'Unknown';

  try {
    // Detect browser and version
    if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      browser = 'Opera';
      version = userAgent.match(/(?:Opera|OPR)[\s/]([\d.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Edg') > -1) {
      browser = 'Edge';
      version = userAgent.match(/Edg\/([\d.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = userAgent.match(/Version\/([\d.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
      browser = 'Internet Explorer';
      version = userAgent.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || '';
    }

    // Detect OS and version
    if (userAgent.indexOf('Windows') > -1) {
      os = 'Windows';
      if (userAgent.indexOf('Windows NT 10.0') > -1) osVersion = '10';
      else if (userAgent.indexOf('Windows NT 6.3') > -1) osVersion = '8.1';
      else if (userAgent.indexOf('Windows NT 6.2') > -1) osVersion = '8';
      else if (userAgent.indexOf('Windows NT 6.1') > -1) osVersion = '7';
      else if (userAgent.indexOf('Windows NT 6.0') > -1) osVersion = 'Vista';
      else if (userAgent.indexOf('Windows NT 5.1') > -1) osVersion = 'XP';
      else if (userAgent.indexOf('Windows NT 5.0') > -1) osVersion = '2000';
    } else if (userAgent.indexOf('Mac') > -1) {
      os = 'macOS';
      osVersion = userAgent.match(/Mac OS X (\d+[._]\d+[._\d]*)/)?.[1]?.replace(/_/g, '.') || '';
    } else if (userAgent.indexOf('Android') > -1) {
      os = 'Android';
      osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || '';
    } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
      os = 'iOS';
      osVersion = userAgent.match(/OS (\d+[._]\d+[._\d]*)/)?.[1]?.replace(/_/g, '.') || '';
    } else if (userAgent.indexOf('Linux') > -1) {
      os = 'Linux';
    }
  } catch (error) {
    console.error('Error detecting browser information:', error);
  }

  return { browser, version, os, osVersion };
};

// Helper function to detect device type
const detectDeviceType = (userAgent: string): string => {
  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  return 'desktop';
};

// Get comprehensive detailed location information from multiple sources
export const getDetailedLocation = async (): Promise<LocationData> => {
  // Initialize with timestamp
  let locationData: LocationData = {
    lastUpdated: Date.now(),
  };

  // Try to get browser-specific information first
  try {
    // Get browser and device information
    const userAgent = navigator.userAgent;
    const browserInfo = detectBrowser(userAgent);

    locationData.browser = browserInfo.browser;
    locationData.browserVersion = browserInfo.version;
    locationData.os = browserInfo.os;
    locationData.osVersion = browserInfo.osVersion;
    locationData.deviceType = detectDeviceType(userAgent);

    // Get language and timezone information
    locationData.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    locationData.timezoneOffset = -date.getTimezoneOffset() / 60;
    locationData.localTime = getLocalTimeInfo();
  } catch (browserError) {
    console.error('Error getting browser information:', browserError);
  }

  // Try browser geolocation first (requires user permission)
  try {
    const geoData = await getUserGeolocation();

    if (geoData.latitude && geoData.longitude) {
      // Add geolocation data
      locationData = {
        ...locationData,
        ...geoData,
      };

      // If we have coordinates, try to get more details using multiple geocoding services
      try {
        // First try OpenStreetMap/Nominatim for detailed address information
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoData.latitude}&lon=${geoData.longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'YourWebsite/1.0',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Extract all available address components
          const address = data.address;

          locationData = {
            ...locationData,
            country: address.country,
            countryCode: address.country_code?.toUpperCase(),
            region: address.state || address.county || address.province,
            city: address.city || address.town || address.village || address.municipality,
            district: address.district || address.suburb || address.county,
            ward: address.suburb || address.neighbourhood || address.quarter,
            street: address.road || address.street || address.footway,
            streetNumber: address.house_number,
            postalCode: address.postcode,
            formattedAddress: data.display_name,
          };

          // Create a more detailed formatted address for Vietnam if possible
          if (address.country_code === 'vn' && address.road) {
            let detailedAddress = address.road;

            if (address.house_number) {
              detailedAddress = `${address.house_number} ${detailedAddress}`;
            }

            const components = [];

            if (address.suburb || address.neighbourhood || address.quarter) {
              components.push(address.suburb || address.neighbourhood || address.quarter);
            }

            if (address.district || address.county) {
              components.push(address.district || address.county);
            }

            if (address.city || address.town || address.village) {
              components.push(address.city || address.town || address.village);
            }

            if (address.state || address.province) {
              components.push(address.state || address.province);
            }

            if (components.length > 0) {
              detailedAddress = `${detailedAddress}, ${components.join(', ')}`;
            }

            locationData.formattedAddress = detailedAddress;
          }
        }
      } catch (geocodeError) {
        console.error('Error with reverse geocoding:', geocodeError);
      }

      // Try Google Maps Geocoding API if available (requires API key)
      try {
        const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (googleApiKey) {
          const googleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${geoData.latitude},${geoData.longitude}&key=${googleApiKey}`
          );

          if (googleResponse.ok) {
            const googleData = await googleResponse.json();

            if (googleData.status === 'OK' && googleData.results && googleData.results.length > 0) {
              const result = googleData.results[0];

              // Use Google's formatted address if we don't have one yet
              if (!locationData.formattedAddress) {
                locationData.formattedAddress = result.formatted_address;
              }

              // Extract address components
              for (const component of result.address_components) {
                const types = component.types;

                if (types.includes('street_number')) {
                  locationData.streetNumber = component.long_name;
                } else if (types.includes('route')) {
                  locationData.street = component.long_name;
                } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                  locationData.ward = component.long_name;
                } else if (types.includes('administrative_area_level_2')) {
                  locationData.district = component.long_name;
                } else if (types.includes('locality')) {
                  locationData.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  locationData.region = component.long_name;
                  locationData.regionCode = component.short_name;
                } else if (types.includes('country')) {
                  locationData.country = component.long_name;
                  locationData.countryCode = component.short_name;
                } else if (types.includes('postal_code')) {
                  locationData.postalCode = component.long_name;
                }
              }
            }
          }
        }
      } catch (googleError) {
        console.error('Error with Google geocoding:', googleError);
      }
    }
  } catch (geoError) {
    console.error('Error getting browser geolocation:', geoError);
  }

  // If we couldn't get precise location or some details are missing, fall back to IP-based location
  if (!locationData.latitude || !locationData.longitude || !locationData.country) {
    try {
      const ipLocation = await getLocationFromIP();

      // Merge the data, preferring the more precise geolocation data when available
      // but keeping all the browser/device info we collected earlier
      const mergedLocation: LocationData = {
        ...ipLocation,
      };

      // Copy over the geolocation data if it exists
      if (locationData.latitude && locationData.longitude) {
        mergedLocation.latitude = locationData.latitude;
        mergedLocation.longitude = locationData.longitude;
        mergedLocation.accuracy = locationData.accuracy;
        mergedLocation.altitude = locationData.altitude;
        mergedLocation.altitudeAccuracy = locationData.altitudeAccuracy;
        mergedLocation.heading = locationData.heading;
        mergedLocation.speed = locationData.speed;
      }

      // Copy over the address data if it exists
      if (locationData.formattedAddress) {
        mergedLocation.formattedAddress = locationData.formattedAddress;
        mergedLocation.street = locationData.street || mergedLocation.street;
        mergedLocation.streetNumber = locationData.streetNumber || mergedLocation.streetNumber;
        mergedLocation.ward = locationData.ward || mergedLocation.ward;
        mergedLocation.district = locationData.district || mergedLocation.district;
        mergedLocation.city = locationData.city || mergedLocation.city;
        mergedLocation.region = locationData.region || mergedLocation.region;
        mergedLocation.regionCode = locationData.regionCode || mergedLocation.regionCode;
        mergedLocation.country = locationData.country || mergedLocation.country;
        mergedLocation.countryCode = locationData.countryCode || mergedLocation.countryCode;
        mergedLocation.postalCode = locationData.postalCode || mergedLocation.postalCode;
      }

      // Always keep browser/device info
      mergedLocation.browser = locationData.browser;
      mergedLocation.browserVersion = locationData.browserVersion;
      mergedLocation.os = locationData.os;
      mergedLocation.osVersion = locationData.osVersion;
      mergedLocation.deviceType = locationData.deviceType;

      // Keep time information
      mergedLocation.timezone = locationData.timezone || mergedLocation.timezone;
      mergedLocation.timezoneOffset = locationData.timezoneOffset || mergedLocation.timezoneOffset;
      mergedLocation.localTime = locationData.localTime;

      // Update timestamp
      mergedLocation.lastUpdated = Date.now();

      locationData = mergedLocation;
    } catch (ipError) {
      console.error('Error getting IP-based location:', ipError);
    }
  }

  // Try to get network connection information if available
  try {
    // @ts-ignore - Navigator NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      locationData.connectionType = connection.effectiveType || connection.type;
    }
  } catch (connectionError) {
    console.error('Error getting connection information:', connectionError);
  }

  return locationData;
};

// Get detailed local time information
export interface TimeInfo {
  iso8601: string;       // ISO 8601 format
  formatted: string;     // Human-readable format
  timestamp: number;     // Unix timestamp in milliseconds
  date: {
    year: number;
    month: number;       // 1-12
    day: number;
    weekday: string;     // Monday, Tuesday, etc.
  };
  time: {
    hour: number;        // 0-23
    minute: number;
    second: number;
    millisecond: number;
  };
  timezone: {
    name: string;        // e.g., "Asia/Ho_Chi_Minh"
    offset: number;      // e.g., 7 for UTC+7
    offsetString: string; // e.g., "UTC+7"
  };
}

// Get comprehensive local time information
export const getDetailedTimeInfo = (): TimeInfo => {
  const now = new Date();

  // Get timezone information
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = -now.getTimezoneOffset() / 60;
  const offsetSign = timezoneOffset >= 0 ? '+' : '-';
  const offsetString = `UTC${offsetSign}${Math.abs(timezoneOffset)}`;

  // Format date components
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-based
  const day = now.getDate();

  // Get weekday
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[now.getDay()];

  // Format time components
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const millisecond = now.getMilliseconds();

  // Create ISO 8601 string
  const iso8601 = now.toISOString();

  // Create formatted string (YYYY-MM-DD HH:MM:SS (UTC+X))
  const pad = (num: number) => num.toString().padStart(2, '0');
  const formatted = `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)} (${offsetString})`;

  return {
    iso8601,
    formatted,
    timestamp: now.getTime(),
    date: {
      year,
      month,
      day,
      weekday,
    },
    time: {
      hour,
      minute,
      second,
      millisecond,
    },
    timezone: {
      name: timezoneName,
      offset: timezoneOffset,
      offsetString,
    },
  };
};

// Get local time formatted string (for backward compatibility)
export const getLocalTimeInfo = (): string => {
  return getDetailedTimeInfo().formatted;
};
