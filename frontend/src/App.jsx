import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cloud,
  Compass,
  Droplets,
  Eye,
  Gauge,
  LocateFixed,
  Moon,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind
} from "lucide-react";

const API_BASE_URL = "http://localhost:5001/api";

const sampleWeather = {
  current: {
    city: "Mumbai",
    country: "IN",
    temperature: 29,
    feelsLike: 32,
    condition: "soft clouds",
    mainCondition: "Clouds",
    iconUrl: "https://openweathermap.org/img/wn/02d@2x.png",
    humidity: 72,
    windSpeed: 4.4,
    pressure: 1008,
    visibility: 9000,
    uvIndex: 6,
    sunrise: "06:02",
    sunset: "19:09"
  },
  forecast: [
    { date: "2026-05-23 12:00:00", temperature: 30, condition: "sunny intervals", iconUrl: "https://openweathermap.org/img/wn/01d@2x.png" },
    { date: "2026-05-24 12:00:00", temperature: 28, condition: "light rain", iconUrl: "https://openweathermap.org/img/wn/10d@2x.png" },
    { date: "2026-05-25 12:00:00", temperature: 29, condition: "cloudy", iconUrl: "https://openweathermap.org/img/wn/03d@2x.png" },
    { date: "2026-05-26 12:00:00", temperature: 27, condition: "showers", iconUrl: "https://openweathermap.org/img/wn/09d@2x.png" },
    { date: "2026-05-27 12:00:00", temperature: 31, condition: "clear sky", iconUrl: "https://openweathermap.org/img/wn/01d@2x.png" }
  ],
  hourly: [
    { time: "Now", temperature: 29, condition: "Clouds", iconUrl: "https://openweathermap.org/img/wn/02d@2x.png" },
    { time: "13:00", temperature: 30, condition: "Sun", iconUrl: "https://openweathermap.org/img/wn/01d@2x.png" },
    { time: "16:00", temperature: 29, condition: "Clouds", iconUrl: "https://openweathermap.org/img/wn/03d@2x.png" },
    { time: "19:00", temperature: 27, condition: "Rain", iconUrl: "https://openweathermap.org/img/wn/10d@2x.png" },
    { time: "22:00", temperature: 26, condition: "Clouds", iconUrl: "https://openweathermap.org/img/wn/04n@2x.png" }
  ]
};

const themeStyles = {
  sunny: "from-[#FFF7EC] via-[#F8D8BD] to-[#D58A64]",
  rainy: "from-[#EAEEF2] via-[#8EA0B1] to-[#435466]",
  cloudy: "from-[#F8F1E9] via-[#D8CEC4] to-[#A68B82]",
  snow: "from-[#FBFDFF] via-[#DDEDF7] to-[#9CBED0]",
  night: "from-[#211716] via-[#4A2C2A] to-[#5F1F34]"
};

