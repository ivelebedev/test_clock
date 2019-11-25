import 'babel-polyfill';
import Clock from './clock.js';

import './../sass/styles.scss';

const cities = [
	{
		title: "Москва",
		timezone: "Europe/Moscow"
	},
	{
		title: "Куала-Лумпур",
		timezone: "Asia/Kuala_Lumpur"
	},
	{
		title: "Детройт",
		timezone: "America/Detroit"
	}
];

const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

const times = {
	counter: 0,
	index: 0,
	syncTime: new Date(),
	currentTime: new Date(),
	formatTime: false
}

const app = {
	api: 'http://worldtimeapi.org/api/timezone/',
	width: 480,
	height: 480,
	offset: 30,
	tickInterval: 1000,
	syncInterval: 1000 * 60 * 5
}

let tickTimer = null;
let syncTimer = null;

const clock = new Clock(document.getElementById("canvas"), app.width, app.height, app.offset);

const getDate = async (timezone) => {
	try {
		loaderSwitch();
		const response = await fetch(`${app.api}${timezone}`);
		const json = await response.json();
		return json;
	} catch (error) {
		throw new Error('No response, date is local');
	}
}

const syncDate = () => {

    let date = getDate(cities[times.index].timezone).then((response) => {
		
		loaderSwitch();
		let targetDate = new Date(response.utc_datetime);
		let timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60;
		let offsets = response.dst_offset * 1000 + response.raw_offset * 1000;
        times.syncTime = new Date(timestamp * 1000 + offsets);

		times.currentTime = times.syncTime;
		times.counter = 0;
		
	}, (reason) => {
		
		loaderSwitch();
		times.syncTime = new Date();
		times.currentTime = times.syncTime;
		times.counter = 0;
		
	});
}

const formatDate = (date) => {
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	let ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; 
	minutes = minutes < 10 ? '0'+minutes : minutes;

	return `${hours}:${minutes}:${seconds} ${ampm}`;
}

const tick = () => {
	times.counter += app.tickInterval;
	times.currentTime = new Date(times.syncTime.getTime() + times.counter);
	let seconds = times.currentTime.getSeconds();
	let hours = times.currentTime.getHours();
	let minutes = times.currentTime.getMinutes();
	
	let htmlTime = times.formatTime ? formatDate(times.currentTime) : `${hours}:${minutes}:${seconds}`;
	
	document.getElementById("city").innerHTML = cities[times.index].title;
	document.getElementById("time").innerHTML = htmlTime;
	document.getElementById("date").innerHTML = times.currentTime.toLocaleDateString();
	document.getElementById("day").innerHTML = days[times.currentTime.getDay()];
	
	document.title = `Время: ${htmlTime}`;
	
	clock.render(hours, minutes, seconds);
}

const loaderSwitch = () => {
	const loader = document.getElementById("sync");
	if (loader.classList.contains("active")) {
		setTimeout(() => loader.classList.remove("active"), 1000);
	}else{
		loader.classList.add("active");
	}
}

const init = () => {
	
	syncDate();
	
	tickTimer = setInterval(tick, app.tickInterval);
	syncTimer = setInterval(syncDate, app.syncInterval);
	
	document.getElementById("change").addEventListener("click", function (e) {
		times.formatTime = times.formatTime === false ?  true : false;
	});

	document.body.addEventListener("click", function (e) {
		e.preventDefault();
		const target = e.target;
		if (target.classList.contains("menu__link")) {
			let link = this.querySelector('.menu__link--active')
			if (link) {
				link.classList.remove('menu__link--active')
			}
			target.classList.add("menu__link--active");
			times.index = target.getAttribute("href").substr(1);
			syncDate(times.index);
		}
	});
}

init();