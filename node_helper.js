'use strict';

/* Magic Mirror
 * Module: mmm-nordealunch
 *
 * By Henrik Linder
 */

const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');

module.exports = NodeHelper.create({

	start: function () {
		this.started = false;
		this.config = null;

	},

	getData: function () {
		var d = new Date();
		console.log("NORDEA    getData initited " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());

		var self = this;

		request({
			url: this.getUrl(),
			method: 'GET',
		}, function (error, response, body) {

			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			} else {
				//retry in a bit:
				setTimeout(function () { self.getData(); }, 600000); //retry in 10 minutes
			}
		});


		//Set a timer to update at the configured time
		var dNow = new Date();
		var dUpdate = new Date();
		dUpdate.setHours(this.config.cutoverTime, 0, 0, 0);

		var timeDiff = dUpdate - dNow;
		if (timeDiff < 0)
			timeDiff += 24 * 60 * 60 * 1000; //we're past the time, so move on to next day

		setTimeout(function () { self.getData(); }, timeDiff);
		console.log("Update timer set", timeDiff);

	},




	socketNotificationReceived: function (notification, payload) {
		var self = this;
		if (notification === 'CONFIG') {
			self.config = payload;
			self.started = true;
		}
		if (notification === 'GETDATA') {
			self.getData(); //retrieve data and send back to module front-end
		}

	},
	getUrl() {
		switch (this.config.location) {
			case 'Lindhagen':
				return 'http://nordea-sweden.web06.secoya.dk/cafe-lindhagen';
				break;
			case 'HermesHus':
				return 'http://nordea-kantine.web06.secoya.dk/kantinerne/hermes-hus';
				break;
			case 'Christiansbro':
				return 'http://nordea-kantine.web06.secoya.dk/kantinerne/christiansbro';
				break;
			case 'Vesterport':
				return 'http://nordea-kantine.web06.secoya.dk/kantinerne/vesterport';
				break;
			case 'Metro':
				return 'http://nordea-kantine.web06.secoya.dk/kantinerne/metro';
				break;
			case 'Fredericia':
				return 'http://nordea-kantine.web06.secoya.dk/kantinerne/fredericia';
				break;
			case 'Aarhus':
				return 'http://nordea-kantine.web06.secoya.dk/kantinerne/aarhus';
				break;
			default: //Stockholm
				return 'http://nordea-sweden.web06.secoya.dk/restaurang-nordic-light';

			//to do, Finland: http://nordea-finland.web06.secoya.dk/vallila/vallila
			// Norway: http://nordea-norway.web06.secoya.dk/iss-service-portal/kantinen-parken
		}
	}
});