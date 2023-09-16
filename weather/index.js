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
	document.getElementById('body').style.color = 'rgba(235, 212, 203, 0.95)';
	document.getElementById('body').style.backgroundColor = 'rgba(44, 7, 3, 1)';
	document.getElementById('body').style.backgroundImage = "url('./images/bg_dark.png')";
	const periods = document.getElementsByClassName('period');
	for (i = 0; i < periods.length; i++) {
		periods[i].style.backgroundColor = 'rgba(44, 7, 3, 0.4)';
	}	
}	
function lightTheme() {
	document.getElementById('body').style.color = '#2C0703';
	document.getElementById('body').style.backgroundColor = 'rgba(235, 212, 203, .8)';
	document.getElementById('body').style.backgroundImage = "url('./images/bg.png')";
	const periods = document.getElementsByClassName('period');
	for (i = 0; i < periods.length; i++) {
		periods[i].style.backgroundColor = 'rgba(235, 212, 203, .9)';
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
	
	weatherDisplay.innerHTML = ' ';
			
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
}
start();