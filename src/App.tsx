import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getWeatherData, getForecastData, WeatherResponse, ForecastResponse } from './services/weatherApi';
import { useTemperature } from './hooks/useTemperature';
import { useLastUpdated } from './hooks/useLastUpdated';
import { AppBar, Toolbar, Typography, Button, Container, Card, CardContent, TextField, Grid } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';

interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  timestamp?: number;
  feelsLike?: number;
  pressure?: number;
  visibility?: number;
  sunrise?: number;
  sunset?: number;
  cloudiness?: number;
}

interface ForecastData {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

const weatherIcons = {
  humidity: '\ud83d\udca7',
  wind: '\ud83d\udca8',
  search: '\ud83d\udd0d',
  refresh: '\ud83d\udd04',
  thermometer: '\ud83c\udf21\ufe0f',
  sun: '\u2600\ufe0f',
  moon: '\ud83c\udf19',
  location: '\ud83d\udccd',
  pressure: '\ud83c\udf21\ufe0f',
  visibility: '\ud83d\udc41\ufe0f',
  sunrise: '\ud83c\udf05',
  sunset: '\ud83c\udf07',
  clouds: '\u2601\ufe0f',
  calendar: '\ud83d\udcc5',
  clock: '\ud83d\udd52',
  uv: '\u2600\ufe0f',
  precipitation: '\ud83c\udf27\ufe0f',
  compass: '\ud83e\udedd'
};

function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div>
      <p>{message}</p>
      {onRetry && (
        <Button onClick={onRetry}>
          {weatherIcons.refresh} Try Again
        </Button>
      )}
    </div>
  );
}

function WeatherDetail({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div>
      <span>{icon}</span>
      <span>{label}</span>
      <span dangerouslySetInnerHTML={{ __html: value.toString() }}></span>
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div>
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function SunriseSunsetCard({ sunrise, sunset }: { sunrise: number; sunset: number }) {
  return (
    <InfoCard title="Sunrise & Sunset" icon={weatherIcons.sun}>
      <div>
        <div>
          <span>{weatherIcons.sunrise}</span>
          <div>
            <span>Sunrise</span>
            <span>{formatTime(sunrise)}</span>
          </div>
        </div>
        <div>
          <span>{weatherIcons.sunset}</span>
          <div>
            <span>Sunset</span>
            <span>{formatTime(sunset)}</span>
          </div>
        </div>
      </div>
    </InfoCard>
  );
}

function AtmosphericCard({ pressure, visibility, cloudiness }: { pressure?: number; visibility?: number; cloudiness?: number }) {
  return (
    <InfoCard title="Atmospheric Conditions" icon={weatherIcons.clouds}>
      <div>
        {pressure && (
          <div>
            <span>{weatherIcons.pressure}</span>
            <span>Pressure</span>
            <span>{pressure} hPa</span>
          </div>
        )}
        {visibility && (
          <div>
            <span>{weatherIcons.visibility}</span>
            <span>Visibility</span>
            <span>{(visibility / 1000).toFixed(1)} km</span>
          </div>
        )}
        {cloudiness && (
          <div>
            <span>{weatherIcons.clouds}</span>
            <span>Cloudiness</span>
            <span>{cloudiness}%</span>
          </div>
        )}
      </div>
    </InfoCard>
  );
}

function CurrentTimeCard() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <InfoCard title="Local Time" icon={weatherIcons.clock}>
      <div>
        <div>{time.toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
        <div>{time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}</div>
      </div>
    </InfoCard>
  );
}

function WeatherCard({ data }: { data: WeatherData }) {
  const temperature = useTemperature();
  const lastUpdated = useLastUpdated(data.timestamp ?? null);

  return (
    <div>
      <div>
        <h2>{data.city}</h2>
        <p>{data.condition}</p>
        {lastUpdated && (
          <p>Updated {lastUpdated}</p>
        )}
      </div>

      <div>
        <span>{Math.round(temperature.convert(data.temperature))}{temperature.symbol}</span>
        <img
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
          alt={data.condition}
        />
      </div>

      <div>
        <WeatherDetail 
          icon={weatherIcons.thermometer} 
          label="Feels Like" 
          value={`&#x2103;${Math.round(temperature.convert(data.feelsLike || data.temperature))}`} 
        />
        <WeatherDetail 
          icon={weatherIcons.humidity} 
          label="Humidity" 
          value={`${data.humidity}%`} 
        />
        <WeatherDetail 
          icon={weatherIcons.wind} 
          label="Wind Speed" 
          value={`${Math.round(data.windSpeed)} km/h`} 
        />
        <WeatherDetail 
          icon={weatherIcons.compass} 
          label="Location" 
          value={data.city} 
        />
      </div>
    </div>
  );
}

function ForecastCard({ data }: { data: ForecastData }) {
  const temperature = useTemperature();

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      hour: 'numeric',
    }).format(date);
  };

  return (
    <div>
      <p>{formatTime(data.time)}</p>
      <div>
        <img
          src={`https://openweathermap.org/img/wn/${data.icon}.png`}
          alt={data.condition}
        />
      </div>
      <div>
        <span>&#x2103;{Math.round(temperature.convert(data.temperature))}</span>
        <p>{data.condition}</p>
      </div>
      <div>
        <span>{weatherIcons.humidity} {data.humidity}%</span>
        <span>{weatherIcons.wind} {Math.round(data.windSpeed)} km/h</span>
      </div>
    </div>
  );
}

