function clearLocation() {
    localStorage.removeItem("location");
    getCoordinates();
}
function displayCity(city, state) {
    const cityHeading = document.getElementById("city");
    const location = JSON.parse(localStorage.getItem("location"));
    const zip = location.zip ? ` (${location.zip})` : '';
    cityHeading.textContent = `Location: ${city}, ${state}${zip}`;
    document.title = `Forecast for ${city}, ${state}`;
}
function darkTheme() {
    document.getElementById('body').style.color = '#E4E4E7';
    document.getElementById('body').style.backgroundColor = '#18181B';
    const dayPeriods = document.getElementsByClassName('period-day');
    const nightPeriods = document.getElementsByClassName('period-night');

    for (i = 0; i < dayPeriods.length; i++) {
        dayPeriods[i].style.backgroundColor = 'rgba(39, 39, 42, 0.7)';
    }

    for (i = 0; i < nightPeriods.length; i++) {
        nightPeriods[i].style.backgroundColor = 'rgba(24, 24, 27, 0.8)';
    }
}
function lightTheme() {
    document.getElementById('body').style.color = '#18181B';
    document.getElementById('body').style.backgroundColor = '#F4F4F5';
    const dayPeriods = document.getElementsByClassName('period-day');
    const nightPeriods = document.getElementsByClassName('period-night');

    for (i = 0; i < dayPeriods.length; i++) {
        dayPeriods[i].style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    }

    for (i = 0; i < nightPeriods.length; i++) {
        nightPeriods[i].style.backgroundColor = 'rgba(243, 244, 246, 0.8)';
    }
}
function setTheme(isDaytime) {
    // Load user preference
    const prefersDark = localStorage.getItem('darkMode') === 'true';
    const body = document.getElementById('body');

    if (prefersDark) {
        body.classList.add('dark-mode');
        document.getElementById('theme-toggle').textContent = "☀️ Light Mode";
    }
}
function getCoordinates() {
    let location = localStorage.getItem("location");

    if (location !== null) {
        startWeatherRefresh(location);
        return;
    }

    const prompt = window.prompt("Please enter your ZIP code:");

    if (!prompt || !/^\d{5}$/.test(prompt)) {
        alert("Please enter a valid 5-digit ZIP code.");
        return;
    }

    // Convert ZIP to coordinates using Nominatim
    fetch(`https://nominatim.openstreetmap.org/search?postalcode=${prompt}&country=USA&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("Could not find location for this ZIP code.");
                return;
            }

            const latitude = data[0].lat;
            const longitude = data[0].lon;

            localStorage.setItem("location", JSON.stringify({
                lat: latitude,
                lon: longitude,
                zip: prompt
            }));

            startWeatherRefresh(localStorage.getItem("location"));
        })
        .catch(err => {
            console.error('Error fetching coordinates:', err);
            alert("Error finding location. Please try again.");
        });
}
async function getDetailedWeatherInfo(location) {
    console.log('Getting detailed weather info for:', location);
    const coords = JSON.parse(location);

    try {
        // Get the grid points first
        const pointResponse = await fetch(`https://api.weather.gov/points/${coords.lat.trim()},${coords.lon.trim()}`);
        const pointData = await pointResponse.json();

        // Get hourly forecast for detailed current conditions
        const hourlyUrl = pointData.properties.forecastHourly;
        const hourlyResponse = await fetch(hourlyUrl);
        const hourlyData = await hourlyResponse.json();

        // Get the station observations for additional data
        const observationStations = await fetch(pointData.properties.observationStations);
        const stationsData = await observationStations.json();
        const nearestStation = stationsData.features[0];
        const latestObsUrl = nearestStation.id + '/observations/latest';
        const obsResponse = await fetch(latestObsUrl);
        const obsData = await obsResponse.json();

        const result = {
            currentConditions: {
                temp: hourlyData.properties.periods[0].temperature,
                humidity: obsData.properties.relativeHumidity.value,
                windSpeed: obsData.properties.windSpeed.value,
                windDirection: obsData.properties.windDirection.value,
                barometricPressure: obsData.properties.barometricPressure.value,
                dewpoint: obsData.properties.dewpoint.value,
                windChill: obsData.properties.windChill.value,
                heatIndex: obsData.properties.heatIndex.value
            },
            hourlyForecast: hourlyData.properties.periods.slice(0, 24),
            timestamp: new Date().toISOString()
        };

        console.log('Processed detailed weather data:', result);
        return result;
    } catch (error) {
        console.error('Error retrieving detailed weather:', error);
        return null;
    }
}
function getCardinalDirection(angle) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 22.5) % 16;
    return directions[index];
}
function displayDetailedWeather(weatherData) {
    const discussionDiv = document.querySelector('.detail-view #forecast-discussion');
    if (!discussionDiv) return;

    if (!weatherData) {
        discussionDiv.innerHTML = '<div class="discussion-content"><h3>Detailed Weather</h3><p>No detailed data available</p></div>';
        return;
    }

    const current = weatherData.currentConditions;

    // Find min and max temperatures
    const temperatures = weatherData.hourlyForecast.map(hour => hour.temperature);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);

    discussionDiv.innerHTML = `
        <div class="discussion-content">
            <div class="current-conditions">
                <h3>Current Conditions</h3>
                <p class="timestamp">Updated: ${new Date(weatherData.timestamp).toLocaleString()}</p>
                <div class="condition-row">
                    <span>Temperature:</span> ${current.temp}°F
                </div>
                ${current.windChill !== null ? `
                <div class="condition-row">
                    <span>Wind Chill:</span> ${Math.round(current.windChill * 9 / 5 + 32)}°F
                </div>
                ` : ''}
                ${current.heatIndex !== null ? `
                <div class="condition-row">
                    <span>Heat Index:</span> ${Math.round(current.heatIndex * 9 / 5 + 32)}°F
                </div>
                ` : ''}
                <div class="condition-row">
                    <span>Humidity:</span> ${Math.round(current.humidity)}%
                </div>
                <div class="condition-row">
                    <span>Wind:</span> ${Math.round(current.windSpeed)} mph from ${getCardinalDirection(current.windDirection)} (${Math.round(current.windDirection)}°)
                </div>
                <div class="condition-row">
                    <span>Pressure:</span> ${Math.round(current.barometricPressure / 100)} mb
                </div>
                <div class="condition-row">
                    <span>Dewpoint:</span> ${Math.round(current.dewpoint)}°F
                </div>
            </div>

            <div class="hourly-section">
                <div class="header-row">
                    <h4>24 Hour Forecast</h4>
                    <p class="timestamp">weather.gov</p>
                </div>
                <div class="hourly-forecast">
                    ${weatherData.hourlyForecast.map(hour => `
                        <div class="hour-forecast ${hour.temperature === minTemp ? 'coldest' : ''
        } ${hour.temperature === maxTemp ? 'hottest' : ''
        }">
                            <div class="time">${new Date(hour.startTime).toLocaleTimeString([], { hour: 'numeric' })}</div>
                            <div class="temp">${hour.temperature}°F</div>
                            <div class="short">${hour.shortForecast}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    const detailButton = document.querySelector('.view-detail');
    detailButton.addEventListener('click', async () => {
        dayRow.classList.add('slide-left');
        nightRow.classList.add('slide-left');
        detailView.classList.add('slide-in');
        backButton.style.display = 'block';
        detailButton.style.display = 'none';

        // Get fresh data when opening detail view
        const location = localStorage.getItem('location');
        if (location) {
            const [detailedData, airQualityData] = await Promise.all([
                getDetailedWeatherInfo(location),
                getAirQuality(location)
            ]);

            if (detailedData) {
                if (airQualityData) {
                    detailedData.airQuality = airQualityData;
                }
                displayDetailedWeather(detailedData);
            }
        }
    });

    // Check if data is stale (older than 1 hour)
    const timestampAge = Date.now() - new Date(weatherData.timestamp).getTime();
    if (timestampAge > 3600000) { // 1 hour in milliseconds
        const location = localStorage.getItem('location');
        if (location) {
            Promise.all([
                getDetailedWeatherInfo(location),
                getAirQuality(location)
            ]).then(([detailedData, airQualityData]) => {
                if (detailedData) {
                    if (airQualityData) {
                        detailedData.airQuality = airQualityData;
                    }
                    localStorage.setItem('detailedWeather', JSON.stringify(detailedData));
                    displayDetailedWeather(detailedData);
                    console.log('Detailed weather data refreshed', detailedData);
                }
            });
        }
    }
}
function getWeather(location) {
    // Try to get cached weather first
    const cachedWeather = localStorage.getItem('cachedWeather');
    const cachedTimestamp = localStorage.getItem('weatherTimestamp');
    const now = Date.now();

    // If we have cached data less than 1 minute old, use it
    if (cachedWeather && cachedTimestamp && (now - parseInt(cachedTimestamp) < 60000)) {
        console.log('Using cached weather data');
        const weatherData = JSON.parse(cachedWeather);

        // Initialize UI with cached data
        displayCity(weatherData.city, weatherData.state);
        tellWeather(weatherData.forecast);
        if (weatherData.airQuality) {
            displayAirQuality(weatherData.airQuality);
        }
        if (weatherData.alerts) {
            displayAlerts(weatherData.alerts);
        }

        // Ensure ticker is running
        if (!document.getElementById('ticker').textContent) {
            tellTime();
        }

        return;
    }

    // Otherwise fetch fresh data
    const coords = JSON.parse(location);
    const request = new Request('https://api.weather.gov/points/' + coords.lat.trim() + "," + coords.lon.trim());

    Promise.all([
        fetch(request),
        getDetailedWeatherInfo(location),
        getAirQuality(location),
        getWeatherAlerts(location)
    ])
        .then(([weatherResponse, detailedData, airQualityData, alerts]) => {
            weatherResponse.json().then(data => {
                const forecastURL = data.properties.forecast;
                const city = data.properties.relativeLocation.properties.city;
                const state = data.properties.relativeLocation.properties.state;

                fetch(forecastURL)
                    .then(result => result.json())
                    .then((weather) => {
                        // Cache the weather data
                        const cacheData = {
                            forecast: weather,
                            city: city,
                            state: state,
                            airQuality: airQualityData,
                            alerts: alerts,
                            detailed: detailedData,
                            timestamp: now
                        };
                        localStorage.setItem('cachedWeather', JSON.stringify(cacheData));
                        localStorage.setItem('weatherTimestamp', now.toString());

                        // Display the weather
                        displayCity(city, state);
                        tellWeather(weather);
                        displayAirQuality(airQualityData);
                        displayAlerts(alerts);
                        if (detailedData) {
                            displayDetailedWeather(detailedData);
                        }
                    });
            });
        });
}
function tellWeather(weather) {
    const weatherDisplay = document.getElementById('weather');
    const oneWeekForecast = weather.properties.periods;
    const isDaytime = oneWeekForecast[0].isDaytime;
    const currentTemp = oneWeekForecast[0].temperature;

    weatherDisplay.innerHTML = '';

    updateBackground(currentTemp, isDaytime);

    // Create container for sliding animation
    const forecastContainer = document.createElement('div');
    forecastContainer.className = 'forecast-container';

    const dayRow = document.createElement('div');
    const nightRow = document.createElement('div');
    const navigationControls = document.createElement('div');
    dayRow.className = 'forecast-row';
    nightRow.className = 'forecast-row';
    navigationControls.className = 'navigation-controls';

    // Add navigation buttons with both forward and back controls
    navigationControls.innerHTML = `
        <button class="nav-button back-to-forecast" style="display: none;">← Back to Forecast</button>
        <button class="nav-button view-detail">View Details ➜</button>
    `;

    // Create the detail view with proper ID for detailed weather
    const detailView = document.createElement('div');
    detailView.className = 'detail-view';
    detailView.innerHTML = `
        <div id="forecast-discussion"></div>
    `;

    // Process periods in pairs
    for (i = 0; i < oneWeekForecast.length - 4; i += 2) {
        // Create day period
        const dayDiv = document.createElement('div');
        dayDiv.className = 'period';  // Use single period class for theme styling

        const dayName = oneWeekForecast[i].name;
        const dayDetails = oneWeekForecast[i].detailedForecast;
        const dayBrief = oneWeekForecast[i].shortForecast;
        const dayTemp = oneWeekForecast[i].temperature;

        dayDiv.innerHTML = `
            <h2>${dayName}</h2>
            <h4>${dayTemp} And ${dayBrief}</h4>
            <p>${dayDetails}</p>
        `;

        dayRow.appendChild(dayDiv);

        // Create night period
        if (i + 1 < oneWeekForecast.length) {
            const nightDiv = document.createElement('div');
            nightDiv.className = 'period';  // Use single period class for theme styling

            const nightName = oneWeekForecast[i + 1].name;
            const nightDetails = oneWeekForecast[i + 1].detailedForecast;
            const nightBrief = oneWeekForecast[i + 1].shortForecast;
            const nightTemp = oneWeekForecast[i + 1].temperature;

            nightDiv.innerHTML = `
                <h2>${nightName}</h4>
                <h4>${nightTemp} And ${nightBrief}</h4>
                <p>${nightDetails}</p>
            `;

            nightRow.appendChild(nightDiv);
        }
    }

    forecastContainer.appendChild(dayRow);
    forecastContainer.appendChild(nightRow);
    forecastContainer.appendChild(detailView);
    weatherDisplay.appendChild(forecastContainer);
    weatherDisplay.appendChild(navigationControls);

    // Add current conditions badge
    const currentPeriod = oneWeekForecast[0];
    const briefDisplay = document.getElementById('brief-display');

    const tempBadgeDiv = document.createElement('div');
    tempBadgeDiv.className = 'current-temp-badge';
    tempBadgeDiv.innerHTML = `
        <span class="temp-value">${currentPeriod.temperature}°F</span>
        <span class="temp-desc">${currentPeriod.shortForecast}</span>
    `;
    setTemperatureColor(tempBadgeDiv, currentPeriod.temperature);
    briefDisplay.innerHTML = ''; // Clear any existing content
    briefDisplay.appendChild(tempBadgeDiv);
    // Add event listeners
    const backButton = navigationControls.querySelector('.back-to-forecast');
    const detailButton = navigationControls.querySelector('.view-detail');

    detailButton.addEventListener('click', async () => {
        dayRow.classList.add('slide-left');
        nightRow.classList.add('slide-left');
        detailView.classList.add('slide-in');
        backButton.style.display = 'block';
        detailButton.style.display = 'none';

        // Get fresh data when opening detail view
        const location = localStorage.getItem('location');
        if (location) {
            const [detailedData, airQualityData] = await Promise.all([
                getDetailedWeatherInfo(location),
                getAirQuality(location)
            ]);

            if (detailedData) {
                if (airQualityData) {
                    detailedData.airQuality = airQualityData;
                }
                displayDetailedWeather(detailedData);
            }
        }
    });

    backButton.addEventListener('click', () => {
        dayRow.classList.remove('slide-left');
        nightRow.classList.remove('slide-left');
        detailView.classList.remove('slide-in');
        backButton.style.display = 'none';
        detailButton.style.display = 'block';
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            // Show detail view if we're on forecast
            if (!detailView.classList.contains('slide-in')) {
                dayRow.classList.add('slide-left');
                nightRow.classList.add('slide-left');
                detailView.classList.add('slide-in');
                backButton.style.display = 'block';
                detailButton.style.display = 'none';

                // Get fresh data
                const location = localStorage.getItem('location');
                if (location) {
                    Promise.all([
                        getDetailedWeatherInfo(location),
                        getAirQuality(location)
                    ]).then(([detailedData, airQualityData]) => {
                        if (detailedData) {
                            if (airQualityData) {
                                detailedData.airQuality = airQualityData;
                            }
                            displayDetailedWeather(detailedData);
                        }
                    });
                }
            }
        } else if (e.key === 'ArrowLeft') {
            // Go back to forecast if we're on detail view
            if (detailView.classList.contains('slide-in')) {
                dayRow.classList.remove('slide-left');
                nightRow.classList.remove('slide-left');
                detailView.classList.remove('slide-in');
                backButton.style.display = 'none';
                detailButton.style.display = 'block';
            }
        }
    });

    setTheme(isDaytime);
}
function startWeatherRefresh(location) {
    // Initial fetch
    getWeather(location);
    checkAlerts(location);

    // Update weather every hour
    setInterval(() => {
        getWeather(location);
    }, 3600000); // 1 hour

    // Check alerts more frequently
    setInterval(() => {
        checkAlerts(location);
    }, 300000); // 5 minutes
}

