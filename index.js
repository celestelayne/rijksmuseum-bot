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

	// Once every four hours
	setInterval(tweeter, 4*60*60*1000)

	Array.prototype.pick = function(){
		return this[Math.floor(Math.random()*this.length)];
	};

	// The Art Bot
	function tweeter(){
		request.get({
			uri: URL,
			encoding: 'binary'
		},
		function getData(err, res, body){
			var data = JSON.parse(body).artObjects.pick();
			console.log('Saving image to folder...');
			console.log(data)

			var random_image = data.webImage.url; // the image and the title are not matched
			var	random_title = data.longTitle; // title is one bot post ahead
			console.log(random_image)
			console.log(random_title)

			var fileName = 'downloaded.jpg';
			var filePath = path.join(__dirname, './' + fileName)
			
			var stream = fs.createWriteStream(filePath);
			request(random_image).pipe(stream).on('close', function(err, data, res){
				if (err){
					console.log('line 56 >>' + err)
				} else {
					console.log('Saved to local folder');
				}
			});			

			var b64content = fs.readFileSync(filePath, { encoding: 'base64' });

			T.post('media/upload', { media_data: b64content }, function(err, data, res){
				if (err){
					console.log('things go wrong here >>' + err)
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
	}