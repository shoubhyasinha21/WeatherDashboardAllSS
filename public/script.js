// 🌤️ Weather icon
function getWeatherIcon(condition, temp) {
    condition = (condition || "").toLowerCase();

    if (condition.includes("thunderstorm")) return "⛈️";
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("drizzle")) return "🌦️";
    if (condition.includes("clouds")) return "☁️";
    if (condition.includes("clear")) return "☀️";
    if (temp < 10) return "❄️";

    return "🌡️";
}

// 📅 Format date + time
function formatDateTime(dateTime) {
    if (!dateTime) return "";

    let date = new Date(dateTime);

    let time = date.toLocaleString("en-US", {
        hour: "numeric",
        hour12: true
    });

    let day = date.toLocaleDateString("en-US", {
        weekday: "short"
    });

    let fullDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });

    return `${day}, ${fullDate} - ${time}`;
}

// 🎨 Weather animation (safe)
function setWeatherAnimation(condition, temp) {
    condition = (condition || "").toLowerCase();

    document.body.classList.remove("sunny", "rain", "cloudy", "thunder", "snow");

    if (condition.includes("thunderstorm")) {
        document.body.classList.add("thunder");
    } 
    else if (condition.includes("rain") || condition.includes("drizzle")) {
        document.body.classList.add("rain");
    } 
    else if (condition.includes("clouds")) {
        document.body.classList.add("cloudy");
    } 
    else if (condition.includes("clear")) {
        document.body.classList.add("sunny");
    } 
    else if (temp < 10) {
        document.body.classList.add("snow");
    }
}

// 🔍 Search weather
function getWeather() {
    const city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    document.getElementById("weather").innerHTML = "⏳ Loading weather...";

    fetch(`/weather?city=${encodeURIComponent(city)}`)
    .then(res => res.json())
    .then(data => {

        if (!data || data.cod !== 200) {
            document.getElementById("weather").innerHTML = "❌ City not found";
            return;
        }

        let condition = data.weather?.[0]?.main || "";
        let temp = data.main?.temp || 0;
        let icon = getWeatherIcon(condition, temp);

        setWeatherAnimation(condition, temp);

        document.getElementById("weather").innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <p style="font-size:30px;">${icon}</p>
            <p><b>${temp}°C</b></p>
            <p>💧 Humidity: ${data.main.humidity}%</p>
            <p>🌬 Wind: ${data.wind.speed} m/s</p>
        `;

        getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => {
        console.error(err);
        document.getElementById("weather").innerHTML = "❌ Error fetching weather";
    });
}

// 📍 Location weather
function getLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    document.getElementById("weather").innerHTML = "⏳ Detecting location...";

    navigator.geolocation.getCurrentPosition(position => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`/weather?lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {

            if (!data || data.cod !== 200) {
                document.getElementById("weather").innerHTML = "❌ Unable to fetch location weather";
                return;
            }

            let condition = data.weather?.[0]?.main || "";
            let temp = data.main?.temp || 0;
            let icon = getWeatherIcon(condition, temp);

            setWeatherAnimation(condition, temp);

            document.getElementById("weather").innerHTML = `
                <h2>${data.name}</h2>
                <p style="font-size:30px;">${icon}</p>
                <p><b>${temp}°C</b></p>
                <p>💧 Humidity: ${data.main.humidity}%</p>
                <p>🌬 Wind: ${data.wind.speed} m/s</p>
            `;

            getForecast(lat, lon);
        })
        .catch(err => {
            console.error(err);
            document.getElementById("weather").innerHTML = "❌ Location error";
        });

    }, () => {
        alert("Location access denied");
    });
}

// ⏱️ Forecast
function getForecast(lat, lon) {
    if (!lat || !lon) return;

    document.getElementById("forecast").innerHTML = "⏳ Loading forecast...";

    fetch(`/forecast?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {

        if (!data || !data.list) {
            document.getElementById("forecast").innerHTML = "❌ Forecast unavailable";
            return;
        }

        let output = "<h2>Next 36 Hours</h2>";

        // safer loop
        for (let i = 0; i < Math.min(12, data.list.length); i++) {

            let item = data.list[i];

            let temp = item?.main?.temp || 0;
            let condition = item?.weather?.[0]?.main || "";
            let icon = getWeatherIcon(condition, temp);
            let dateTime = formatDateTime(item?.dt_txt);

            output += `
                <div style="
                    margin:10px;
                    padding:10px;
                    background:white;
                    color:black;
                    border-radius:8px;
                    text-align:center;
                ">
                    <p>${dateTime}</p>
                    <p style="font-size:26px;">${icon}</p>
                    <p><b>${temp}°C</b></p>
                </div>
            `;
        }

        document.getElementById("forecast").innerHTML = output;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("forecast").innerHTML = "❌ Forecast error";
    });
}