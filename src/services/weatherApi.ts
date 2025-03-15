import axios from 'axios';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// Rate limiting configuration
const CALLS_PER_MINUTE = 60;
const FORECAST_CALLS_PER_MINUTE = 5;

// Cache configuration
const CACHE_DURATION = 60 * 1000; // 1 minute

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

export interface WeatherResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  clouds: {
    all: number;
  };
}

export interface ForecastResponse {
  list: Array<{
    dt: number;
    dt_txt: string;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
  }>;
  city: {
    name: string;
  };
}

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (isCacheValid(cached)) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

export const getWeatherData = async (city: string): Promise<WeatherResponse> => {
  if (!city) {
    throw new Error('Please enter a city name');
  }

  const cacheKey = `weather:${city}`;

  try {
    const response = await fetchWithCache(cacheKey, () =>
      axios.get(`${BASE_URL}/weather`, {
        params: {
          q: encodeURIComponent(city),
          appid: API_KEY,
          units: 'metric'
        }
      })
    );
    
    if (!response.data) {
      throw new Error('No data received from weather service');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key');
      } else if (error.response?.status === 404) {
        throw new Error('City not found. Please try another location.');
      } else if (error.response?.status === 429) {
        throw new Error(`API rate limit exceeded. Please wait a moment and try again. (${CALLS_PER_MINUTE} calls per minute allowed)`);
      }
    }
    throw new Error('Failed to fetch weather data. Please try again.');
  }
};

export const getForecastData = async (city: string): Promise<ForecastResponse> => {
  if (!city) {
    throw new Error('Please enter a city name');
  }

  const cacheKey = `forecast:${city}`;

  try {
    const response = await fetchWithCache(cacheKey, () =>
      axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: encodeURIComponent(city),
          appid: API_KEY,
          units: 'metric'
        }
      })
    );
    
    if (!response.data) {
      throw new Error('No forecast data received');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key');
      } else if (error.response?.status === 404) {
        throw new Error('City not found. Please try another location.');
      } else if (error.response?.status === 429) {
        throw new Error(`API rate limit exceeded. Please wait a moment and try again. (${FORECAST_CALLS_PER_MINUTE} forecasts per minute allowed)`);
      }
    }
    throw new Error('Failed to fetch forecast data. Please try again.');
  }
};
