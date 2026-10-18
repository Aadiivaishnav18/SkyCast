
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function getWeather(query) {
  if (!API_KEY) {
    throw new Error("Weather API key missing.");
  }

  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    days: "5",
    aqi: "yes",
    alerts: "yes",
  });

  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?${params}`
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Unable to fetch weather.");
  }

  return data;
}
