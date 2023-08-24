// var geo = document.getElementById('location');
// var btn = document.querySelector('#btnClick').addEventListener('click',getLocation);
// function getLocation(){
//     if(navigator.geolocation){
//         navigator.geolocation.getCurrentPosition(showPosition);
//
//     }else{
//         geo.innerHTML = "Geolocation is not supported by this browser!";
//     }
// }
//
// function showPosition(position){
//     geo.innerHTML = "Latitude: "+position.coords.latitude + "<br>Longtitude:" + position.coords.longitude;
//     console.log(geo);
//
//     fetch('http://www.7timer.info/bin/astro.php?lon=113.17&lat=23.09&ac=7&lang=en&unit=metric&output=internal&tzshift=0&output=json')
//         .then(resolve => resolve.json())
//         .then(data => console.log(data))
//         .catch(err => console.log("Error occur", err));
// }
const locations = document.querySelector('#dropdown');
var selectOption = 0;
var timeZones = 0;
var name = '';
var latlng = '';
var locationList = [];

const locationSelect = document.querySelector('#dropdown');
const optionSelected = document.querySelector('.selectedOption');
const displayForestObj = document.querySelector('.displayForest');

var uniqueForestForEachDay = [];
var dayOfWeek = ['Monday ', 'Tuesday ', 'Wednesday ', 'Thursday ', 'Friday ','Saturday ','Sunday '];
var forestData = [];
let currentTime = new Date().getHours();
const err = document.querySelector('.error_display');
function displayOptions(){
    locationList.forEach(obj => {
        locations.innerHTML+=`<option value=${obj.selectOption} data-timezone = ${obj.time} data-latlog = ${obj.latLog}>${obj.name}</option>`;
    })
}
function getAllLocations(){
    fetch('https://restcountries.com/v3.1/all')
        .then(data => data.json())
        .then(data => {
            console.log(data[0]);
            // console.log(data[0].name.official);
            for(let i = 0; i < data.length; i++){
                selectOption = i;
                timeZones = data[i].timezones;
                name = data[i].name.official;
                latlng = data[i].capitalInfo.latlng;
                var obj = {selectOption: selectOption, time:timeZones, name:name, latLog:latlng};
                locationList.push(obj);
            }

            displayOptions();
        })
        .catch(err => console.log('Cant fetch all countries.', err.message));
}
getAllLocations();

locationSelect.addEventListener('change', function (){
    const selectedOption = locationSelect.options[locationSelect.selectedIndex];
    const selectedLocation = selectedOption.textContent;
    const time = selectedOption.dataset.timezone;
    const latlog = selectedOption.dataset.latlng;
    const latlogList = selectedOption.dataset.latlog.split(',');
    optionSelected.innerHTML = `<h2 class = text>Your choosen county: ${selectedLocation}, Timezone: ${time}, Latlog: ${latlng[0]} ${latlng[1]}</h2>`;
    showPosition(latlogList[0],latlogList[1]);
    clearForest(displayForestObj);
    clearForest(err);
    uniqueForestForEachDay = [];
    locationList = [];
    forestData = [];

})

function showPosition(longitude,latitude){
    fetch(`https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civil&output=json`)
        .then(resolve => resolve.json())
        .then(data => {
            const ForestData = data.dataseries;
            ForestData.forEach((dayForest, index)=>{
                var i = 0;
                const dayOfForest = Math.floor(dayForest.timepoint / 25);
                const prectype = dayForest.prec_type;
                const timepoint = dayForest.timepoint;
                const temperature = dayForest.temp2m;
                var obj = {prectype:prectype, timepoint:timepoint, temperature:temperature, dayOfForest:dayOfForest};
                forestData.push(obj);

            })
            showForecast();
        })
        .catch(err=>{
            err.innerHTML = `
        
    <h2 style="color: #3D405B; > <span class="error" style="color: #CD2335">ERROR OCCUR!</span>Currently we can not serve you with wheather informations!</h2>
    <img src="cloud-connection.png" width="200" height="200"/>`
        });
}

function showForecast(){
    var lastDay = null;
    let count = 0;
    forestData.forEach(day => {
        var currDay = day.dayOfForest;
        if(day.dayOfForest !== lastDay){
            count++;
            lastDay = currDay;
            if(count < 7){
                uniqueForestForEachDay.push(day);
            }
        }
    })
    displayForest();
}

function displayForest(){
    var count = 0;
    console.log("LENGTH",uniqueForestForEachDay.length);
    uniqueForestForEachDay.forEach(day => {
        var src = null;

        if(day.prectype == 'none' && day.temperature > 20){
            src = 'weather%20graphic/sun.png'
        }else if(day.prectype == 'none' && day.temperature <= 20 && day.temperature >= 0){
            src = 'weather%20graphic/cloudy.png'
        }else if(day.prectype == "none" && day.temperature < 0) {
            src = 'weather%20graphic/snow.png'
        }else if(day.prectype == 'snow'){
            src = 'weather%20graphic/snow.png'
        }else if(day.prectype == "rain"){
            src = 'weather%20graphic/rain.png'
        }else if(day.prectype == 'storm'){
            src = 'weather%20graphic/storm.png'
        }else if(day.prectype == 'wind'){
            src = 'weather%20graphic/windy.png'
        }

        var displayDiv = `
        <div class=day>
        <h1>${dayOfWeek[count]}</h1>
        <img src = ${src} width="100" height="100"/>
            <p class="temp">${day.temperature} °C</p>
        </div>`;
        displayForestObj.innerHTML += displayDiv;

        count++;
    });
}
function clearForest(element){
    element.innerHTML = '';
}

