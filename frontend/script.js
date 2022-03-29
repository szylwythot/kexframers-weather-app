//Weather card constructor
function Weather(city, temperature, feelslike, conditionText, conditionIcon, wind){
    this.city = city;
    this.temperature = temperature;
    this.feelslike = feelslike;
    this.conditionText = conditionText;
    this.conditionIcon = conditionIcon;
    this.wind = wind;
}
//Global variables
let cities = [];
let days = [];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//Generate weather card HTML
function weatherCard(weather) {
    return `
    <h2 class="city">${weather.city}</h2>
    <p class="temperature">${Math.round(weather.temperature * 10) / 10}°</p>
    <p class="realFeelText">Real feel</p>
    <p class="realFeelValue">${Math.round(weather.feelslike * 10) / 10}°</p>
    <img class="conditionIcon" src="https://openweathermap.org/img/wn/${weather.conditionIcon}@4x.png"></img>
    <p class="conditionText">${weather.conditionText}</p>
    <img class="windText" src="./images/windIcon.png"></img>
    <p class="windValue">${Math.round(weather.wind * 10) / 10} km/h</p>
    <button class="moreInfo">Show more</button>
    <img src="images/${checkFav(weather.city)}" class="favorite"></img>
    `;
}
//temp values
let icons = [];
let temps = [];
let forecastDays = [];
let iconsH = [];
let tempsH = [];
let forecastDaysH = [];

//Generate daily weather details HTML
function dailyCards(days, icons, temps) {
    return `
    <div class="dayCard">
        <h2>${days[0]}</h2>
        <img class="icon" src="${icons[0]}">
        <p class="temp">${temps[0]}°</p>
    </div>
    <div class="dayCard">
        <h2>${days[1]}</h2>
        <img class="icon" src="${icons[1]}">
        <p class="temp">${temps[1]}°</p>
    </div>
    <div class="dayCard">
        <h2>${days[2]}</h2>
        <img class="icon" src="${icons[2]}">
        <p class="temp">${temps[2]}°</p>
    </div>
    <div class="dayCard">
        <h2>${days[3]}</h2>
        <img class="icon" src="${icons[3]}">
        <p class="temp">${temps[3]}°</p>
    </div>
    <div class="dayCard">
        <h2>${days[4]}</h2>
        <img class="icon" src="${icons[4]}">
        <p class="temp">${temps[4]}°</p>
    </div>
    <div class="dayCard">
        <h2>${days[5]}</h2>
        <img class="icon" src="${icons[5]}">
        <p class="temp">${temps[5]}°</p>
    </div>
    <div class="dayCard">
        <h2>${days[6]}</h2>
        <img class="icon" src="${icons[6]}">
        <p class="temp">${temps[6]}°</p>
    </div>
    `
}

//Fetch cities list
async function fetchCities() {
  
    const citiesData = await fetch("cities/city.list.json");
    const citiesJson = await citiesData.json();
    
    for (const city of citiesJson) {
        cities.push(city.name);
    }

    const uniqueCities = [...new Set(cities)];
    cities = [];

    for (const uniqueCity of uniqueCities) {
        cities.push({name: uniqueCity, isFav: false});
    }
    return cities;
}

//Generate autocomplete list
function generateAutoCompleteList(inputValue, cities) {
    let matchedArr = [];
    let matchedHTML = "";
    const citiesList = document.querySelector(".citiesList");

    for (const city of cities) {
        if (inputValue.toLowerCase() === city.name.substring(0, inputValue.length).toLowerCase()) {
            matchedArr.push(city.name);
        }
    }

    //Sort results and add to HTML string
    matchedArr.sort();
    for (const matchedCity of matchedArr) {
        matchedHTML += `<p class="listElement">${matchedCity}</p>`;
    }
    
    citiesList.classList.remove("noShow");
    citiesList.innerHTML = "";
    citiesList.insertAdjacentHTML("beforeend", matchedHTML)
}