function SearchBar({ onSearch }: { onSearch: (city: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField 
        fullWidth 
        label="Enter city name..." 
        variant="outlined" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        size="small"
      />
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        style={{ marginTop: '5px' }}
        type="submit"
        size="small"
      >
        {weatherIcons.search} Search
      </Button>
    </form>
  );
}

function App() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  const [darkMode, setDarkMode] = useState(() => {
    // Check user preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [searchCity, setSearchCity] = useState<string>('');
  const temperature = useTemperature();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const { 
    data: currentWeather, 
    error: currentError, 
    isLoading: isLoadingCurrent,
    refetch: refetchWeather
  } = useQuery({
    queryKey: ['weather', searchCity],
    queryFn: () => getWeatherData(searchCity),
    enabled: !!searchCity,
    select: (data: WeatherResponse) => ({
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0].description,
      icon: data.weather[0].icon,
      timestamp: Date.now(),
      feelsLike: data.main.feels_like,
      pressure: data.main.pressure,
      visibility: data.visibility,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      cloudiness: data.clouds.all
    }),
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('API rate limit')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const { 
    data: forecastData, 
    error: forecastError,
    refetch: refetchForecast
  } = useQuery({
    queryKey: ['forecast', searchCity],
    queryFn: () => getForecastData(searchCity),
    enabled: !!searchCity,
    select: (data: ForecastResponse) => {
      // Get next 24 hours of forecast data (in 3-hour increments)
      return data.list.slice(0, 8).map(item => ({
        time: item.dt_txt,
        temperature: item.main.temp,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        condition: item.weather[0].description,
        icon: item.weather[0].icon
      }));
    },
    staleTime: 60 * 1000
  });

  const handleSearch = (city: string) => {
    setSearchCity(city);
  };

  const handleRetry = () => {
    refetchWeather();
    refetchForecast();
  };

  return (
    <Container maxWidth="lg" className={darkMode ? 'dark-mode' : ''}>
      <AppBar position="static" className={darkMode ? 'dark-mode' : ''}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Weather App
          </Typography>
          <Button color="inherit" onClick={temperature.toggle}>
            &#x2103;{temperature.symbol}
          </Button>
          <Button color="inherit" onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2} style={{ marginTop: '10px' }}>
        <Grid item xs={12} md={4}>
          <SearchBar onSearch={handleSearch} />
        </Grid>
        <Grid item xs={12} md={8}>
          {(currentError || forecastError) && (
            <ErrorMessage 
              message={`Error fetching weather data. ${currentError instanceof Error ? currentError.message : forecastError instanceof Error ? forecastError.message : ''}`} 
              onRetry={handleRetry} 
            />
          )}

          {!currentError && isLoadingCurrent && <div>Loading...</div>}

          {!currentError && currentWeather && (
            <Card>
              <CardContent>
                <Typography variant="h5">{currentWeather.city}</Typography>
                <Typography variant="body2">{currentWeather.condition}</Typography>
                <div className="weather-icon" style={{ fontSize: '36px' }}>{weatherIcons.clouds}</div>
                <div className="info-cards-grid">
                  <WeatherCard data={currentWeather} />
                  {currentWeather.sunrise && currentWeather.sunset && (
                    <SunriseSunsetCard 
                      sunrise={currentWeather.sunrise} 
                      sunset={currentWeather.sunset} 
                    />
                  )}
                  <AtmosphericCard 
                    pressure={currentWeather.pressure}
                    visibility={currentWeather.visibility}
                    cloudiness={currentWeather.cloudiness}
                  />
                  <CurrentTimeCard />
                </div>
              </CardContent>
            </Card>
          )}
          {forecastData && forecastData.length > 0 && (
            <section>
              <Typography variant="h5">Forecast</Typography>
              <Slider {...sliderSettings}>
                {forecastData.map((forecast, index) => (
                  <ForecastCard key={index} data={forecast} />
                ))}
              </Slider>
            </section>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export default AppWrapper;
