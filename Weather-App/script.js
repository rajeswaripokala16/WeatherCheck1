// Weather App JavaScript

// Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key
const API_KEY = '1aafa0979ba6c5fc7f15ec94067c6dc7';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContainer = document.getElementById('weatherContainer');
const loading = document.getElementById('loading');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

// Weather data elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const uvIndex = document.getElementById('uvIndex');

// Temperature unit buttons
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');

// Global variables
let currentWeatherData = null;
let isCelsius = true;

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

retryBtn.addEventListener('click', handleSearch);

celsiusBtn.addEventListener('click', () => {
    if (!isCelsius && currentWeatherData) {
        isCelsius = true;
        updateTemperatureDisplay();
        updateTempButtons();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (isCelsius && currentWeatherData) {
        isCelsius = false;
        updateTemperatureDisplay();
        updateTempButtons();
    }
});

// Functions
async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

   /* if (API_KEY === '1aafa0979ba6c5fc7f15ec94067c6dc7') {
        showError('Please add your OpenWeatherMap API key to the script.js file');
        return;
    } */

    await getWeatherData(city);
}

async function getWeatherData(city) {
    showLoading();
    
    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            } else {
                throw new Error('Failed to fetch weather data. Please try again later.');
            }
        }
        
        const data = await response.json();
        currentWeatherData = data;
        displayWeatherData(data);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message);
    }
}

function displayWeatherData(data) {
    // Update city name and date
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update weather icon and description
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    weatherDescription.textContent = data.weather[0].description;

    // Update temperature
    updateTemperatureDisplay();

    // Update weather details
    feelsLike.textContent = isCelsius ? 
        `${Math.round(data.main.feels_like)}°C` : 
        `${Math.round(celsiusToFahrenheit(data.main.feels_like))}°F`;
    
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A';
    
    // UV Index is not available in current weather API, so we'll show N/A
    uvIndex.textContent = 'N/A';

    showWeatherCard();
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;
    
    const tempValue = isCelsius ? 
        Math.round(currentWeatherData.main.temp) : 
        Math.round(celsiusToFahrenheit(currentWeatherData.main.temp));
    
    temp.textContent = `${tempValue}°`;
    
    // Update feels like temperature
    const feelsLikeValue = isCelsius ? 
        Math.round(currentWeatherData.main.feels_like) : 
        Math.round(celsiusToFahrenheit(currentWeatherData.main.feels_like));
    
    feelsLike.textContent = `${feelsLikeValue}°${isCelsius ? 'C' : 'F'}`;
}

function updateTempButtons() {
    celsiusBtn.classList.toggle('active', isCelsius);
    fahrenheitBtn.classList.toggle('active', !isCelsius);
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function showLoading() {
    hideAllStates();
    loading.style.display = 'block';
}

function showWeatherCard() {
    hideAllStates();
    weatherCard.style.display = 'block';
}

function showError(message) {
    hideAllStates();
    document.getElementById('errorText').textContent = message;
    errorMessage.style.display = 'block';
}

function hideAllStates() {
    loading.style.display = 'none';
    weatherCard.style.display = 'none';
    errorMessage.style.display = 'none';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set current date on page load
    currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Focus on input field
    cityInput.focus();
    
    // Load default city (optional)
    // You can uncomment the line below to load a default city on page load
    // cityInput.value = 'London';
    // handleSearch();
});

// Additional utility functions
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// Function to get weather by current location (optional feature)
async function getWeatherByLocation() {
    try {
        showLoading();
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data for your location.');
        }
        
        const data = await response.json();
        currentWeatherData = data;
        displayWeatherData(data);
        cityInput.value = data.name;
        
    } catch (error) {
        console.error('Error getting location weather:', error);
        showError(error.message);
    }
}

// You can add a button to get current location weather if needed
// Example: <button onclick="getWeatherByLocation()">Use My Location</button>