//Generate favorites list
function generateFavoriteList(cities) {
    let citiesInCookies = []
    const cookiesArr = document.cookie.split(";");
    for (const cookie of cookiesArr) {
        citiesInCookies.push(cookie.trim().split("=")[1])
    }

    let cityIndex = cities.findIndex((city) => city.name === cities.name);
    let isInCookie = checkFavFromCookie(`${cityIndex}`);
    let favHTML = "";
    const citiesList = document.querySelector(".citiesList");
    
    for (const cityInCookies of citiesInCookies) {
        if (cityInCookies !== undefined) {
            favHTML += `
                <p class="listElement">${cityInCookies}</p>
            `;
        }
    }
    for (const city of cities) {
        if ((city.isFav === true || isInCookie) && !citiesInCookies.includes(city.name)) {
            favHTML += `
            <p class="listElement">${city.name}</p>
            `;
        }
    }
    
    citiesList.classList.remove("noShow");
    citiesList.innerHTML = "";
    citiesList.insertAdjacentHTML("beforeend", favHTML)
}

//Clear autocomplete list
function clearList() {
    const citiesList = document.querySelector(".citiesList");
    citiesList.classList.add("noShow");
    citiesList.innerHTML = "";
}

//Change star image source if favorite city
function checkFav(getCity) {
    let cityIndex = cities.findIndex((city) => city.name === getCity);
    let isInCookie = checkFavFromCookie(`${cityIndex}`);

    if (cities[cityIndex].isFav || isInCookie) {
        return `star_fill.png`
    } else {
        return `star_empty.png`
    }
}

//Pexels - get image url for city
async function fetchBackgroundImage(city) {
    const fetchImagesObject = await fetch(`https://api.pexels.com/v1/search?query=${city}%20city&orientation=landscape`, {
        "mode": "cors",
        "headers": {
            "Authorization": "563492ad6f91700001000001c41dd7efd70045529f2e15681dfa9701"
        }
    });
    const imagesObject = await fetchImagesObject.json();

    return imagesObject.photos[2].src.original;
}

function changeBackgroundImage(imageSource) {
    const backgroundImage = document.querySelector(".backgroundImage");

    backgroundImage.classList.remove("hideImage");
    backgroundImage.src = imageSource;
}

//Cookie fun
function checkFavFromCookie(id) {
    const cookiesArr = document.cookie.split(";");
    for (const cookie of cookiesArr) {
        if (cookie.trim().substring(0, id.length) === id) {
            return true;
        }
    }
    return false;
}

//Forecast api request
const apiKey = "bd28a9a500301edcfb782e80278bfea5";

async function getForecastData(lat, lon) {
    const forecastData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?units=metric&exclude=minutely,current,hourly,alerts&lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const forecastDataJson = await forecastData.json();

    return forecastDataJson.daily;
}

//Historical api request
async function getHistoricalData(lat, lon, dt) {
    const forecastData = await fetch(`https://api.openweathermap.org/data/2.5/onecall/timemachine?units=metric&lat=${lat}&lon=${lon}&dt=${dt}&appid=${apiKey}`);
    const forecastDataJson = await forecastData.json();

    return forecastDataJson.current;
}