async function checkAlerts(location) {
    try {
        const alerts = await getWeatherAlerts(location);
        displayAlerts(alerts);
        
        // Update cached weather data with new alerts
        const cachedWeather = localStorage.getItem('cachedWeather');
        if (cachedWeather) {
            const weatherData = JSON.parse(cachedWeather);
            weatherData.alerts = alerts;
            localStorage.setItem('cachedWeather', JSON.stringify(weatherData));
        }
    } catch (error) {
        console.error('Error checking alerts:', error);
    }
}
function tellTime() {
    // Create a new Date object
    const date = new Date();

    // Get the current day of the week, month, day of the month, hour, and minute
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const dayOfMonth = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();

    // Convert the day of the week to a string
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayOfWeek = daysOfWeek[dayOfWeek];

    // Convert the month to a string
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = months[month];

    // Add a 0 before the minute if it is only single digit
    if (minute < 10) {
        minute = `0${minute}`;
    }

    // Adjust the time to standard 12 hour format
    if (hour === 0) {
        hour = 12;
        ampm = "am";
    } else if (hour >= 12) {
        hour -= 12;
        ampm = "pm";
    } else {
        ampm = "am";
    }

    // Display the current date and time 
    document.getElementById("ticker").textContent = hour + ":" + minute + ampm + " on " + currentDayOfWeek + ', ' + currentMonth + " " + dayOfMonth;

    // Update the time every minute
    setInterval(() => {
        // Get the current hour and minute
        let hour = new Date().getHours();
        let minute = new Date().getMinutes();

        // Add a 0 before the minute if it is only single digit
        if (minute < 10) {
            minute = `0${minute}`;
        }

        // Adjust the time to standard 12 hour format
        if (hour === 0) {
            hour = 12;
            ampm = "am";
        } else if (hour >= 12) {
            hour -= 12;
            ampm = "pm";
        } else {
            ampm = "am";
        }

        // Update the current date and time 
        document.getElementById("ticker").textContent = hour + ":" + minute + ampm + " on " + currentDayOfWeek + ', ' + currentMonth + " " + dayOfMonth;
    }, 1000); // 60000 milliseconds is one minute
}
function setAutoTheme(isDaytime) {
    const body = document.getElementById('body');
    if (!isDaytime) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    const body = document.getElementById('body');
    const toggle = document.getElementById('theme-toggle');
    const currentState = localStorage.getItem('darkMode');

    if (currentState) {
        // If we have a manual setting, go to auto first
        localStorage.removeItem('darkMode');
        // Get current forecast period to determine if it's daytime
        const currentPeriod = document.querySelector('.period');
        const isDaytime = currentPeriod?.classList.contains('period-day') ??
            (new Date().getHours() >= 6 && new Date().getHours() < 18);

        // Set theme based on current time
        if (isDaytime) {
            body.classList.remove('dark-mode');
        } else {
            body.classList.add('dark-mode');
        }
        toggle.textContent = "🌓 Auto Theme";
    } else {
        // In auto mode, toggle to opposite of current state
        const isCurrentlyDark = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', !isCurrentlyDark);

        if (isCurrentlyDark) {
            body.classList.remove('dark-mode');
            toggle.textContent = "🌑 Dark Mode";
        } else {
            body.classList.add('dark-mode');
            toggle.textContent = "☀️ Light Mode";
        }
    }

    // Force refresh of period styles
    const periods = document.getElementsByClassName('period');
    for (let period of periods) {
        period.style.backgroundColor = '';
    }
}

