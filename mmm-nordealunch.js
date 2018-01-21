/* global Module */

/* Magic Mirror
 * Module: mmm-nordealunch
 */



Module.register('mmm-nordealunch', {

	defaults: {
		animationSpeed: 1000,

		lang: config.language,

		location: 'Stockholm', // Valid options: Stockholm, Lindhagen, HermesHus, Christiansbro, Vesterport, Metro, Fredericia, Aarhus.
		cutoverTime: 19, //At what hour should tomorrow's menu be displayed instead of today's. Valid values 0-23.
		maxWidth: "100%"	// Any valid css width, eg 100%, 200px, etc
	},

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	getStyles: function () {
		return ['mmm-nordealunch.css'];
	},

	start: function () {
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.sendSocketNotification('CONFIG', this.config);
	},

	getDom: function () {
		//console.log("getDom start");

		var nordeaDiv = document.createElement("div");
		nordeaDiv.style.maxWidth = this.config.maxWidth;


		if (this.menuContentDisplay == null) {
			this.sendSocketNotification('GETDATA');

			nordeaDiv.innerHTML = this.translate('LOADING NORDEA MENU');
			nordeaDiv.className = "dimmed light small";
		} else {
			nordeaDiv.innerHTML = this.menuContentDisplay;
			nordeaDiv.className = "bright light small";
		}

		return nordeaDiv;
	},

	processRawMenu: function (data) {

		//var rightNow = new Date(2018, 0, 19, 16, 0, 0, 0);
		var rightNow = new Date();

		//console.log(rightNow);


		var weekToDisplay = rightNow.getWeek();
		var dayToDisplay = rightNow.getDay(); 

		//console.log("initial week/day", weekToDisplay, dayToDisplay);

		//adjust day to Mon=0, Tue=1, etc
		if (dayToDisplay === 0)
			dayToDisplay = 6;
		else
			dayToDisplay--;

		//console.log("adjusted week/day", weekToDisplay, dayToDisplay);

		//if today is Sat or Sun, display Monday instead
		if (dayToDisplay > 4) {
			dayToDisplay = 0;
			weekToDisplay++;
		} else { //if time is past the cutover, show next day instead:
			if (rightNow.getHours() >= this.config.cutoverTime) {
				dayToDisplay++;
				if (dayToDisplay > 4) {
					dayToDisplay = 0;
					weekToDisplay++;
				}
			}
		}

		//console.log("adjusted week/day", weekToDisplay, dayToDisplay);

		var dayDivId = "w" + weekToDisplay + "-" + dayToDisplay;

		//console.log("day to display",dayDivId);


		var document2 = document.implementation.createHTMLDocument('newDoc');
		document2.documentElement.innerHTML = data;
		var dayRows = document2.getElementById(dayDivId).childNodes;

		var dayDivKeep = 'Menu contents goes here';

		// Depending on location, we need different rows
		switch (this.config.location) {
			case 'Stockholm':
				if (dayRows.length < 6) { //sometimes only 2 items are displayed
					dayDivKeep = dayRows[1].childNodes[4].innerHTML + "<br>" +
						dayRows[3].childNodes[4].innerHTML;
				} else {
					dayDivKeep = dayRows[1].childNodes[4].innerHTML + "<br>" +
						dayRows[3].childNodes[4].innerHTML + "<br>" +
						dayRows[5].childNodes[4].innerHTML + "<br>" +
						dayRows[7].childNodes[4].innerHTML;
				}
				break;
			case 'Lindhagen':
				dayDivKeep = dayRows[1].childNodes[4].innerHTML + "<br>" +
					dayRows[3].childNodes[4].innerHTML;
				break;
			case 'HermesHus':
			case 'Christiansbro':
			case 'Vesterport':
			case 'Metro':
			case 'Fredericia':
			case 'Aarhus':
				dayDivKeep = dayRows[1].childNodes[4].innerHTML + "<br>" +
					dayRows[2].childNodes[4].innerHTML + "<br>" +
					dayRows[3].childNodes[4].innerHTML;

				break;

		}
		this.menuContentDisplay = dayDivKeep;



		return;
	},



	socketNotificationReceived: function (notification, payload) {

		console.log("socketNotificationReceived: " + notification);

		if ((notification === "STARTED") || (notification === "DOM_OBJECTS_CREATED")) {
			this.updateDom();
		}
		else if (notification === "DATA") {
			this.loaded = true;
			this.processRawMenu(payload);
			this.updateDom();
		}



	}



});

//Helper functions

// Returns the ISO week of the date.
Date.prototype.getWeek = function () {
	var date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
		- 3 + (week1.getDay() + 6) % 7) / 7);
}