//Animation html
function loadAnimationHTML() {
    return `
    <div class="preloader">
        <!-- Ez a nap -->
        <svg version="1.1" id="sun" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 10 10" enable-background="new 0 0 10 10" xml:space="preserve" style="opacity: 1; margin-left: 0px; margin-top: 0px;">
          <g>
            <path fill="none" d="M6.942,3.876c-0.4-0.692-1.146-1.123-1.946-1.123c-0.392,0-0.779,0.104-1.121,0.301c-1.072,0.619-1.44,1.994-0.821,3.067C3.454,6.815,4.2,7.245,5,7.245c0.392,0,0.779-0.104,1.121-0.301C6.64,6.644,7.013,6.159,7.167,5.581C7.321,5,7.243,4.396,6.942,3.876z M6.88,5.505C6.745,6.007,6.423,6.427,5.973,6.688C5.676,6.858,5.34,6.948,5,6.948c-0.695,0-1.343-0.373-1.69-0.975C2.774,5.043,3.093,3.849,4.024,3.312C4.32,3.14,4.656,3.05,4.996,3.05c0.695,0,1.342,0.374,1.69,0.975C6.946,4.476,7.015,5,6.88,5.505z"></path>
            <path fill="none" d="M8.759,2.828C8.718,2.757,8.626,2.732,8.556,2.774L7.345,3.473c-0.07,0.041-0.094,0.132-0.053,0.202C7.319,3.723,7.368,3.75,7.419,3.75c0.025,0,0.053-0.007,0.074-0.02l1.211-0.699C8.774,2.989,8.8,2.899,8.759,2.828z"></path>
            <path fill="none" d="M1.238,7.171c0.027,0.047,0.077,0.074,0.128,0.074c0.025,0,0.051-0.008,0.074-0.02l1.211-0.699c0.071-0.041,0.095-0.133,0.054-0.203S2.574,6.228,2.503,6.269l-1.21,0.699C1.221,7.009,1.197,7.101,1.238,7.171z"></path>
            <path fill="none" d="M6.396,2.726c0.052,0,0.102-0.026,0.13-0.075l0.349-0.605C6.915,1.976,6.89,1.885,6.819,1.844c-0.07-0.042-0.162-0.017-0.202,0.054L6.269,2.503C6.228,2.574,6.251,2.666,6.322,2.706C6.346,2.719,6.371,2.726,6.396,2.726z"></path>
                <path fill="none" d="M3.472,7.347L3.123,7.952c-0.041,0.07-0.017,0.162,0.054,0.203C3.2,8.169,3.226,8.175,3.25,8.175c0.052,0,0.102-0.027,0.129-0.074l0.349-0.605c0.041-0.07,0.017-0.16-0.054-0.203C3.603,7.251,3.513,7.276,3.472,7.347z"></path>
                <path fill="none" d="M3.601,2.726c0.025,0,0.051-0.007,0.074-0.02C3.746,2.666,3.77,2.574,3.729,2.503l-0.35-0.604C3.338,1.828,3.248,1.804,3.177,1.844C3.106,1.886,3.082,1.976,3.123,2.047l0.35,0.604C3.5,2.7,3.549,2.726,3.601,2.726z"></path>
                <path fill="none" d="M6.321,7.292c-0.07,0.043-0.094,0.133-0.054,0.203l0.351,0.605c0.026,0.047,0.076,0.074,0.127,0.074c0.025,0,0.051-0.006,0.074-0.02c0.072-0.041,0.096-0.133,0.055-0.203l-0.35-0.605C6.483,7.276,6.393,7.253,6.321,7.292z"></path>
                <path fill="none" d="M2.202,5.146c0.082,0,0.149-0.065,0.149-0.147S2.284,4.851,2.202,4.851H1.503c-0.082,0-0.148,0.066-0.148,0.148s0.066,0.147,0.148,0.147H2.202z"></path>
                <path fill="none" d="M8.493,4.851H7.794c-0.082,0-0.148,0.066-0.148,0.148s0.066,0.147,0.148,0.147l0,0h0.699c0.082,0,0.148-0.065,0.148-0.147S8.575,4.851,8.493,4.851L8.493,4.851z"></path>
                <path fill="none" d="M5.146,2.203V0.805c0-0.082-0.066-0.148-0.148-0.148c-0.082,0-0.148,0.066-0.148,0.148v1.398c0,0.082,0.066,0.149,0.148,0.149C5.08,2.352,5.146,2.285,5.146,2.203z"></path>
                <path fill="none" d="M4.85,7.796v1.396c0,0.082,0.066,0.15,0.148,0.15c0.082,0,0.148-0.068,0.148-0.15V7.796c0-0.082-0.066-0.148-0.148-0.148C4.917,7.647,4.85,7.714,4.85,7.796z"></path>
                <path fill="none" d="M2.651,3.473L1.44,2.774C1.369,2.732,1.279,2.757,1.238,2.828C1.197,2.899,1.221,2.989,1.292,3.031l1.21,0.699c0.023,0.013,0.049,0.02,0.074,0.02c0.051,0,0.101-0.026,0.129-0.075C2.747,3.604,2.722,3.514,2.651,3.473z"></path>
                <path fill="none" d="M8.704,6.968L7.493,6.269c-0.07-0.041-0.162-0.016-0.201,0.055c-0.041,0.07-0.018,0.162,0.053,0.203l1.211,0.699c0.023,0.012,0.049,0.02,0.074,0.02c0.051,0,0.102-0.027,0.129-0.074C8.8,7.101,8.776,7.009,8.704,6.968z"></path>
            </g>
        </svg>
        
        <!-- Ez a felhő -->
        <svg version="1.1" id="cloud" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 10 10" enable-background="new 0 0 10 10" xml:space="preserve">
          <path fill="none" d="M8.528,5.624H8.247c-0.085,0-0.156-0.068-0.156-0.154c0-0.694-0.563-1.257-1.257-1.257c-0.098,0-0.197,0.013-0.3,0.038C6.493,4.259,6.45,4.252,6.415,4.229C6.38,4.208,6.356,4.172,6.348,4.131C6.117,3.032,5.135,2.235,4.01,2.235c-1.252,0-2.297,0.979-2.379,2.23c-0.004,0.056-0.039,0.108-0.093,0.13C1.076,4.793,0.776,5.249,0.776,5.752c0,0.693,0.564,1.257,1.257,1.257h6.495c0.383,0,0.695-0.31,0.695-0.692S8.911,5.624,8.528,5.624z"></path>
        </svg>

        <!-- Ez az eső -->
        <div class="rain">
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
          <span class="drop"></span>
        </div>
    </div>
    `;
}

