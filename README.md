# Weather Forecast Web Application

A complete full-stack weather app with a separated frontend and backend. The frontend uses React, Tailwind CSS, Framer Motion, and Vite. The backend uses Node.js, Express, dotenv, CORS, and Axios to securely call the OpenWeatherMap API.

## Features

- Search current weather by city name
- Auto-detect weather from browser location
- Current temperature, feels like, condition, humidity, wind, UV index, pressure, and visibility
- Weather icon from OpenWeatherMap
- Current date and time
- 5-day forecast and hourly forecast slider
- Recent searches saved in localStorage
- Celsius and Fahrenheit toggle
- Premium Pinterest-inspired luxury glassmorphism UI
- Animated particles, soft cards, hover motion, and theme toggle
- Dynamic backgrounds for sunny, rainy, cloudy, snowy, and night weather

## Project Structure

```text
weather-app/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── weather.js
│   ├── controllers/
│   │   └── weatherController.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
└── README.md
```

## Setup

1. Create a free API key at [OpenWeatherMap](https://openweathermap.org/api).

2. Open `backend/.env` and replace the placeholder:

```env
OPENWEATHER_API_KEY=your_actual_api_key_here
```

3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Start the backend server:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:5001
```

5. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

6. Start the React frontend:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

## API Endpoint

### Search by city

```http
GET /api/weather?city=London
```

### Search by coordinates

```http
GET /api/weather?lat=51.5072&lon=-0.1276
```

## Example Response

```json
{
  "success": true,
  "data": {
    "current": {
      "city": "London",
      "country": "GB",
      "temperature": 21,
      "feelsLike": 20,
      "condition": "overcast clouds",
      "humidity": 75,
      "windSpeed": 5.2,
      "pressure": 1012,
      "visibility": 10000,
      "uvIndex": 5,
      "sunrise": "05:02",
      "sunset": "20:58"
    },
    "forecast": [],
    "hourly": []
  }
}
```

## Notes

- Keep `backend/.env` private. It is listed in `backend/.gitignore`.
- The frontend expects the backend at `http://localhost:5001/api`.
- If the API key is new, OpenWeatherMap can take a short time to activate it.
- The frontend includes polished demo data, so the interface remains visible even while an API key is inactive.
# Weather-app
