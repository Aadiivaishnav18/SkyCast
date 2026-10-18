
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  LocateFixed,
  Activity,
  Sunrise,
  Sunset,
  Moon,
  CloudRain,
  AlertTriangle,
  Gauge,
  Eye,
} from "lucide-react";
import { getWeather } from "../services/weatherApi";
import { MORNING, SUNNY_DAY, NIGHT, RAIN } from "../utils/constant";

const rainCodes = [
  1063, 1069, 1072, 1087, 1150, 1153, 1168, 1171,
  1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201,
  1204, 1207, 1240, 1243, 1246, 1249, 1252, 1255,
  1258, 1261, 1264,
];

function chooseVideo(data) {
  if (!data?.current || !data?.location) return null;

  if (rainCodes.includes(data.current.condition?.code)) return RAIN;

  const hour = Number(
    data.location.localtime?.split(" ")[1]?.split(":")[0]
  );

  if (hour >= 19 || hour < 5) return NIGHT;
  if (hour >= 5 && hour < 9) return MORNING;
  return SUNNY_DAY;
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-slate-950/25 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-sky-400/15 p-2.5">
          <Icon className="h-5 w-5 text-sky-300" />
        </div>
        <div>
          <p className="text-sm text-white/70">{label}</p>
          <p className="font-semibold text-white">{value ?? "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3 last:border-0">
      <span className="flex items-center gap-2 text-sm text-white/70">
        {Icon && <Icon className="h-4 w-4 text-sky-300" />}
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-white">
        {value ?? "N/A"}
      </span>
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-white/20 bg-slate-950/25 p-5 shadow-lg backdrop-blur-md sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export default function Browse() {
  const locationState = useLocation();
  const initialCity = locationState.state?.searchCity || " ";

  const [query, setQuery] = useState(initialCity);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");

  const current = weather?.current;
  const location = weather?.location;
  const forecast = weather?.forecast?.forecastday ?? [];
  const astro = forecast[0]?.astro;
  const airQuality = current?.air_quality;
  const alerts = weather?.alerts?.alert ?? [];

  const video = chooseVideo(weather);

  useEffect(() => {
    if (initialCity) {
      setQuery(initialCity);
      loadWeather(initialCity);
    }
  }, []);

  async function loadWeather(city) {
    if (!city?.trim()) {
      setError("Please enter a location.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getWeather(city.trim());
      setWeather(data);
    } catch (err) {
      setError(err?.message || "Could not load weather data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    await loadWeather(query);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const coordinates = `${coords.latitude},${coords.longitude}`;

        try {
          const data = await getWeather(coordinates);
          setWeather(data);
          setQuery(data.location?.name || coordinates);
        } catch (err) {
          setError(err?.message || "Unable to load local weather.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Location permission denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const temperature = unit === "C" ? current?.temp_c : current?.temp_f;
  const feelsLike = unit === "C" ? current?.feelslike_c : current?.feelslike_f;
  const wind = unit === "C"
    ? `${current?.wind_kph ?? "N/A"} km/h`
    : `${current?.wind_mph ?? "N/A"} mph`;
  const pressure = unit === "C"
    ? `${current?.pressure_mb ?? "N/A"} mb`
    : `${current?.pressure_in ?? "N/A"} inHg`;
  const visibility = unit === "C"
    ? `${current?.vis_km ?? "N/A"} km`
    : `${current?.vis_miles ?? "N/A"} mi`;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      {video && (
        <video
          key={video}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>
      )}

      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-950/10" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 rounded-3xl border border-white/20 bg-slate-950/10 p-4 shadow-2xl backdrop-blur-[2px] sm:p-6 lg:p-8">
        <header className="py-3 text-center sm:py-5">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-sky-300">
            Your Personal Weather Guide
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            SkyCast Weather
          </h1>
          <p className="mt-3 text-white/75">
            Real-time weather, air quality and forecasts in one place.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border border-white/25 bg-slate-950/30 p-2 shadow-xl backdrop-blur-xl sm:flex-row"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
            <Search className="h-5 w-5 shrink-0 text-sky-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city..."
              aria-label="Search city"
              className="w-full bg-transparent py-3 text-white outline-none placeholder:text-white/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={useMyLocation}
              title="Use my location"
              aria-label="Use my location"
              className="rounded-xl border border-white/15 bg-white/10 px-4 text-sky-300 hover:bg-white/20"
            >
              <LocateFixed className="h-5 w-5" />
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-400 disabled:opacity-60 sm:flex-none"
            >
              <Search className="h-5 w-5" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="rounded-xl border border-red-300/30 bg-red-500/15 p-4 text-red-100">
            {error}
          </p>
        )}

        {loading && (
          <Panel>
            <p className="text-center text-white">Loading weather...</p>
          </Panel>
        )}

        {weather && current && location && (
          <>
            <Panel>
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="flex items-center gap-2 text-white/70">
                    <MapPin className="h-4 w-4 text-sky-300" />
                    {[location.region, location.country].filter(Boolean).join(", ")}
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">
                    {location.name}
                  </h2>
                  <p className="mt-3 text-sm text-white/70">
                    Local time: {location.localtime}
                  </p>
                  <p className="mt-3 text-white/75">
                    Feels like {feelsLike}°{unit}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="flex items-center gap-3">
                    {current.condition?.icon && (
                      <img
                        src={`https:${current.condition.icon}`}
                        alt={current.condition.text || "Weather"}
                        className="h-20 w-20"
                      />
                    )}
                    <div>
                      <p className="text-5xl font-extrabold sm:text-6xl">
                        {Math.round(temperature)}°{unit}
                      </p>
                      <p className="mt-2 text-white/75">
                        {current.condition?.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {["C", "F"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setUnit(value)}
                        aria-pressed={unit === value}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                          unit === value
                            ? "border-sky-400 bg-sky-500 text-white"
                            : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        °{value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <section>
              <h2 className="mb-4 text-2xl font-bold">Weather Details</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
                <Stat icon={Gauge} label="Pressure" value={pressure} />
                <Stat icon={Wind} label="Wind" value={wind} />
                <Stat icon={Eye} label="Visibility" value={visibility} />
              </div>
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <Activity className="h-6 w-6 text-sky-300" />
                Air Quality Index
              </h2>

              {airQuality ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat
                    icon={Activity}
                    label="US EPA Index"
                    value={
                      airQuality["us-epa-index"]
                        ? `${airQuality["us-epa-index"]} — ${
                            ["", "Good", "Moderate", "Sensitive groups", "Unhealthy", "Very unhealthy", "Hazardous"][airQuality["us-epa-index"]]
                          }`
                        : "N/A"
                    }
                  />
                  <Stat icon={Activity} label="PM2.5" value={airQuality.pm2_5} />
                  <Stat icon={Activity} label="PM10" value={airQuality.pm10} />
                  <Stat icon={Activity} label="Carbon Monoxide" value={airQuality.co} />
                </div>
              ) : (
                <Panel>Air quality data is unavailable for this location.</Panel>
              )}
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <CloudRain className="h-6 w-6 text-sky-300" />
                5-Day Forecast
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {forecast.map((day) => (
                  <Panel key={day.date} className="text-center transition hover:border-sky-300/50">
                    <p className="font-semibold">
                      {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                        undefined,
                        { weekday: "short", month: "short", day: "numeric" }
                      )}
                    </p>
                    {day.day.condition?.icon && (
                      <img
                        src={`https:${day.day.condition.icon}`}
                        alt={day.day.condition.text || "Forecast"}
                        className="mx-auto my-2 h-16 w-16"
                      />
                    )}
                    <p className="min-h-10 text-sm text-white/70">
                      {day.day.condition?.text}
                    </p>
                    <p className="mt-2 text-lg font-bold">
                      {Math.round(unit === "C" ? day.day.maxtemp_c : day.day.maxtemp_f)}°
                      {" / "}
                      {Math.round(unit === "C" ? day.day.mintemp_c : day.day.mintemp_f)}°
                    </p>
                    <p className="mt-2 text-sm text-sky-200">
                      Rain: {day.day.daily_chance_of_rain}%
                    </p>
                  </Panel>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold">Sun &amp; Moon</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Panel>
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                    <Sunrise className="h-5 w-5 text-amber-300" />
                    Sun
                  </h3>
                  <InfoRow label="Sunrise" value={astro?.sunrise} />
                  <InfoRow label="Sunset" value={astro?.sunset} icon={Sunset} />
                </Panel>

                <Panel>
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
                    <Moon className="h-5 w-5 text-indigo-200" />
                    Moon
                  </h3>
                  <InfoRow label="Moonrise" value={astro?.moonrise} />
                  <InfoRow label="Moonset" value={astro?.moonset} />
                  <InfoRow label="Moon phase" value={astro?.moon_phase} />
                  <InfoRow
                    label="Moon illumination"
                    value={astro?.moon_illumination != null ? `${astro.moon_illumination}%` : "N/A"}
                  />
                </Panel>
              </div>
            </section>

            <section>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                <AlertTriangle className="h-6 w-6 text-amber-300" />
                Extreme Weather Alerts
              </h2>

              {alerts.length ? (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <Panel key={`${alert.headline || alert.event || "alert"}-${index}`}>
                      <h3 className="font-bold">{alert.headline || alert.event || "Weather Alert"}</h3>
                      {alert.effective && (
                        <p className="mt-2 text-sm text-white/70">Effective: {alert.effective}</p>
                      )}
                      {alert.expires && (
                        <p className="text-sm text-white/70">Expires: {alert.expires}</p>
                      )}
                      {alert.desc && (
                        <p className="mt-3 whitespace-pre-line text-white/85">{alert.desc}</p>
                      )}
                    </Panel>
                  ))}
                </div>
              ) : (
                <Panel>No active weather alerts were returned for this location.</Panel>
              )}
            </section>

            <footer className="border-t border-white/20 pt-5 text-center text-sm text-white/60">
              Weather information for {location.name}, {location.country}.
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
