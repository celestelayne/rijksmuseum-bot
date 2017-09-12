console.log('The bot is starting');

var request = require('request');

// Use the Twit node package
var Twit = require('twit');

// Pull in all Twitter & Rijksmuseum account info
var config = require('./config');

// Make a Twit object for connection to the API
var T = new Twit(config);

// Concat URL
var artURL = 'https://www.rijksmuseum.nl/api/en/collection?key=';
var api_key = 'A8AOseGS';
var params = '&format=json&ps=10&imgonly=true';
var URL = artURL + api_key + params;

	request.get({
		uri: URL
	},
	function getData(err, res, body){
		var data = JSON.parse(body).artObjects;
		console.log(data);
	});
