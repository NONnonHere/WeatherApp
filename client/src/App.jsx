import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  WiDaySunny, WiCloudy, WiRain, WiSnow, 
  WiThunderstorm, WiFog, WiDayHaze, WiNightClear 
} from 'react-icons/wi';
import { FaSearch } from 'react-icons/fa';

// Our cozy little weather app home
function WeatherApp() {
  // Keeping track of what the user wants to know
  const [cityName, setCityName] = useState(''); // What city are we looking up?
  const [weatherToday, setWeatherToday] = useState(null); // Today’s weather report
  const [isFetching, setIsFetching] = useState(false); // Are we asking the server?
  const [whoopsMessage, setWhoopsMessage] = useState(null); // Any hiccups to show?
  const [tempUnit, setTempUnit] = useState('celsius'); // Celsius or Fahrenheit?

  // Let’s go ask the server about the weather!
  const askForWeather = async () => {
    if (!cityName.trim()) return; // No city? No point in asking.

    setIsFetching(true); // Hang on, we’re checking...
    setWhoopsMessage(null); // Clear any old oopsies.

    try {
      const weatherReply = await axios.post('/api/weather', { city: cityName, unit: tempUnit });
      setWeatherToday(weatherReply.data); // Got it! Here’s the weather.
    } catch (oops) {
      // If something goes wrong, let’s be nice about it
      setWhoopsMessage(oops.response?.data?.message || 'Sorry, couldn’t grab the weather!');
      setWeatherToday(null);
    } finally {
      setIsFetching(false); // All done, whew!
    }
  };

  // When they hit Enter, let’s fetch the weather
  const handleEnterKey = (event) => {
    if (event.key === 'Enter') askForWeather();
  };

  // Flip between Celsius and Fahrenheit like a weather DJ
  const flipTemperatureUnit = () => {
    setTempUnit(current => (current === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  // Refresh weather if they switch units
  useEffect(() => {
    if (weatherToday) askForWeather(); // Redo it with the new unit
  }, [tempUnit]);

  // Pick a cute icon to match the sky
  const pickWeatherIcon = (skyCode) => {
    if (skyCode === undefined) return <WiDaySunny className="text-6xl text-yellow-400" />;

    // A little guide to the sky (WMO weather codes)
    if (skyCode === 0) return <WiDaySunny className="text-6xl text-yellow-400" />; // Sunshine!
    if (skyCode <= 2) return <WiCloudy className="text-6xl text-gray-300" />; // Some clouds
    if (skyCode === 3) return <WiCloudy className="text-6xl text-gray-400" />; // All cloudy
    if (skyCode === 45 || skyCode === 48) return <WiFog className="text-6xl text-gray-300" />; // Misty vibes
    if (skyCode >= 51 && skyCode <= 57) return <WiRain className="text-6xl text-blue-300" />; // Light rain
    if (skyCode >= 61 && skyCode <= 67) return <WiRain className="text-6xl text-blue-400" />; // Pouring
    if ((skyCode >= 71 && skyCode <= 77) || (skyCode >= 85 && skyCode <= 86)) 
      return <WiSnow className="text-6xl text-blue-200" />; // Snowflakes!
    if (skyCode >= 95 && skyCode <= 99) return <WiThunderstorm className="text-6xl text-purple-500" />; // Drama!

    return <WiDaySunny className="text-6xl text-yellow-400" />; // Default sunny day
  };

  // Describe the weather in plain words
  const describeWeather = (skyCode) => {
    if (skyCode === undefined) return "Not sure yet...";

    if (skyCode === 0) return "Bright and sunny!";
    if (skyCode === 1) return "Mostly clear skies";
    if (skyCode === 2) return "A few clouds hanging out";
    if (skyCode === 3) return "All gray and overcast";
    if (skyCode === 45 || skyCode === 48) return "Foggy and mysterious";
    if (skyCode >= 51 && skyCode <= 57) return "A light drizzle";
    if (skyCode >= 61 && skyCode <= 67) return "Rainy day";
    if (skyCode >= 71 && skyCode <= 77) return "Snowy wonderland";
    if (skyCode === 85 || skyCode === 86) return "Snow showers";
    if (skyCode >= 95 && skyCode <= 99) return "Thunder and lightning!";
    return "Something’s up there...";
  };

  // Here’s the fun part—showing it all off!
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Your Friendly Weather Buddy
        </h1>

        {/* Search bar—our window to the world */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              onKeyPress={handleEnterKey}
              placeholder="Tell me a city!"
              className="input input-bordered w-full pr-10"
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={askForWeather}
            >
              <FaSearch />
            </button>
          </div>
          <button
            className="btn btn-primary ml-2"
            onClick={askForWeather}
            disabled={isFetching || !cityName.trim()}
          >
            {isFetching ? <span className="loading loading-spinner"></span> : "Let’s Check!"}
          </button>
        </div>

        {/* Oops, something went wrong? */}
        {whoopsMessage && (
          <div className="alert alert-error mb-4">
            <span>{whoopsMessage}</span>
          </div>
        )}

        {/* Here’s the weather scoop! */}
        {weatherToday && (
          <div className="text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                {weatherToday.city}, {weatherToday.country}
              </h2>
              <label className="swap swap-rotate">
                <input
                  type="checkbox"
                  checked={tempUnit === 'fahrenheit'}
                  onChange={flipTemperatureUnit}
                />
                <div className="swap-on">°F</div>
                <div className="swap-off">°C</div>
              </label>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {pickWeatherIcon(weatherToday.weatherCode)}
                <span className="text-4xl ml-2">
                  {Math.round(weatherToday.temperature)}°{tempUnit === 'celsius' ? 'C' : 'F'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl capitalize">{describeWeather(weatherToday.weatherCode)}</p>
                <p className="text-sm">
                  Feels like: {Math.round(weatherToday.apparentTemperature)}°{tempUnit === 'celsius' ? 'C' : 'F'}
                </p>
              </div>
            </div>

            {/* Little weather tidbits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-20 rounded p-3">
                <p className="text-sm opacity-70">Humidity</p>
                <p className="text-xl">{weatherToday.humidity}%</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-3">
                <p className="text-sm opacity-70">Wind Speed</p>
                <p className="text-xl">
                  {weatherToday.windSpeed} {tempUnit === 'celsius' ? 'km/h' : 'mph'}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-3">
                <p className="text-sm opacity-70">Precipitation</p>
                <p className="text-xl">{weatherToday.precipitation} mm</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-3">
                <p className="text-sm opacity-70">Cloud Cover</p>
                <p className="text-xl">{weatherToday.cloudCover}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* A little thank-you note */}
      <footer className="mt-6 text-white text-opacity-60 text-sm">
        Powered by the awesome Open-Meteo API
      </footer>
    </div>
  );
}

export default WeatherApp;