function App() {
  const [weather, setWeather] = useState(sampleWeather);
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("C");
  const [mode, setMode] = useState("light");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Demo weather is visible until your API key is active.");
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem("maisonRecentSearches") || "[]"));

  const current = weather.current;
  const theme = useMemo(() => getTheme(current), [current]);
  const displayTemp = convertTemp(current.temperature, unit);
  const feelsLike = convertTemp(current.feelsLike, unit);

  useEffect(() => {
    localStorage.setItem("maisonRecentSearches", JSON.stringify(recent.slice(0, 5)));
  }, [recent]);

  async function fetchWeather(params, label) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/weather?${params}`);
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to fetch weather.");
      }

      setWeather(payload.data);
      setRecent((items) => [payload.data.current.city, ...items.filter((item) => item !== payload.data.current.city)].slice(0, 5));
    } catch (error) {
      setMessage(`${error.message} Showing polished demo data for now.`);
      if (label) setQuery(label);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const city = query.trim();

    if (!city) {
      setMessage("Type a city name to begin.");
      return;
    }

    fetchWeather(`city=${encodeURIComponent(city)}`, city);
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setMessage("Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWeather(`lat=${coords.latitude}&lon=${coords.longitude}`),
      () => setMessage("Location permission was denied.")
    );
  }

  return (
    <main className={`min-h-screen overflow-x-hidden bg-gradient-to-br ${mode === "dark" ? themeStyles.night : themeStyles[theme]} text-espresso transition-colors duration-700`}>
      <WeatherParticles theme={mode === "dark" ? "night" : theme} />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8">
        <Navbar mode={mode} setMode={setMode} unit={unit} setUnit={setUnit} />

        <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <HeroWeatherCard current={current} displayTemp={displayTemp} feelsLike={feelsLike} unit={unit} loading={loading} />

          <div className="grid min-w-0 gap-6">
            <SearchBar
              query={query}
              setQuery={setQuery}
              onSubmit={handleSubmit}
              onLocation={useLocation}
              loading={loading}
              recent={recent}
              onRecent={(city) => {
                setQuery(city);
                fetchWeather(`city=${encodeURIComponent(city)}`, city);
              }}
              message={message}
            />
            <WeatherHighlights current={current} unit={unit} feelsLike={feelsLike} />
          </div>
        </section>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <ForecastSlider forecast={weather.forecast} unit={unit} />
          <HourlyWeather hourly={weather.hourly || []} unit={unit} />
        </section>

        <section className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SunriseSunsetCard sunrise={current.sunrise} sunset={current.sunset} />
          <AirQualityCard humidity={current.humidity} pressure={current.pressure} uvIndex={current.uvIndex} />
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Navbar({ mode, setMode, unit, setUnit }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/45 bg-white/35 px-5 py-4 shadow-glass backdrop-blur-2xl"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-burgundy/70">Maison Weather</p>
        <h1 className="font-serif text-2xl font-bold text-espresso sm:text-3xl">Editorial forecast</h1>
      </div>
      <div className="flex items-center gap-3">
        <Toggle label="Unit" value={unit} values={["C", "F"]} onChange={setUnit} />
        <button
          type="button"
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          className="grid h-12 w-12 place-items-center rounded-full bg-espresso text-cream shadow-luxury transition hover:-translate-y-1"
          aria-label="Toggle luxury dark mode"
        >
          {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </motion.nav>
  );
}

function HeroWeatherCard({ current, displayTemp, feelsLike, unit, loading }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-h-[560px] min-w-0 overflow-hidden rounded-[36px] border border-white/50 bg-white/35 p-7 shadow-luxury backdrop-blur-2xl sm:p-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(235,200,213,0.75),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(246,199,167,0.5),transparent_34%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-burgundy/75">Current weather</p>
            <h2 className="max-w-[10ch] font-serif text-6xl font-bold leading-[0.94] text-espresso sm:text-7xl">
              {current.city}
            </h2>
            <p className="mt-4 text-lg font-semibold capitalize text-burgundy/80">{current.condition}</p>
          </div>
          <motion.img
            animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src={current.iconUrl}
            alt={current.condition}
            className="h-24 w-24 drop-shadow-2xl sm:h-32 sm:w-32"
          />
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${displayTemp}-${unit}-${loading}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className={loading ? "loading-shimmer rounded-3xl" : ""}
            >
              <p className="text-[7rem] font-black leading-none tracking-normal text-espresso sm:text-[10rem]">
                {Math.round(displayTemp)}<span className="align-super text-4xl">°{unit}</span>
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 grid gap-3 rounded-[28px] border border-white/45 bg-pearl/45 p-5 backdrop-blur-xl sm:grid-cols-3">
            <MiniStat icon={Thermometer} label="Feels like" value={`${Math.round(feelsLike)}°${unit}`} />
            <MiniStat icon={Compass} label="Country" value={current.country} />
            <MiniStat icon={Cloud} label="Updated" value={formatDate(new Date())} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SearchBar({ query, setQuery, onSubmit, onLocation, loading, recent, onRecent, message }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="min-w-0 rounded-[32px] border border-white/45 bg-pearl/55 p-5 shadow-glass backdrop-blur-2xl"
    >
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative min-w-0">
          <span className="sr-only">Search city</span>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-burgundy/55" size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Paris, Mumbai, London..."
            className="h-14 w-full rounded-full border border-white/60 bg-white/55 pl-14 pr-5 text-base font-semibold text-espresso outline-none transition placeholder:text-espresso/45 focus:border-blush focus:bg-white/75 focus:shadow-[0_0_0_5px_rgba(235,200,213,0.45)]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-14 rounded-full bg-espresso px-6 font-bold text-cream shadow-luxury transition hover:-translate-y-1 disabled:opacity-60"
        >
          {loading ? "..." : "Search"}
        </button>
        <button
          type="button"
          onClick={onLocation}
          className="grid h-14 w-14 place-items-center rounded-full bg-burgundy text-cream shadow-luxury transition hover:-translate-y-1"
          aria-label="Use current location"
        >
          <LocateFixed size={20} />
        </button>
      </form>

      {message && <p className="mt-4 rounded-2xl bg-blush/45 px-4 py-3 text-sm font-bold text-burgundy">{message}</p>}

      {recent.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {recent.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onRecent(city)}
              className="rounded-full border border-white/55 bg-white/45 px-4 py-2 text-sm font-bold text-espresso transition hover:-translate-y-1 hover:bg-white/75"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </motion.section>
  );
}

function WeatherHighlights({ current, unit, feelsLike }) {
  const items = [
    { icon: Droplets, label: "Humidity", value: `${current.humidity}%`, tint: "bg-blush/50" },
    { icon: Wind, label: "Wind", value: `${current.windSpeed} m/s`, tint: "bg-sage/30" },
    { icon: Gauge, label: "Pressure", value: `${current.pressure} hPa`, tint: "bg-peach/45" },
    { icon: Eye, label: "Visibility", value: `${(current.visibility / 1000).toFixed(1)} km`, tint: "bg-white/55" },
    { icon: Sun, label: "UV Index", value: current.uvIndex ?? "N/A", tint: "bg-[#F7D58D]/45" },
    { icon: Thermometer, label: "Feels Like", value: `${Math.round(feelsLike)}°${unit}`, tint: "bg-rose/20" }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {items.map((item) => (
        <HighlightCard key={item.label} {...item} />
      ))}
    </motion.section>
  );
}

function HighlightCard({ icon: Icon, label, value, tint }) {
  return (
    <motion.article whileHover={{ y: -6, scale: 1.02 }} className={`min-w-0 rounded-[24px] border border-white/45 ${tint} p-5 shadow-glass backdrop-blur-xl`}>
      <Icon className="mb-5 text-burgundy" size={22} />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-espresso/55">{label}</p>
      <strong className="mt-2 block text-2xl text-espresso">{value}</strong>
    </motion.article>
  );
}

function ForecastSlider({ forecast, unit }) {
  return (
    <Panel title="Five day outlook" kicker="Forecast">
      <div className="flex max-w-full gap-4 overflow-x-auto pb-3">
        {forecast.map((day) => (
          <motion.article
            key={day.date}
            whileHover={{ y: -8, scale: 1.03 }}
            className="w-[150px] flex-none rounded-[28px] border border-white/45 bg-white/45 p-5 text-center shadow-glass backdrop-blur-xl"
          >
            <p className="font-bold text-burgundy">{formatForecastDate(day.date)}</p>
            <img src={day.iconUrl} alt={day.condition} className="mx-auto my-3 h-20 w-20" />
            <strong className="text-3xl text-espresso">{Math.round(convertTemp(day.temperature, unit))}°</strong>
            <p className="mt-2 text-sm font-semibold capitalize text-espresso/60">{day.condition}</p>
          </motion.article>
        ))}
      </div>
    </Panel>
  );
}

function HourlyWeather({ hourly, unit }) {
  return (
    <Panel title="Hourly rhythm" kicker="Today">
      <div className="flex max-w-full gap-3 overflow-x-auto pb-3">
        {hourly.map((hour, index) => (
          <motion.article
            key={`${hour.time}-${index}`}
            whileHover={{ y: -6 }}
            className="w-[112px] flex-none rounded-[24px] border border-white/45 bg-pearl/50 p-4 text-center shadow-glass backdrop-blur-xl"
          >
            <p className="text-sm font-bold text-espresso/60">{hour.time}</p>
            <img src={hour.iconUrl} alt={hour.condition} className="mx-auto h-14 w-14" />
            <strong className="text-2xl text-espresso">{Math.round(convertTemp(hour.temperature, unit))}°</strong>
          </motion.article>
        ))}
      </div>
      <div className="mt-6 flex h-24 max-w-full items-end gap-2 overflow-hidden">
        {hourly.slice(0, 8).map((hour, index) => (
          <motion.div
            key={`${hour.time}-bar`}
            initial={{ height: 0 }}
            whileInView={{ height: `${Math.max(28, convertTemp(hour.temperature, unit) * 2)}px` }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
            className="flex-1 rounded-t-full bg-gradient-to-t from-burgundy to-blush"
          />
        ))}
      </div>
    </Panel>
  );
}

function SunriseSunsetCard({ sunrise, sunset }) {
  return (
    <Panel title="Golden hours" kicker="Light">
      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <MiniFeature icon={Sunrise} label="Sunrise" value={sunrise || "--"} />
        <MiniFeature icon={Sunset} label="Sunset" value={sunset || "--"} />
      </div>
    </Panel>
  );
}

function AirQualityCard({ humidity, pressure, uvIndex }) {
  return (
    <Panel title="Atmosphere" kicker="Comfort">
      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <MiniFeature icon={Droplets} label="Moisture" value={`${humidity}%`} />
        <MiniFeature icon={Gauge} label="Pressure" value={`${pressure} hPa`} />
        <MiniFeature icon={Sun} label="UV Index" value={uvIndex ?? "N/A"} />
      </div>
    </Panel>
  );
}

function Panel({ title, kicker, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="min-w-0 overflow-hidden rounded-[32px] border border-white/45 bg-white/35 p-6 shadow-glass backdrop-blur-2xl"
    >
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-burgundy/70">{kicker}</p>
      <h2 className="mb-5 mt-2 font-serif text-3xl font-bold text-espresso">{title}</h2>
      {children}
    </motion.section>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div>
      <Icon className="mb-2 text-burgundy" size={18} />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-espresso/50">{label}</p>
      <strong className="mt-1 block text-lg text-espresso">{value}</strong>
    </div>
  );
}

function MiniFeature({ icon: Icon, label, value }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="min-w-0 rounded-[24px] border border-white/45 bg-pearl/50 p-5 shadow-glass">
      <Icon className="mb-5 text-burgundy" size={26} />
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-espresso/50">{label}</p>
      <strong className="mt-2 block text-3xl text-espresso">{value}</strong>
    </motion.div>
  );
}

function Toggle({ value, values, onChange }) {
  return (
    <div className="flex rounded-full border border-white/55 bg-white/40 p-1">
      {values.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`h-10 min-w-10 rounded-full px-4 text-sm font-black transition ${value === item ? "bg-espresso text-cream" : "text-espresso/70"}`}
        >
          °{item}
        </button>
      ))}
    </div>
  );
}

function WeatherParticles({ theme }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {theme === "rainy" && Array.from({ length: 36 }).map((_, index) => <span key={index} className="rain-drop" style={{ left: `${(index * 7) % 100}%`, animationDelay: `${index * 0.09}s` }} />)}
      {theme === "snow" && Array.from({ length: 30 }).map((_, index) => <span key={index} className="snow-flake" style={{ left: `${(index * 11) % 100}%`, animationDelay: `${index * 0.18}s` }} />)}
      {(theme === "cloudy" || theme === "night") && <><span className="cloud-soft left-[8%] top-[18%]" /><span className="cloud-soft right-[10%] top-[30%]" /></>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="pb-6 text-center text-sm font-semibold text-espresso/55">
      Designed as a calm luxury weather dashboard.
    </footer>
  );
}

function getTheme(current) {
  const text = `${current.condition} ${current.mainCondition}`.toLowerCase();
  const hour = new Date().getHours();

  if (hour >= 19 || hour <= 5) return "night";
  if (text.includes("rain") || text.includes("drizzle") || text.includes("thunder")) return "rainy";
  if (text.includes("snow")) return "snow";
  if (text.includes("cloud") || text.includes("mist") || text.includes("fog")) return "cloudy";
  return "sunny";
}

function convertTemp(value, unit) {
  return unit === "F" ? (value * 9) / 5 + 32 : value;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatForecastDate(dateText) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(dateText));
}

export default App;
