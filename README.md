# mmm-nordealunch
Displays Nordea canteen menus on your MagicMirror.

## Installation instructions

* Go to the `~/MagicMirror/modules` directory.
* Run `git clone https://github.com/HenrikL6/mmm-nordealunch.git`
* Add config entry (see below)


## Config.js entry and options

		{
			module: "mmm-nordealunch",
			header: 'Nordea lunch',
			position: "bottom_center",
			config: {
				location: 'Stockholm', // Valid options: Stockholm, Lindhagen, HermesHus, Christiansbro, Vesterport, Metro, Fredericia, Aarhus
				cutoverTime: 19, 	// At what hour should tomorrow's menu be displayed instead of today's. Valid values 0-23.
				maxWidth: "100%"	// Any valid css width, eg 100%, 200px, etc
			}
		},

## Notes
Currently supports Sweden and Denmark. Norway and Finland can be added if there's a demand for it.
All information displayed is publicly available. No connection to the Nordea internal network is established.