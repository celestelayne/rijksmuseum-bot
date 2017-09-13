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
	var params = '&format=json&imgonly=true';
	var URL = artURL + rm_api + params;

	// Start one time
	tweeter();

	// Once every 

	Array.prototype.pick = function(){
		return this[Math.floor(Math.random()*this.length)];
	};

	request.get({
		uri: URL,
		encoding: 'binary'
	},
	function getData(err, res, body){
		var data = JSON.parse(body).artObjects.pick();
		console.log('Saving image to folder...');
		console.log(data)

		var random_image = data.webImage.url;
		var	random_title = data.title;
		// console.log(random_image)

		var stream = fs.createWriteStream('images/downloaded.jpg');

		stream.on('close', function(){
			console.log('done');
		});
		var r = request(random_image).pipe(stream);

		var b64content = fs.readFileSync('images/downloaded.jpg', { encoding: 'base64' });

		console.log('Uploading an image...');

		T.post('media/upload', { media_data: b64content }, function(err, data, res){
			if (err){
				console.log(err)
			} else {
				console.log('ok');
				var mediaIdStr = data.media_id_string
			  var altText = random_title;
			  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

				T.post('media/metadata/create', meta_params, function (err, data, response) {
					var params = { status: random_title, media_ids: [mediaIdStr] }

					T.post('statuses/update', params, function (err, data, response) {
		        console.log(data)
		      })
				});
			}
		});

	});