function addStartMenu() {
    const settingsContent = document.querySelector('.settings-content');

    // Create locations group
    const locationGroup = document.createElement('div');
    locationGroup.className = 'location-group';

    // Add weather location display
    const cityHeading = document.createElement('h3');
    cityHeading.id = 'city';
    locationGroup.appendChild(cityHeading);

    // Add AQI location display
    const aqiLocation = document.createElement('div');
    aqiLocation.id = 'aqi-location';
    const aqiZip = localStorage.getItem("aqiLocation");
    aqiLocation.textContent = aqiZip ? `AQI Location: ${aqiZip}` : 'AQI Location: Using weather location';
    locationGroup.appendChild(aqiLocation);

    settingsContent.innerHTML = '';
    settingsContent.appendChild(locationGroup);

    // Add buttons
    const clearButton = document.createElement("button");
    clearButton.textContent = "Set Weather Location";
    clearButton.addEventListener("click", clearLocation);
    settingsContent.appendChild(clearButton);

    const aqiButton = document.createElement("button");
    aqiButton.textContent = "Set AQI Location";
    aqiButton.addEventListener("click", setAQILocation);
    settingsContent.appendChild(aqiButton);

    // Add Theme Toggle button
    const themeToggle = document.createElement("button");
    const currentTheme = localStorage.getItem('darkMode');

    // Start in auto mode if no preference is set
    if (currentTheme === null) {
        themeToggle.textContent = "🌓 Auto Theme";
        const isDaytime = document.querySelector('.period')?.classList.contains('period-day') ?? true;
        setAutoTheme(isDaytime);
    } else {
        themeToggle.textContent = currentTheme === 'true' ? "☀️ Light Mode" : "🌑 Dark Mode";
        document.body.classList.toggle('dark-mode', currentTheme === 'true');
    }

    themeToggle.id = "theme-toggle";
    themeToggle.addEventListener("click", toggleTheme);
    settingsContent.appendChild(themeToggle);


    // Check if wallpaper is loaded
    const params = new URLSearchParams(window.location.search);
    const wallpaperPath = params.get('wallpaper');

    if (wallpaperPath) {
        // Add background toggle button
        const bgToggle = document.createElement("button");
        bgToggle.id = "background-toggle";
        const isBackgroundEnabled = localStorage.getItem('useBackground') !== 'false';
        bgToggle.textContent = isBackgroundEnabled ? "🖼️ Pause Background" : "🖼️ Play Background";

        bgToggle.addEventListener("click", () => {
            const canvas = document.getElementById('bgCanvas');
            const isEnabled = localStorage.getItem('useBackground') !== 'false';

            if (isEnabled) {
                localStorage.setItem('useBackground', 'false');
                canvas.style.opacity = '0';
                bgToggle.textContent = "🖼️ Play Background";
            } else {
                localStorage.setItem('useBackground', 'true');
                canvas.style.opacity = '1';
                bgToggle.textContent = "🖼️ Pause Background";
            }
        });

        settingsContent.appendChild(bgToggle);
    }


    // Add Weather Toggle button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = document.getElementById('weather').classList.contains('collapsed') ? "Show Forecast" : "Hide Forecast";
    toggleButton.id = "toggle-weather";
    toggleButton.addEventListener("click", toggleWeather);
    settingsContent.appendChild(toggleButton);



    // Add Exit button
    const exitButton = document.createElement("button");
    exitButton.textContent = "Exit Application";
    exitButton.id = "exit-button";
    exitButton.addEventListener("click", () => window.close());
    settingsContent.appendChild(exitButton);


}
function setAQILocation() {
    const zip = window.prompt("Enter ZIP code for AQI data:");
    if (!zip || !/^\d{5}$/.test(zip)) {
        alert("Please enter a valid 5-digit ZIP code.");
        return;
    }
    localStorage.setItem("aqiLocation", zip);

    // Update AQI location display
    const aqiLocation = document.getElementById('aqi-location');
    if (aqiLocation) {
        aqiLocation.textContent = `AQI Location: ${zip}`;
    }

    // Refresh AQI data
    const location = localStorage.getItem("location");
    if (location) {
        getAirQuality(location).then(aqiData => displayAirQuality(aqiData));
    }
}
function clearAQILocation() {
    localStorage.removeItem("aqiLocation");
    // Refresh AQI data with weather location
    const location = localStorage.getItem("location");
    if (location) {
        getAirQuality(location).then(aqiData => displayAirQuality(aqiData));
    }
}
function toggleWeather() {
    const weather = document.getElementById('weather');
    const body = document.getElementById('body');
    const canvas = document.getElementById('bgCanvas');

    weather.classList.toggle('collapsed');
    body.classList.toggle('collapsed');
    canvas.classList.toggle('collapsed');

    const isCollapsed = weather.classList.contains('collapsed');
    localStorage.setItem('weatherCollapsed', isCollapsed);

    const button = document.getElementById('toggle-weather');
    button.textContent = isCollapsed ? "Show Forecast" : "Hide Forecast";
}
function start() {
    // Initialize UI components first
    tellTime();
    addStartMenu();

    // Try to display cached weather if available
    const cachedWeather = localStorage.getItem('cachedWeather');
    if (cachedWeather) {
        const weatherData = JSON.parse(cachedWeather);
        displayCity(weatherData.city, weatherData.state);
        tellWeather(weatherData.forecast);
        if (weatherData.airQuality) {
            displayAirQuality(weatherData.airQuality);
        }
        if (weatherData.alerts) {
            displayAlerts(weatherData.alerts);
        }
    }

    // Then get coordinates and start weather updates
    getCoordinates();

    // ...rest of start function...
    window.addEventListener('resize', () => {
        const weather = document.querySelector('.period');
        if (weather) {
            const temp = parseInt(weather.querySelector('h4').textContent);
            const isDaytime = new Date().getHours() >= 6 && new Date().getHours() < 18;
            updateBackground(temp, isDaytime);
        }
    });
    const isCollapsed = localStorage.getItem('weatherCollapsed') === 'true';
    if (isCollapsed) {
        document.getElementById('weather').classList.add('collapsed');
        document.getElementById('body').classList.add('collapsed');
        document.getElementById('toggle-weather').textContent = "Show Weather";
    }
    const prefersDark = localStorage.getItem('darkMode') === 'true';
    if (prefersDark) {
        document.getElementById('body').classList.add('dark-mode');
        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').textContent = "☀️ Light Mode";
        }
    }
    setWallpaper();
    initBackgroundAnimation();
}
start();
function updateBackground(temperature, isDaytime) {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Convert temperature to a color value
    const tempColor = getTemperatureColor(temperature);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

    if (isDaytime) {
        gradient.addColorStop(0, `rgba(${tempColor}, 0.8)`);
        gradient.addColorStop(1, `rgba(${tempColor}, 0.2)`);
    } else {
        gradient.addColorStop(0, `rgba(${tempColor}, 0.3)`);
        gradient.addColorStop(1, `rgba(${tempColor}, 0.1)`);
    }

    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function getTemperatureColor(temp) {
    // Convert temperature to RGB values
    let r, g, b;

    if (temp <= 32) { // Freezing
        r = 200; g = 230; b = 255;
    } else if (temp <= 50) { // Cold
        r = 166; g = 209; b = 230;
    } else if (temp <= 70) { // Moderate
        r = 173; g = 216; b = 180;
    } else if (temp <= 85) { // Warm
        r = 255; g = 200; b = 100;
    } else { // Hot
        r = 255; g = 140; b = 80;
    }

    return `${r},${g},${b}`;
}
function setWallpaper() {
    try {
        const params = new URLSearchParams(window.location.search);
        const wallpaperPath = params.get('wallpaper');

        if (wallpaperPath) {
            console.log('Setting wallpaper:', wallpaperPath);
            const bgCanvas = document.getElementById('bgCanvas');
            bgCanvas.style.backgroundImage = `url("file:///${wallpaperPath}")`;
            document.body.style.backgroundImage = `url("file:///${wallpaperPath}")`;
        } else {
            console.warn('No wallpaper path in URL parameters');
        }
    } catch (error) {
        console.warn('Warning, problem setting wallpaper:', error);
    }
}
// Add this to verify the script is loading
window.addEventListener('load', () => {
    console.log('Page loaded, checking URL parameters...');
    setWallpaper();
});
function initBackgroundAnimation() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');

    // Check background preference
    const isBackgroundEnabled = localStorage.getItem('useBackground') !== 'false';
    canvas.style.opacity = isBackgroundEnabled ? '1' : '0';

    let backgroundImage = new Image();
    let scale = 1.0;
    let direction = 1;
    let offsetX = 0;
    let offsetY = 0;

    // Check if we're using a wallpaper
    const params = new URLSearchParams(window.location.search);
    const wallpaperPath = params.get('wallpaper');
    const isUsingWallpaper = !!wallpaperPath;

    backgroundImage.onload = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        backgroundImage.originalWidth = backgroundImage.width;
        backgroundImage.originalHeight = backgroundImage.height;
    };

    if (wallpaperPath) {
        backgroundImage.src = `file:///${wallpaperPath}`;
    }

    function animate() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // If using wallpaper and it's not loaded, wait
        if (isUsingWallpaper && !backgroundImage.complete) {
            requestAnimationFrame(animate);
            return;
        }

        // Draw gradient background first
        const weather = document.querySelector('.period');
        if (weather) {
            const temp = parseInt(weather.querySelector('h4').textContent);
            const isDaytime = new Date().getHours() >= 6 && new Date().getHours() < 18;
            const tempColor = getTemperatureColor(temp);
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

            if (isDaytime) {
                gradient.addColorStop(0, `rgba(${tempColor}, 0.8)`);
                gradient.addColorStop(1, `rgba(${tempColor}, 0.2)`);
            } else {
                gradient.addColorStop(0, `rgba(${tempColor}, 0.3)`);
                gradient.addColorStop(1, `rgba(${tempColor}, 0.1)`);
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // If using wallpaper, draw it on top with animation
        if (isUsingWallpaper && backgroundImage.complete) {
            scale += 0.00003 * direction;
            if (scale > 1.1) direction = -1;
            if (scale < 1.0) direction = 1;

            const minScaleX = canvas.width / backgroundImage.originalWidth;
            const minScaleY = canvas.height / backgroundImage.originalHeight;
            const baseScale = Math.max(minScaleX, minScaleY) * 1.1;
            const currentScale = baseScale * scale;

            const drawWidth = backgroundImage.originalWidth * currentScale;
            const drawHeight = backgroundImage.originalHeight * currentScale;

            const maxOffsetX = Math.max(0, (drawWidth - canvas.width) / 4);
            const maxOffsetY = Math.max(0, (drawHeight - canvas.height) / 4);

            offsetX = Math.sin(Date.now() / 12000) * maxOffsetX;
            offsetY = Math.cos(Date.now() / 15000) * maxOffsetY;

            const x = (canvas.width - drawWidth) / 2 + offsetX;
            const y = (canvas.height - drawHeight) / 2 + offsetY;

            ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animate();
}
async function getAirQuality(location) {
    const aqiZip = localStorage.getItem("aqiLocation");
    const coords = JSON.parse(location);
    const API_KEY = 'FBB76473-912E-4FDD-AEE4-6BA26080C2BD';

    try {
        // If AQI ZIP is set, use those coordinates
        if (aqiZip) {
            const zipResponse = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${aqiZip}&country=USA&format=json`);
            const zipData = await zipResponse.json();
            if (zipData.length > 0) {
                coords.lat = zipData[0].lat;
                coords.lon = zipData[0].lon;
            } else {
                console.log('No coordinates found for AQI ZIP:', aqiZip);
                return null;
            }
        }

        const url = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${coords.lat}&longitude=${coords.lon}&distance=150&API_KEY=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data || data.length === 0) {
            console.log('No AQI data found for location');
            return null;
        }

        return {
            aqi: data[0].AQI,
            category: data[0].Category.Name,
            pollutant: data[0].ParameterName,
            timestamp: data[0].DateObserved,
            location: aqiZip || 'weather location'
        };
    } catch (error) {
        console.error('Error fetching air quality:', error);
        return null;
    }
}
function displayAirQuality(aqiData) {
    const aqiDisplay = document.getElementById('aqi-display');
    if (!aqiDisplay) return;

    if (!aqiData) {
        aqiDisplay.innerHTML = `
            <span class="aqi-badge" style="--aqi-color: 128, 128, 128">
                No AQI
            </span>
        `;
        return;
    }

    const aqiColors = {
        'Good': '0, 228, 0',
        'Moderate': '255, 255, 0',
        'Unhealthy for Sensitive Groups': '255, 126, 0',
        'Unhealthy': '255, 0, 0',
        'Very Unhealthy': '143, 63, 151',
        'Hazardous': '126, 0, 35'
    };

    aqiDisplay.innerHTML = `
        <span class="aqi-badge" style="--aqi-color: ${aqiColors[aqiData.category]}">
            AQI ${aqiData.aqi}
        </span>
        <span class="aqi-category">${aqiData.category}</span>
    `;
}
async function getWeatherAlerts(location) {
    const coords = JSON.parse(location);
    try {
        const response = await fetch(`https://api.weather.gov/alerts/active?point=${coords.lat},${coords.lon}`);
        const data = await response.json();
        const alerts = data.features || [];
        console.log(`Found ${alerts.length} weather alerts:`, alerts);
        return alerts;
    } catch (error) {
        console.error('Error fetching weather alerts:', error);
        return [];
    }
}

function displayAlerts(alerts) {
    // Remove any existing alerts
    const alertDiv = document.querySelector('.ticker-alerts');


    if (alerts.length > 0) {
        // Sort alerts by severity
        const sortedAlerts = alerts.sort((a, b) => {
            const severityOrder = ['Extreme', 'Severe', 'Moderate', 'Minor'];
            return severityOrder.indexOf(a.properties.severity) - severityOrder.indexOf(b.properties.severity);
        });
        const mostSevereAlert = sortedAlerts[0].properties;
        console.log('Most severe alert:', mostSevereAlert);

        // Create alert content with scrolling text
        alertDiv.innerHTML = `
            <div class="alert ${mostSevereAlert.severity.toLowerCase()}">
                <span class="alert-tag">⚠️ ${mostSevereAlert.event}</span>
                <div class="alert-scroll-container">
                    <span class="alert-scroll-text">${mostSevereAlert.parameters.NWSheadline?.[0] || mostSevereAlert.description}</span>
                </div>
            </div>
        `;
    } else {
        console.log('No active weather alerts for this location');
    }
}
function setTemperatureColor(element, temp) {
    let colorVar;
    if (temp <= 32) {
        colorVar = 'var(--temp-freezing)';
    } else if (temp <= 50) {
        colorVar = 'var(--temp-cold)';
    } else if (temp <= 70) {
        colorVar = 'var(--temp-moderate)';
    } else if (temp <= 85) {
        colorVar = 'var(--temp-warm)';
    } else {
        colorVar = 'var(--temp-hot)';
    }
    element.style.setProperty('--temp-color', colorVar);
}