	console.log('The bot is starting');

	const request = require('request');

	// For reading large image files
	const fs = require('fs');

	const path = require('path');

	// Use the Twit node package
  // https://www.npmjs.com/package/twit
	const Twit = require('twit');

	// Pull in all Twitter & Rijksmuseum account info
	const config = require('./config');

	// Make a Twit object for connection to the API
	const T = new Twit(config);

	// Concat URL
	const artURL = 'https://www.rijksmuseum.nl/api/en/collection?key=';
	const rm_api = config.api_key;
	const params = '&format=json&imgonly=true';
	const URL = artURL + rm_api + params;

	Array.prototype.pick = function(){
		return this[Math.floor(Math.random()*this.length)];
	};

	// The Art Bot
	const tweeter = () => {
		request.get({
			uri: URL,
			encoding: 'binary'
		},
		function getData(err, res, body){
			const data = JSON.parse(body).artObjects.pick();
			console.log('Saving image to folder...');
			console.log('data: ', data)

			const random_image = data.webImage.url; // the image and the title are not matched
			const	random_title = data.longTitle; // title is one bot post ahead
			console.log(random_image)
			console.log(random_title)

			const fileName = 'downloaded.jpg';
			// const filePath = path.join(__dirname, './' + fileName)

      // console.log('File path here: ', fileName)

			const stream = fs.createWriteStream(fileName);
			request(random_image).pipe(stream).on('close', function(err, data, res){
				if (err){
					console.log('line 56 >>' + err)
				} else {
					console.log('Saved to local folder');
				}
			});

      // Read the file made
			const b64content = fs.readFileSync('./images/downloaded.jpg', { encoding: 'base64' });

			T.post('media/upload', { media_data: b64content }, function(err, data, res){
				if (err){
					console.log('things go wrong here >>' + err)
				} else {
					console.log('ok');
					const mediaIdStr = data.media_id_string
				  const altText = random_title;
				  const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

					T.post('media/metadata/create', meta_params, function (err, data, response) {
						const params = { status: random_title, media_ids: [mediaIdStr] }

						T.post('statuses/update', params, function (err, data, response) {
			        console.log(data)
			      })
					});
				}
			});

		});
	}

  // Start one time
  tweeter();

  // Once every four hours
  setInterval(tweeter, 4*60*60*1000)