async function loadEvent() {
    //Set variables
    const baseWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";
    let todayCity = "";
    const rootElement = document.getElementById("root");

    //Fetch cities
    const citiesArr = await fetchCities();

    //Generate HTML body
    let htmlBody = `
        <section class="landingPage">
            <header>
                <form class="cityChooser" action="">
                    <p class="errorMsg noShow">Invalid city name!</p>
                        <input class="cityInput" type="text" name="cityInput" placeholder="Choose a city..." autocomplete="off">
                    <div class="citiesList noShow"></div>
                    <button>Submit</button>
                </form>
            </header>
            <div class="card">
                <div class="dailyDetails"></div>
                <div class="cardPanel hideCard">
                    ${loadAnimationHTML()}
                </div>
                <img class="backgroundImage hideImage" src="https://www.almanac.com/sites/default/files/image_nodes/rainbow-weather.jpg">
            </div>
        </section>
    `;
    
    rootElement.insertAdjacentHTML("beforeend", htmlBody);

    //Form input field event listener (autocomplete)
    const inputCity = rootElement.querySelector(".cityInput");

    inputCity.addEventListener("input", (event) => {
        if (event.target.value.length >= 3) {
            generateAutoCompleteList(event.target.value, citiesArr);

            //Fill input field on clicking list item
            const listElement = document.querySelectorAll(".listElement");
            const autoFillElements = Array.from(listElement);

            for (const autoFillElement of autoFillElements) {
                autoFillElement.addEventListener("click", function (event) {
                    inputCity.value = event.target.innerHTML;
                    clearList();
                })
            }
        } else {
            clearList();
        }
    });

    //Set focus on input field
    inputCity.focus();

    //Generate favorite list on clicking the input field
    inputCity.addEventListener("click", (event) => {
        generateFavoriteList(cities);

        // Input city - autofill on click
        const listElement = document.querySelectorAll(".listElement");
        const autoFillElements = Array.from(listElement);

        for (const autoFillElement of autoFillElements) {
            autoFillElement.addEventListener("click", function (event) {
                inputCity.value = event.target.innerHTML;
                clearList();
            })
        }
    });

    //Submit event - generate city card on submit
    const cityForm = rootElement.querySelector(".cityChooser");

    async function submitCity(event) {
        event.preventDefault();
        //Animation show

        const cardDiv = rootElement.querySelector(".cardPanel");
        const dailyDetails = rootElement.querySelector(".dailyDetails");
        const cityInput = rootElement.querySelector(".cityInput");
        todayCity = cityInput.value;
        const errorMsg = rootElement.querySelector(".errorMsg");

        //Handle invalid city names
        try {
            cardDiv.innerHTML = "";
            cardDiv.insertAdjacentHTML("beforeend", loadAnimationHTML())
            
            const fetchedWeather = await fetch(`${baseWeatherUrl}&q=${todayCity}&appid=${apiKey}`);
            const weatherJson = await fetchedWeather.json();
            
            let cityName = todayCity;
            let temperature = weatherJson.main.temp;
            let feelsLikeTemp = weatherJson.main.feels_like;
            let conditionText = weatherJson.weather[0].main;
            let conditionIcon = weatherJson.weather[0].icon;
            let wind = weatherJson.wind.speed;
            
            let weather = new Weather(cityName, temperature, feelsLikeTemp, conditionText, conditionIcon, wind); 
            const imageSource = await fetchBackgroundImage(cityName);
            
            //Get forecast data by lat,lon values
            const forecastData = await getForecastData(weatherJson.coord.lat, weatherJson.coord.lon);
            
            icons = [];
            temps = [];
            forecastDays = [];
            iconsH = [];
            tempsH = [];
            forecastDaysH = [];
            let historicalDaysNeeded = 0;
            let dayOfToday = new Date(forecastData[0].dt * 1000);
            let dt = 0;

            switch (dayOfToday.getUTCDay()) {
                case 2:
                    historicalDaysNeeded = 1;
                    break;
                case 3:
                    historicalDaysNeeded = 2;
                    break;
                case 4:
                    historicalDaysNeeded = 3;
                    break;
                case 5:
                    historicalDaysNeeded = 4;
                    break;
                case 6:
                    historicalDaysNeeded = 5;
                    break;
                case 7:
                    historicalDaysNeeded = 6;
                    break;
            
                default:
                    historicalDaysNeeded = 0;
                    break;
            }

            for (let i = 0; i < historicalDaysNeeded; i++) {
                dt = forecastData[0].dt - (84600 * (i + 1));
                let weekDayNumber = new Date(dt * 1000);
                const historicalData = await getHistoricalData(weatherJson.coord.lat, weatherJson.coord.lon, dt)

                iconsH.unshift(`https://openweathermap.org/img/wn/${historicalData.weather[0].icon}@4x.png`);
                tempsH.unshift(Math.round(historicalData.temp * 10) / 10);
                forecastDaysH.unshift(weekDays[weekDayNumber.getUTCDay()]);
            }

            for (let i = 1; i <= 7; i++) {
                let weekDayNumber = new Date(forecastData[i].dt * 1000);
                let weekDayNumberH = new Date(forecastData[i - 1].dt * 1000);

                icons.push(`https://openweathermap.org/img/wn/${forecastData[i].weather[0].icon}@4x.png`)
                temps.push(Math.round(forecastData[i].temp.day * 10) / 10);
                forecastDays.push(weekDays[weekDayNumber.getUTCDay()]);

                iconsH.push(`https://openweathermap.org/img/wn/${forecastData[i - 1].weather[0].icon}@4x.png`)
                tempsH.push(Math.round(forecastData[i - 1].temp.day * 10) / 10);
                forecastDaysH.push(weekDays[weekDayNumberH.getUTCDay()]);
            }

            errorMsg.classList.add("noShow");
            cardDiv.classList.remove("hideCard");
            cardDiv.innerHTML = "";
            dailyDetails.innerHTML = "";
            changeBackgroundImage(imageSource);
            cardDiv.insertAdjacentHTML("beforeend", weatherCard(weather));
            dailyDetails.insertAdjacentHTML("beforeend", dailyCards(forecastDaysH, iconsH, tempsH));
            //Animation hide

            //Style today's card
            const todayCard = Array.from(dailyDetails.children)[dayOfToday.getUTCDay() - 1];
            todayCard.classList.add("todayCard");

            //Reset input value after submit
            cityForm.reset();

            //Favorite button click
            const favBtn = document.querySelector(".favorite");

            favBtn.addEventListener("click", function (event) {
                const cityIndex = cities.findIndex((city) => city.name === cityName);
                let isInCookie = checkFavFromCookie(`${cityIndex}`);
                
                if (cities[cityIndex].isFav === false && !isInCookie) {
                    event.target.classList.add("clicked");
                    event.target.src = "images/star_fill.png";
                    cities[cityIndex].isFav = true;
                    document.cookie = `${cityIndex}=${cities[cityIndex].name};max-age=3600`
                    console.log(document.cookie);
                } else {
                    event.target.classList.remove("clicked");
                    event.target.src = "images/star_empty.png";
                    cities[cityIndex].isFav = false;
                    document.cookie = `${cityIndex}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`
                    console.log(document.cookie);
                }
            })
        } catch (error) {
            if (errorMsg.classList.length === 2) {
                errorMsg.classList.remove("noShow");
            }
        }

        //More info click event
        const moreInfoBtn = document.querySelector(".moreInfo");
        moreInfoBtn.addEventListener("click", function () {
            const dayCards = rootElement.querySelectorAll(".dayCard");
            cardDiv.classList.toggle("detailView");
            dailyDetails.classList.toggle("show");

            for (const dayCard of Array.from(dayCards)) {
                dayCard.classList.toggle("show");
            }
        })
    }
    cityForm.addEventListener("submit", submitCity);
}

window.addEventListener("load", loadEvent);