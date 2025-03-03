// server/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Geocoding API to convert city name to coordinates
const getCoordinates = async (city) => {
  try {
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('City not found');
    }
    
    const location = response.data.results[0];
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.name,
      country: location.country
    };
  } catch (error) {
    console.error('Error in geocoding:', error);
    throw new Error('City not found or geocoding service unavailable');
  }
};

// API endpoint to fetch weather data
app.post('/api/weather', async (req, res) => {
  try {
    const { city, unit = 'celsius' } = req.body;
    
    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }
    
    // Get coordinates for the city
    const coordinates = await getCoordinates(city);
    
    // Temperature unit for API request
    const temperature_unit = unit === 'celsius' ? 'celsius' : 'fahrenheit';
    const windspeed_unit = unit === 'celsius' ? 'kmh' : 'mph';
    
    // Fetch weather data from Open-Meteo API
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m&temperature_unit=${temperature_unit}&windspeed_unit=${windspeed_unit}`
    );
    
    const current = weatherResponse.data.current;
    
    const weatherData = {
      city: coordinates.city,
      country: coordinates.country,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      cloudCover: current.cloud_cover,
      timestamp: new Date(current.time).toLocaleTimeString(),
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch weather data'
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});