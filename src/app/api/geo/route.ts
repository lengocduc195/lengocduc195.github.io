import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-static";

// Define interface for location data
interface LocationData {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionCode?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  organization?: string;
  connectionType?: string;
  proxy?: boolean;
  hosting?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    // Initialize location data
    const locationData: LocationData = {
      ip: ip
    };

    // Get timezone information from the server
    try {
      // Get timezone from server
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      locationData.timezone = timezone;

      // Try to extract country and city from timezone
      const timezoneParts = timezone.split('/');
      if (timezoneParts.length > 1) {
        // Convert something like "America/New_York" to "America"
        locationData.country = timezoneParts[0].replace('_', ' ');

        // If there's a city part, use it
        if (timezoneParts.length > 1) {
          locationData.city = timezoneParts[timezoneParts.length - 1].replace('_', ' ');
        }
      }
    } catch (timezoneError) {
      console.error('Error getting timezone information:', timezoneError);
    }

    // Try to get more detailed information using IP-API
    try {
      // Note: IP-API uses http, not https, which might be blocked in some browsers
      // We'll use a try-catch to handle this case
      const ipApiUrl = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`;

      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const ipApiResponse = await fetch(ipApiUrl, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (ipApiResponse.ok) {
          const ipApiData = await ipApiResponse.json();

          if (ipApiData.status === 'success') {
            // Enhance our location data with more details
            locationData.countryCode = ipApiData.countryCode;
            locationData.regionCode = ipApiData.region;
            locationData.region = ipApiData.regionName || locationData.region;
            locationData.city = ipApiData.city || locationData.city;
            locationData.district = ipApiData.district;
            locationData.postalCode = ipApiData.zip || locationData.postalCode;
            locationData.latitude = ipApiData.lat || locationData.latitude;
            locationData.longitude = ipApiData.lon || locationData.longitude;
            locationData.timezone = ipApiData.timezone || locationData.timezone;
            locationData.isp = ipApiData.isp;
            locationData.organization = ipApiData.org || locationData.organization;
            locationData.connectionType = ipApiData.mobile ? 'mobile' : 'fixed';
            locationData.proxy = ipApiData.proxy || false;
            locationData.hosting = ipApiData.hosting || false;
          }
        }
      } catch (fetchError) {
        console.error('Error during IP-API fetch:', fetchError);
        // Continue with the data we have
      }
    } catch (ipApiError) {
      console.error('Error fetching data from IP-API:', ipApiError);
    }

    // Ensure we have at least some basic location data
    if (!locationData.country) {
      locationData.country = 'Unknown';
    }

    if (!locationData.city) {
      locationData.city = 'Unknown';
    }

    // Return the location data
    return NextResponse.json({
      success: true,
      data: locationData,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in /api/geo:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve geolocation data',
      timestamp: Date.now()
    }, { status: 500 });
  }
}
