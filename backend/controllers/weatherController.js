const axios = require("axios");

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

const getWeather = async (req, res) => {
  const { city, lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === "your_openweathermap_api_key_here") {
    return res.status(500).json({
      success: false,
      message: "OpenWeatherMap API key is missing. Add it to backend/.env."
    });
  }

  if (!city && (!lat || !lon)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a city name or latitude and longitude."
    });
  }

  try {
    const locationParams = city ? { q: city } : { lat, lon };
    const [currentResponse, forecastResponse] = await Promise.all([
      axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          ...locationParams,
          appid: apiKey,
          units: "metric"
        }
      }),
      axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
        params: {
          ...locationParams,
          appid: apiKey,
          units: "metric"
        }
      })
    ]);

    const current = formatCurrentWeather(currentResponse.data);
    const forecast = formatFiveDayForecast(forecastResponse.data.list);
    const hourly = formatHourlyForecast(forecastResponse.data.list);

    return res.json({
      success: true,
      data: {
        current,
        forecast,
        hourly
      }
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "City not found. Please check the spelling and try again."
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid OpenWeatherMap API key."
      });
    }

    return res.status(502).json({
      success: false,
      message: "Weather service is unavailable. Please try again later."
    });
  }
};

function formatCurrentWeather(data) {
  const condition = data.weather?.[0] || {};

  return {
    city: data.name,
    country: data.sys?.country,
    temperature: data.main?.temp,
    feelsLike: data.main?.feels_like,
    condition: condition.description || "Unknown",
    mainCondition: condition.main || "Unknown",
    iconUrl: getIconUrl(condition.icon),
    humidity: data.main?.humidity,
    windSpeed: data.wind?.speed,
    pressure: data.main?.pressure,
    visibility: data.visibility,
    sunrise: formatTime(data.sys?.sunrise, data.timezone),
    sunset: formatTime(data.sys?.sunset, data.timezone),
    uvIndex: estimateUvIndex(condition.main, data.clouds?.all)
  };
}

function formatFiveDayForecast(list = []) {
  const dailyItems = list.filter((item) => item.dt_txt.includes("12:00:00"));
  const fallbackItems = list.filter((_, index) => index % 8 === 0);
  const selectedItems = dailyItems.length >= 5 ? dailyItems : fallbackItems;

  return selectedItems.slice(0, 5).map((item) => {
    const condition = item.weather?.[0] || {};

    return {
      date: item.dt_txt,
      temperature: item.main?.temp,
      condition: condition.description || "Unknown",
      iconUrl: getIconUrl(condition.icon),
      humidity: item.main?.humidity,
      windSpeed: item.wind?.speed
    };
  });
}

function formatHourlyForecast(list = []) {
  return list.slice(0, 8).map((item, index) => {
    const condition = item.weather?.[0] || {};

    return {
      time: index === 0 ? "Now" : formatHour(item.dt),
      temperature: item.main?.temp,
      condition: condition.description || "Unknown",
      iconUrl: getIconUrl(condition.icon),
      humidity: item.main?.humidity,
      windSpeed: item.wind?.speed
    };
  });
}

function getIconUrl(iconCode) {
  return iconCode
    ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    : "";
}

function formatTime(timestamp, timezoneOffset = 0) {
  if (!timestamp) return null;

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }).format(new Date((timestamp + timezoneOffset) * 1000));
}

function formatHour(timestamp) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp * 1000));
}

function estimateUvIndex(condition = "", cloudCoverage = 50) {
  const lower = condition.toLowerCase();

  if (lower.includes("rain") || lower.includes("thunder")) return 2;
  if (lower.includes("snow") || lower.includes("mist") || lower.includes("fog")) return 1;
  if (lower.includes("cloud")) return Math.max(2, Math.round(7 - cloudCoverage / 20));

  return 7;
}

module.exports = {
  getWeather
};
