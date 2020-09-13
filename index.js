	console.log('The bot is starting');

	const request = require('request');

	// For reading large image files
	const fs = require('fs');

	const path = require('path');

	// Use the Twit node package
  // https://www.npmjs.com/package/twit
	const Twit = require('twit');

	// Pull in all Twitter & Rijksmuseum account info
	// const config = require('./config');
  const config = require(path.join(__dirname, 'config.js'));

	// Make a Twit object for connection to the API
	const T = new Twit(config);

	// Concat URL
	const artURL = 'https://www.rijksmuseum.nl/api/en/collection?key=';
	const rm_api = config.api_key;
	const params = '&format=json&imgonly=true';
	const URL = artURL + rm_api + params;



	// The Art Bot
	const tweeter = () => {

    request.get(URL, getData)

    async function getData(error, response, body){
      if (!error && response && response.statusCode == 200) {
        try {
          let data = await JSON.parse(body).artObjects;
          let item = data[Object.keys(data)[0]];

          if(item.hasImage){
            console.log(item.webImage.url)
            const artImage = item.webImage.url;
            const imgTitle = item.title;
            const objectNumber = item.objectNumber;

            const fileName = `./images/${objectNumber}.jpg`;

            // save image to /images folder
            request(artImage)
              .pipe(fs.createWriteStream(fileName))
              .on('close', function(err, data, res){
                if (err){
                  console.log('line 52 >>' + err)
                } else {
                  console.log('Saved to local folder');
                }
              })

              // Read the file made
              const filePath = path.join(__dirname, fileName)
              // console.log(filePath)
              const b64content = fs.readFileSync(filePath, { encoding: 'base64' });

              T.post('media/upload', { media_data: b64content }, function(err, data, res){
                if(error){
                  console.error('things go wrong here >>' + error)
                } else {
                  console.log('ok');
                  const mediaIdStr = data.media_id_string
                  const altText = imgTitle;
                  const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

                  T.post('media/metadata/create', meta_params, function (err, data, response) {
                    const params = { status: imgTitle, media_ids: [mediaIdStr] }

                    T.post('statuses/update', params, function (err, data, response) {
                      console.log(data)
                    })
                  })
                }
              })

          } else {
            console.log('there is no image')
          }
        } catch (error) {
          console.error(error);
        }
      } // end of if statement
    }
    getData()
  }

  // Start one time
  tweeter();

  // Once every four hours
  // setInterval(tweeter, 4*60*60*1000)
  // setInterval(tweeter, 15*60*1000)
