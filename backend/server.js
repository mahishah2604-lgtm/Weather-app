const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const weatherRoutes = require("./routes/weather");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Weather Forecast API is running"
  });
});

app.use("/api/weather", weatherRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Weather API server running on http://localhost:${PORT}`);
});
