function displaySettings() {
	let settingsDisplay = document.getElementById("settings");
	settingsDisplay = getComputedStyle(settingsDisplay);	
	
	if (settingsDisplay.display === 'none') {
		document.getElementById("settings").style.display = "block";	
	} else {
		document.getElementById("settings").style.display = "none";
	}
}
function overflowSettings() {
	let settingsOverflow = document.getElementById("body");
	settingsOverflow = getComputedStyle(settingsOverflow);	
	if (settingsOverflow.overflow === 'hidden') {
		document.getElementById("body").style.overflow = "scroll";	
	} else {
		document.getElementById("body").style.overflow = "hidden";
	}
}	
function clearLocation() {
	localStorage.removeItem("location");
	getCoordinates();
	}
function displayCity(city, state) {
	const cityHeading = document.getElementById("city");
	cityHeading.textContent = "Location: " + city + ", " + state;
	document.title = "Forecast for " + city + ", " + state;
	
}	
function darkTheme() {
    document.getElementById('body').style.color = '#E4E4E7';
    document.getElementById('body').style.backgroundColor = '#18181B';
    document.getElementById('body').style.backgroundImage = "url('./images/bg_dark.png')";
    const periods = document.getElementsByClassName('period');
    for (i = 0; i < periods.length; i++) {
        periods[i].style.backgroundColor = 'rgba(39, 39, 42, 0.8)';
        periods[i].style.borderLeft = '4px solid #60A5FA';
    }    
}    

function lightTheme() {
    document.getElementById('body').style.color = '#18181B';
    document.getElementById('body').style.backgroundColor = '#F4F4F5';
    document.getElementById('body').style.backgroundImage = "url('./images/bg.png')";
    const periods = document.getElementsByClassName('period');
    for (i = 0; i < periods.length; i++) {
        periods[i].style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        periods[i].style.borderLeft = '4px solid #3B82F6';
    }    
}
function setTheme(isDaytime) {
	if (isDaytime) {
		lightTheme();
	} else {
		darkTheme();
	}
}

function getCoordinates() {
    let location = localStorage.getItem("location");

    if (location !== null) {
        // Hide settings if location exists
        document.getElementById("settings").style.display = "none";
        startWeatherRefresh(location);
        return;
    }

    const prompt = window.prompt("Please enter your latitude and longitude, separated by a comma.");

    const coordinates = prompt.split(",");

    if (coordinates.length !== 2) {
		alert("Please enter your latitude and longitude, separated by a comma.");
		return;
    }

    const latitude = coordinates[0];
    const longitude = coordinates[1];

    localStorage.setItem("location", JSON.stringify({ lat: latitude, lon: longitude }));
    location = localStorage.getItem("location");
    
	startWeatherRefresh(location);
}
function getWeather(location) {
	const coords = JSON.parse(location);
	console.log(coords.lat,coords.lon);
	const request = new Request('https://api.weather.gov/points/' + coords.lat.trim() + "," + coords.lon.trim());

	fetch(request)
	  .then((response) => response.json())
	  .then((data) => {
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
	}
function tellWeather(weather) {
    const weatherDisplay = document.getElementById('weather');
    const twoWeekForecast = weather.properties.periods;            
    const isDaytime = twoWeekForecast[0].isDaytime;
    const currentTemp = twoWeekForecast[0].temperature;
    
    weatherDisplay.innerHTML = ' ';
    
    // Update background based on current conditions
    updateBackground(currentTemp, isDaytime);
			
	for(i = 0; i < 6; i++) {
		const container = document.createElement('div');
		const div = document.createElement('div');					
		const periodName = twoWeekForecast[i].name;
		const details = twoWeekForecast[i].detailedForecast;
		const brief = twoWeekForecast[i].shortForecast;
		const temp = twoWeekForecast[i].temperature;
		
		container.innerHTML = '<h2>' + periodName + '</h2>';		
		div.innerHTML += '<h4>' + temp + ' And ' + brief + '</h4>';
		div.innerHTML += '<p>' + details + '</p>';
		div.className = 'period';
		
		weatherDisplay.append(container);
		container.append(div);
	}
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
	const button = document.createElement("button");
	button.textContent = "Clear Location";
	button.addEventListener("click", clearLocation);
	document.getElementById('settings').appendChild(button);

	const button1 = document.createElement("button");
	button1.textContent = "Dark Theme";
	button1.addEventListener("click", darkTheme);
	document.getElementById('settings').appendChild(button1);

	const button2 = document.createElement("button");
	button2.textContent = "Light Theme";
	button2.addEventListener("click", lightTheme);
	document.getElementById('settings').appendChild(button2);

	const button3 = document.createElement("button");
	button3.textContent = "Toggle Scroll";
	button3.addEventListener("click", overflowSettings);
	document.getElementById('settings').appendChild(button3);

	const header = document.getElementById('header');
	header.addEventListener('click', displaySettings);
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
}
start();

function updateBackground(temperature, isDaytime) {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const colors = getTemperatureColors(temperature, isDaytime);
    
    gradient.addColorStop(0, colors.top);
    gradient.addColorStop(1, colors.bottom);
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getTemperatureColors(temp, isDaytime) {
    // Base alpha values
    const topAlpha = isDaytime ? 0.8 : 0.3;
    const bottomAlpha = isDaytime ? 0.2 : 0.1;
    
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
    
    return {
        top: `rgba(${r},${g},${b},${topAlpha})`,
        bottom: `rgba(${r},${g},${b},${bottomAlpha})`
    };
}