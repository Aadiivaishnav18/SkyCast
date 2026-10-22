
import { useState } from "react";
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
import Footer from "./Footer";

function getWeatherVideo(weather) {
  if (!weather?.current || !weather?.location) return null;

  const conditionCode = weather.current.condition?.code;

  const rainCodes = [
    1063, 1069, 1072, 1087, 1150, 1153, 1168, 1171,
    1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201,
    1204, 1207, 1240, 1243, 1246, 1249, 1252, 1255,
    1258, 1261, 1264,
  ];

  if (rainCodes.includes(conditionCode)) return RAIN;

  const hour = Number(
    weather.location.localtime?.split(" ")[1]?.split(":")[0]
  );

  if (hour >= 18 || hour < 5) return NIGHT;
  if (hour >= 5 && hour < 9) return MORNING;

  return SUNNY_DAY;
}

function WeatherStat({ icon: Icon, label, value, glass }) {
  return (
    <div className={`${glass} p-4 sm:p-5`}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/15 bg-sky-400/15 p-2.5">
          <Icon className="h-5 w-5 text-sky-300" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white/70">{label}</p>
          <p className="mt-1 break-words font-semibold text-white">{value}</p>
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

function AqiStat({ label, value, glass }) {
  return (
    <div className={`${glass} p-4`}>
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-white">
        {value ?? "N/A"}
      </p>
    </div>
  );
}

function getAqiDescription(index) {
  const labels = {
    1: "Good",
    2: "Moderate",
    3: "Unhealthy for sensitive groups",
    4: "Unhealthy",
    5: "Very unhealthy",
    6: "Hazardous",
  };

  return labels[index] || "Unavailable";
}

export default function Browse() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");

  const current = weather?.current;
  const location = weather?.location;
  const forecast = weather?.forecast?.forecastday ?? [];
  const airQuality = current?.air_quality;
  const alerts = weather?.alerts?.alert ?? [];
  const astro = forecast[0]?.astro;

  const backgroundVideo = getWeatherVideo(weather);
  const hasVideo = Boolean(backgroundVideo);
  const glass = hasVideo
    ? "rounded-2xl border border-white/20 bg-slate-950/25 shadow-lg backdrop-blur-md"
    : "rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-md";

  const heading = hasVideo ? "text-white" : "text-slate-900";
  const muted = hasVideo ? "text-white/70" : "text-slate-600";
  const inputGlass = hasVideo
    ? "border-white/25 bg-white/10 text-white placeholder:text-white/60"
    : "border-slate-200 bg-white/90 text-slate-900 placeholder:text-slate-400";

  const temperature =
    unit === "C" ? current?.temp_c : current?.temp_f;

  const feelsLike =
    unit === "C" ? current?.feelslike_c : current?.feelslike_f;

  const windSpeed =
    unit === "C"
      ? `${current?.wind_kph ?? "N/A"} km/h`
      : `${current?.wind_mph ?? "N/A"} mph`;

  const pressure =
    unit === "C"
      ? `${current?.pressure_mb ?? "N/A"} mb`
      : `${current?.pressure_in ?? "N/A"} inHg`;

  const visibility =
    unit === "C"
      ? `${current?.vis_km ?? "N/A"} km`
      : `${current?.vis_miles ?? "N/A"} mi`;

  async function searchWeather(event) {
    event?.preventDefault();

    const searchQuery = query.trim();

    if (!searchQuery) {
      setError("Please enter a city or location.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getWeather(searchQuery);
      setWeather(data);
    } catch (err) {
      setError(err?.message || "Unable to load weather. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getCurrentLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const locationQuery = `${coords.latitude},${coords.longitude}`;

        try {
          const data = await getWeather(locationQuery);
          setQuery(data.location?.name || locationQuery);
          setWeather(data);
        } catch (err) {
          setError(err?.message || "Could not load local weather.");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        setError(
          geoError.code === 1
            ? "Location permission denied. Allow location access and try again."
            : "Unable to determine your location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
<div className="relative min-h-screen">
{backgroundVideo && (
  <video
    key={backgroundVideo}
    autoPlay
    muted
    loop
    playsInline
    aria-hidden="true"
    className="pointer-events-none fixed left-0 top-0 -z-10 h-screen w-screen object-cover"
  >
    <source src={backgroundVideo} type="video/mp4" />
  </video>
)}

  <main
    className={`relative z-10 min-h-screen overflow-x-hidden px-4 py-6 ${
      hasVideo
        ? "bg-transparent text-white"
        : "bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-slate-900"
    }`}
  >

  
      {/* One translucent glass container for the complete dashboard */}
      <div
        className={`relative z-10 mx-auto max-w-7xl rounded-3xl border p-4 sm:p-6 lg:p-8 ${
          hasVideo
            ? "border-white/20 bg-slate-950/15 shadow-2xl backdrop-blur-[2px]"
            : "border-white/80 bg-white/45 shadow-xl backdrop-blur-xl"
        }`}
      >
        <div className="space-y-8">
          {/* Heading */}
          <section className="py-2 text-center sm:py-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
              Your personal weather guide
            </p>
            <h1 className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${heading}`}>
              SkyCast Weather
            </h1>
            <p className={`mx-auto mt-3 max-w-xl ${muted}`}>
              Real-time conditions, air quality and forecasts in one place.
            </p>
          </section>

          {/* Search */}
          <form
            onSubmit={searchWeather}
            className={`mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border p-2 shadow-lg backdrop-blur-xl sm:flex-row ${inputGlass}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
              <Search className="h-5 w-5 shrink-0 text-sky-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city or location..."
                aria-label="City or location"
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loading}
                title="Use my location"
                aria-label="Use my location"
                className="flex items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 text-sky-400 transition hover:bg-sky-400/20 disabled:opacity-50"
              >
                <LocateFixed className="h-5 w-5" />
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                <Search className="h-5 w-5" />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-300/40 bg-red-500/15 p-4 text-red-100 backdrop-blur-md"
            >
              {error}
            </div>
          )}

          {loading && (
            <div className={`${glass} p-6 text-center`}>
              <p className={heading}>Loading weather data...</p>
            </div>
          )}

          {!weather && !loading && !error && (
            <div className={`${glass} p-6 text-center`}>
              <p className={heading}>
                Search for a city to see its weather.
              </p>
            </div>
          )}

          {weather && current && location && (
            <>
              {/* Current conditions */}
              <section className={`${glass} p-5 sm:p-8`}>
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <p className={`flex items-center gap-2 ${muted}`}>
                      <MapPin className="h-4 w-4 text-sky-400" />
                      {[location.region, location.country].filter(Boolean).join(", ")}
                    </p>

                    <h2 className={`mt-3 text-3xl font-extrabold sm:text-5xl ${heading}`}>
                      {location.name}
                    </h2>

                    <p className={`mt-3 text-sm ${muted}`}>
                      Local time: {location.localtime}
                    </p>

                    <p className={`mt-3 ${muted}`}>
                      Feels like {feelsLike}°{unit}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 sm:items-end">
                    <div className="flex items-center gap-3 sm:gap-5">
                      {current.condition?.icon && (
                        <img
                          src={`https:${current.condition.icon}`}
                          alt={current.condition.text || "Weather"}
                          className="h-20 w-20 sm:h-24 sm:w-24"
                        />
                      )}

                      <div>
                        <p className={`text-5xl font-extrabold tracking-tight sm:text-6xl ${heading}`}>
                          {Math.round(temperature)}°{unit}
                        </p>
                        <p className={`mt-2 ${muted}`}>
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
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
              </section>

              {/* Weather details */}
              <section>
                <h2 className={`mb-4 text-2xl font-bold sm:text-3xl ${heading}`}>
                  Weather Details
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <WeatherStat
                    icon={Droplets}
                    label="Humidity"
                    value={`${current.humidity}%`}
                    glass={glass}
                  />
                  <WeatherStat
                    icon={Gauge}
                    label="Pressure"
                    value={pressure}
                    glass={glass}
                  />
                  <WeatherStat
                    icon={Wind}
                    label="Wind"
                    value={windSpeed}
                    glass={glass}
                  />
                  <WeatherStat
                    icon={Eye}
                    label="Visibility"
                    value={visibility}
                    glass={glass}
                  />
                </div>
              </section>

              {/* Air quality */}
              <section>
                <h2 className={`mb-4 flex items-center gap-2 text-2xl font-bold sm:text-3xl ${heading}`}>
                  <Activity className="h-6 w-6 text-sky-400" />
                  Air Quality Index
                </h2>

                {airQuality ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <AqiStat
                      label="US EPA Index"
                      value={
                        airQuality["us-epa-index"]
                          ? `${airQuality["us-epa-index"]} — ${getAqiDescription(
                              airQuality["us-epa-index"]
                            )}`
                          : "N/A"
                      }
                      glass={glass}
                    />
                    <AqiStat label="PM2.5" value={airQuality.pm2_5} glass={glass} />
                    <AqiStat label="PM10" value={airQuality.pm10} glass={glass} />
                    <AqiStat label="Carbon Monoxide" value={airQuality.co} glass={glass} />
                  </div>
                ) : (
                  <div className={`${glass} p-5`}>
                    <p className={muted}>Air quality data is unavailable.</p>
                  </div>
                )}
              </section>

              {/* Forecast */}
              <section>
                <h2 className={`mb-4 flex items-center gap-2 text-2xl font-bold sm:text-3xl ${heading}`}>
                  <CloudRain className="h-6 w-6 text-sky-400" />
                  5-Day Forecast
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {forecast.map((day) => {
                    const maxTemp =
                      unit === "C" ? day.day.maxtemp_c : day.day.maxtemp_f;
                    const minTemp =
                      unit === "C" ? day.day.mintemp_c : day.day.mintemp_f;

                    return (
                      <article
                        key={day.date}
                        className={`${glass} p-4 text-center transition duration-200 hover:-translate-y-1 hover:border-sky-300/50`}
                      >
                        <p className="font-semibold text-white">
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

                        <p className="mt-2 text-lg font-bold text-white">
                          {Math.round(maxTemp)}° / {Math.round(minTemp)}°
                        </p>

                        <p className="mt-2 text-sm text-sky-200">
                          Rain: {day.day.daily_chance_of_rain}%
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Sun and moon */}
              <section>
                <h2 className={`mb-4 text-2xl font-bold sm:text-3xl ${heading}`}>
                  Sun &amp; Moon
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className={`${glass} p-5`}>
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
                      <Sunrise className="h-5 w-5 text-amber-300" />
                      Sun
                    </h3>
                    <InfoRow label="Sunrise" value={astro?.sunrise} />
                    <InfoRow label="Sunset" value={astro?.sunset} icon={Sunset} />
                  </div>

                  <div className={`${glass} p-5`}>
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
                      <Moon className="h-5 w-5 text-indigo-200" />
                      Moon
                    </h3>
                    <InfoRow label="Moonrise" value={astro?.moonrise} />
                    <InfoRow label="Moonset" value={astro?.moonset} />
                    <InfoRow label="Moon phase" value={astro?.moon_phase} />
                    <InfoRow
                      label="Moon illumination"
                      value={
                        astro?.moon_illumination != null
                          ? `${astro.moon_illumination}%`
                          : "N/A"
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Extreme weather alerts */}
              <section>
                <h2 className={`mb-4 flex items-center gap-2 text-2xl font-bold sm:text-3xl ${heading}`}>
                  <AlertTriangle className="h-6 w-6 text-amber-300" />
                  Extreme Weather Alerts
                </h2>

                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <article
                        key={`${alert.headline || alert.event || "alert"}-${index}`}
                        className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-5 backdrop-blur-md"
                      >
                        <h3 className="font-bold text-white">
                          {alert.headline || alert.event || "Weather Alert"}
                        </h3>

                        {alert.effective && (
                          <p className="mt-2 text-sm text-white/70">
                            Effective: {alert.effective}
                          </p>
                        )}

                        {alert.expires && (
                          <p className="text-sm text-white/70">
                            Expires: {alert.expires}
                          </p>
                        )}

                        {alert.desc && (
                          <p className="mt-3 whitespace-pre-line text-white/90">
                            {alert.desc}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={`${glass} p-5`}>
                    <p className="text-white/80">
                      No active extreme weather alerts were returned for this location.
                    </p>
                  </div>
                )}
              </section>

              <footer>
               <Footer />
              </footer>
            </>
          )}
        </div>
      </div>
    </main>
    </div>
  );
}
