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
                    <span>Wind Chill:</span> ${Math.round(current.windChill * 9/5 + 32)}°F
                </div>
                ` : ''}
                ${current.heatIndex !== null ? `
                <div class="condition-row">
                    <span>Heat Index:</span> ${Math.round(current.heatIndex * 9/5 + 32)}°F
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
                        <div class="hour-forecast ${
                            hour.temperature === minTemp ? 'coldest' : ''
                        } ${
                            hour.temperature === maxTemp ? 'hottest' : ''
                        }">
                            <div class="time">${new Date(hour.startTime).toLocaleTimeString([], {hour: 'numeric'})}</div>
                            <div class="temp">${hour.temperature}°F</div>
                            <div class="short">${hour.shortForecast}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function getWeather(location) {
	const coords = JSON.parse(location);
	console.log(coords.lat,coords.lon);
	const request = new Request('https://api.weather.gov/points/' + coords.lat.trim() + "," + coords.lon.trim());

	Promise.all([
        fetch(request),
        getDetailedWeatherInfo(location)
    ])
    .then(([weatherResponse, detailedData]) => {
        // Store detailed data for later use
        if (detailedData) {
            localStorage.setItem('detailedWeather', JSON.stringify(detailedData));
        }
        
        weatherResponse.json().then(data => {
            const forecastURL = data.properties.forecast;
            const city = data.properties.relativeLocation.properties.city;
            const state = data.properties.relativeLocation.properties.state;
            displayCity(city, state);
            console.log(data.properties);
            fetch(forecastURL)
                .then(result => result.json())
                .then((output) => {
                    const weather = output;
                    
                    tellWeather(weather);
                    
                    console.log(weather);				
                    console.log('Weather updated');

            }).catch(err => console.error(err));
        });

        if (detailedData) {
            displayDetailedWeather(detailedData);
        }
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
    for(i = 0; i < oneWeekForecast.length - 4; i += 2) {      
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

    // Add event listeners
    const backButton = navigationControls.querySelector('.back-to-forecast');
    const detailButton = navigationControls.querySelector('.view-detail');

    detailButton.addEventListener('click', () => {
        dayRow.classList.add('slide-left');
        nightRow.classList.add('slide-left');
        detailView.classList.add('slide-in');
        backButton.style.display = 'block';
        detailButton.style.display = 'none';
        // Force refresh of detailed weather display
        const weatherData = JSON.parse(localStorage.getItem('detailedWeather'));
        if (weatherData) {
            displayDetailedWeather(weatherData);
        }
    });

    backButton.addEventListener('click', () => {
        dayRow.classList.remove('slide-left');
        nightRow.classList.remove('slide-left');
        detailView.classList.remove('slide-in');
        backButton.style.display = 'none';
        detailButton.style.display = 'block';
    });

    setTheme(isDaytime);
}
function startWeatherRefresh(location) {
	getWeather(location);
	const refreshLimit = 24 * 7 * 365;
	let refreshCount = 0;
	setInterval(() => {
		if (refreshCount <= refreshLimit) { 
			getWeather(location);
			refreshCount++;
		}
	}, 3600000); // 3600000 milliseconds is one hour	
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
    document.getElementById("ticker").textContent = hour + ":" + minute + ampm + " on " + currentDayOfWeek + ', ' + currentMonth + " " + dayOfMonth ;

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
		document.getElementById("ticker").textContent = hour + ":" + minute + ampm + " on " + currentDayOfWeek + ', ' + currentMonth + " " + dayOfMonth ;
	}, 1000); // 60000 milliseconds is one minute
}	

function addStartMenu() {
    const settingsContent = document.querySelector('.settings-content');
    
    // Clear the settings content first
    settingsContent.innerHTML = '<h3 id="city"></h3>';
    
    // Add Clear Location button
    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear Location";
    clearButton.addEventListener("click", clearLocation);
    settingsContent.appendChild(clearButton);

    // Add Theme Toggle button
    const themeToggle = document.createElement("button");
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? "☀️ Light Mode" : "🌑 Dark Mode";
    themeToggle.id = "theme-toggle";
    themeToggle.addEventListener("click", toggleTheme);
    settingsContent.appendChild(themeToggle);

    // Add Weather Toggle button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = document.getElementById('weather').classList.contains('collapsed') ? "Show Weather" : "Hide Weather";
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

function toggleTheme() {
    const body = document.getElementById('body');
    const isDarkMode = body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update toggle button text/icon
    const toggle = document.getElementById('theme-toggle');
    toggle.textContent = isDarkMode ? "☀️ Light Mode" : "🌑 Dark Mode";
    
    // Force refresh of period styles
    const periods = document.getElementsByClassName('period');
    for (let period of periods) {
        period.style.backgroundColor = '';  // Reset to CSS variable
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
    button.textContent = isCollapsed ? "Show Weather" : "Hide Weather";
}

function start() {	
	window.addEventListener('load', tellTime);	
	window.addEventListener('load', getCoordinates);
	addStartMenu();
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
            console.error('No wallpaper path in URL parameters');
        }
    } catch (error) {
        console.error('Error setting wallpaper:', error);
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
    let backgroundImage = new Image();
    let scale = 1.0;
    let direction = 1;
    let offsetX = 0;
    let offsetY = 0;
    
    backgroundImage.onload = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Store original dimensions for reference
        backgroundImage.originalWidth = backgroundImage.width;
        backgroundImage.originalHeight = backgroundImage.height;
    };

    const params = new URLSearchParams(window.location.search);
    const wallpaperPath = params.get('wallpaper');
    if (wallpaperPath) {
        backgroundImage.src = `file:///${wallpaperPath}`;
    }

    function animate() {
        if (!backgroundImage.complete) {
            requestAnimationFrame(animate);
            return;
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // More subtle scale changes
        scale += 0.00003 * direction;
        if (scale > 1.1) direction = -1;
        if (scale < 1.0) direction = 1;

        // Calculate minimum scale needed to cover canvas
        const minScaleX = canvas.width / backgroundImage.originalWidth;
        const minScaleY = canvas.height / backgroundImage.originalHeight;
        const baseScale = Math.max(minScaleX, minScaleY) * 1.1; // Add 10% to ensure coverage

        // Apply base scale to our animation scale
        const currentScale = baseScale * scale;

        // Calculate dimensions to maintain aspect ratio and cover
        const drawWidth = backgroundImage.originalWidth * currentScale;
        const drawHeight = backgroundImage.originalHeight * currentScale;

        // Calculate max allowed offset based on scaled dimensions
        const maxOffsetX = Math.max(0, (drawWidth - canvas.width) / 4);
        const maxOffsetY = Math.max(0, (drawHeight - canvas.height) / 4);

        // Smooth sinusoidal movement
        offsetX = Math.sin(Date.now() / 12000) * maxOffsetX;
        offsetY = Math.cos(Date.now() / 15000) * maxOffsetY;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Center the image
        const x = (canvas.width - drawWidth) / 2 + offsetX;
        const y = (canvas.height - drawHeight) / 2 + offsetY;

        // Draw the image
        ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
        
        requestAnimationFrame(animate);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animate();
}
