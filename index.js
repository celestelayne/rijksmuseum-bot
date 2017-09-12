console.log('The bot is starting');

var request = require('request');

// For reading large image files
var fs = require('fs');

var path = require('path');

// Use the Twit node package
var Twit = require('twit');

// Pull in all Twitter & Rijksmuseum account info
var config = require('./config');

// Make a Twit object for connection to the API
var T = new Twit(config);

// Concat URL
var artURL = 'https://www.rijksmuseum.nl/api/en/collection?key=';
var rm_api = config.api_key;
var params = '&format=json&ps=10&imgonly=true';
var URL = artURL + rm_api + params;

Array.prototype.pick = function(){
	return this[Math.floor(Math.random()*this.length)];
};

	request.get({
		uri: URL,
		encoding: 'binary'
	},
	function getData(err, res, body){
		var data = JSON.parse(body).artObjects.pick();
		// console.log('Saving image to folder...')

		var random_image = data.webImage.url;
		console.log(random_image)
		// fs.writeFile('downloaded.jpg', random_image, 'binary', function (err) {});

	});
