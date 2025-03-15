import { useState, useCallback, useEffect } from 'react';

export interface TemperatureUnit {
  isCelsius: boolean;
  convert: (temp: number) => number;
  toggle: () => void;
  symbol: string;
}

const TEMP_UNIT_KEY = 'weather-app-temp-unit';

export function useTemperature(initialUnit = true): TemperatureUnit {
  const [isCelsius, setIsCelsius] = useState(() => {
    const saved = localStorage.getItem(TEMP_UNIT_KEY);
    return saved ? JSON.parse(saved) : initialUnit;
  });

  useEffect(() => {
    localStorage.setItem(TEMP_UNIT_KEY, JSON.stringify(isCelsius));
  }, [isCelsius]);

  const convert = useCallback((temp: number) => {
    return isCelsius ? temp : (temp * 9/5) + 32;
  }, [isCelsius]);

  const toggle = useCallback(() => {
    setIsCelsius((prev: boolean) => !prev);
  }, []);

  return {
    isCelsius,
    convert,
    toggle,
    symbol: isCelsius ? '°C' : '°F'
  };
}
