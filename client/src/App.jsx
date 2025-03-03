import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  WiDaySunny, WiCloudy, WiRain, WiSnow, 
  WiThunderstorm, WiFog, WiDayHaze, WiNightClear,
  WiHumidity, WiStrongWind, WiRaindrops
} from 'react-icons/wi';
import { FaSearch, FaTemperatureHigh } from 'react-icons/fa';


function WeatherApp() {
  const [cityName, setCityName] = useState('');
  const [weatherToday, setWeatherToday] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [whoopsMessage, setWhoopsMessage] = useState(null);
  const [tempUnit, setTempUnit] = useState('celsius');
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem('recentSearches')) || []
  );


  const askForWeather = async (city = cityName) => {
    if (!city.trim()) return;

    setIsFetching(true);
    setWhoopsMessage(null);

    try {
      const weatherReply = await axios.post('/api/weather', { city, unit: tempUnit });
      setWeatherToday(weatherReply.data);

      
      if (!recentSearches.includes(city)) {
        const newSearches = [city, ...recentSearches.slice(0, 4)];
        setRecentSearches(newSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      }
    } catch (oops) {
      setWhoopsMessage(oops.response?.data?.message || "Oops, the weather's hiding!");
      setWeatherToday(null);
    } finally {
      setIsFetching(false);
    }
  };

 
  const handleEnterKey = (event) => {
    if (event.key === 'Enter') askForWeather();
  };

  const flipTemperatureUnit = () => {
    setTempUnit(current => (current === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  useEffect(() => {
    if (weatherToday) askForWeather(weatherToday.city);
  }, [tempUnit]);

  const pickWeatherIcon = (skyCode) => {
    if (skyCode === undefined) return <WiDaySunny className="text-6xl text-yellow-400" />;

    if (skyCode === 0) return <WiDaySunny className="text-6xl text-yellow-400" />;
    if (skyCode <= 2) return <WiCloudy className="text-6xl text-gray-300" />;
    if (skyCode === 3) return <WiCloudy className="text-6xl text-gray-400" />;
    if (skyCode === 45 || skyCode === 48) return <WiFog className="text-6xl text-gray-300" />;
    if (skyCode >= 51 && skyCode <= 57) return <WiRain className="text-6xl text-blue-300" />;
    if (skyCode >= 61 && skyCode <= 67) return <WiRain className="text-6xl text-blue-400" />;
    if ((skyCode >= 71 && skyCode <= 77) || (skyCode >= 85 && skyCode <= 86)) 
      return <WiSnow className="text-6xl text-blue-200" />;
    if (skyCode >= 95 && skyCode <= 99) return <WiThunderstorm className="text-6xl text-purple-500" />;
    
    return <WiDaySunny className="text-6xl text-yellow-400" />;
  };


  const describeWeather = (skyCode) => {
    if (skyCode === undefined) return "Waiting for the sky to speak...";

    if (skyCode === 0) return "Bright and sunny!";
    if (skyCode === 1) return "Mostly clear skies";
    if (skyCode === 2) return "A few clouds hanging out";
    if (skyCode === 3) return "All gray and overcast";
    if (skyCode === 45 || skyCode === 48) return "Foggy and mysterious";
    if (skyCode >= 51 && skyCode <= 57) return "A light drizzle";
    if (skyCode >= 61 && skyCode <= 67) return "Rainy day vibes";
    if (skyCode >= 71 && skyCode <= 77) return "Snowy wonderland";
    if (skyCode === 85 || skyCode === 86) return "Snow showers";
    if (skyCode >= 95 && skyCode <= 99) return "Thunder and lightning!";
    return "Something's brewing up there...";
  };

  const getWeatherAdvice = (skyCode, temp) => {
    if (skyCode === undefined) return "Let's see what's up first!";

    if (skyCode === 0 && temp > 25) return "Slap on some sunscreen!";
    if (skyCode === 0 && temp <= 25) return "Perfect for a picnic!";
    if (skyCode <= 2) return "Nice day to stretch your legs!";
    if (skyCode === 3) return "A cozy indoor day might be nice.";
    if (skyCode === 45 || skyCode === 48) return "Watch your step in the fog!";
    if (skyCode >= 51 && skyCode <= 57) return "A light jacket should do!";
    if (skyCode >= 61 && skyCode <= 67) return "Grab an umbrella, quick!";
    if ((skyCode >= 71 && skyCode <= 77) || (skyCode >= 85 && skyCode <= 86)) 
      return "Bundle up for the snow!";
    if (skyCode >= 95 && skyCode <= 99) return "Stay safe indoors!";
    return "Better check the sky before you go!";
  };

  return (
    
    <div className="flex items-center justify-center h-screen w-screen min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className=" flex flex-col items-center justify-center min-h-screen w-full max-w-md p-15 bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Weather Explorer
        </h1>

        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              onKeyPress={handleEnterKey}
              placeholder="Enter city name..."
              className="w-full px-4 py-2 bg-white bg-opacity-20 border-none rounded-lg text-white placeholder-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              onClick={() => askForWeather()}
            >
              <FaSearch />
            </button>
          </div>
          <button
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => askForWeather()}
            disabled={isFetching || !cityName.trim()}
          >
            {isFetching ? <span className="loading loading-spinner"></span> : "Search"}
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="mb-8 text-center">
            <p className="text-gray-300 text-sm mb-3">Recent searches:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {recentSearches.map((city, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    setCityName(city);
                    askForWeather(city);
                  }}
                  className="px-3 py-1 text-sm bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {!weatherToday && !whoopsMessage && !isFetching && (
          <div className="text-center py-12 text-white">
            <WiDaySunny className="text-7xl mx-auto text-yellow-400 opacity-70 mb-4" />
            <p className="text-xl mb-2">Search for a city to check the weather!</p>
            <p className="text-sm text-gray-300">Try "Tokyo", "Paris", or "New York"</p>
          </div>
        )}

        {whoopsMessage && (
          <div className="alert alert-error mb-6 bg-red-600 bg-opacity-70 text-white border-0 rounded-lg text-center">
            <span>{whoopsMessage}</span>
          </div>
        )}

        {weatherToday && (
          <div className="text-white animate-fadeIn text-center">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-2xl font-semibold group">
                {weatherToday.city}, {weatherToday.country}
                <span className="text-xs ml-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {weatherToday.coordinates.latitude.toFixed(2)}°, {weatherToday.coordinates.longitude.toFixed(2)}°
                </span>
              </h2>
              <label className="swap swap-rotate bg-white bg-opacity-20 p-2 rounded-full">
                <input
                  type="checkbox"
                  checked={tempUnit === 'fahrenheit'}
                  onChange={flipTemperatureUnit}
                />
                <div className="swap-on">°F</div>
                <div className="swap-off">°C</div>
              </label>
            </div>

            <p className="text-sm text-gray-300 mb-4">
              Updated at {weatherToday.timestamp}
            </p>

            <div className="bg-gradient-to-r from-blue-800 to-indigo-800 rounded-lg p-4 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {pickWeatherIcon(weatherToday.weatherCode)}
                  <span className="text-5xl ml-2 font-light">
                    {Math.round(weatherToday.temperature)}°
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-medium">{describeWeather(weatherToday.weatherCode)}</p>
                  <p className="text-sm text-gray-300">
                    Feels like: {Math.round(weatherToday.apparentTemperature)}°{tempUnit === 'celsius' ? 'C' : 'F'}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-white bg-opacity-10 p-3 rounded-md">
                <p className="text-sm">
                  {getWeatherAdvice(weatherToday.weatherCode, weatherToday.temperature)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center transition-all hover:bg-opacity-30 w-full">
                <WiHumidity className="text-3xl text-blue-300 mr-2" />
                <div>
                  <p className="text-xs text-gray-300">Humidity</p>
                  <p className="text-xl">{weatherToday.humidity}%</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center transition-all hover:bg-opacity-30 w-full">
                <WiStrongWind className="text-3xl text-blue-300 mr-2" />
                <div>
                  <p className="text-xs text-gray-300">Wind Speed</p>
                  <p className="text-xl">
                    {weatherToday.windSpeed} {tempUnit === 'celsius' ? 'km/h' : 'mph'}
                  </p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center transition-all hover:bg-opacity-30 w-full">
                <WiRaindrops className="text-3xl text-blue-300 mr-2" />
                <div>
                  <p className="text-xs text-gray-300">Precipitation</p>
                  <p className="text-xl">{weatherToday.precipitation} mm</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center transition-all hover:bg-opacity-30 w-full">
                <WiCloudy className="text-3xl text-blue-300 mr-2" />
                <div>
                  <p className="text-xs text-gray-300">Cloud Cover</p>
                  <p className="text-xl">{weatherToday.cloudCover}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  
  );
}

export default WeatherApp;