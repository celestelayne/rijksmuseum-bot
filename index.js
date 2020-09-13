	console.log('The bot is starting');

	const request = require('request');

	// For reading large image files
	const fs = require('fs');

	const path = require('path');

	// Use the Twit node package
  // https://www.npmjs.com/package/twit
	const Twit = require('twit');

	// Pull in all Twitter & Rijksmuseum account info
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

            const fileName = `${objectNumber}.jpg`;

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

              // Read the content from the images folder
              const filePath = path.join(__dirname, `images/${fileName}`)
              const b64content = fs.readFileSync(`images/${fileName}`, { encoding: 'base64' });

              console.log('uploading the image')

              // upload image to Twitter
              T.post('media/upload', { media_data: b64content }, function(err, data, res){
                if(err){
                  console.error('things go wrong here >>' + err)
                } else {
                  // console.log('image uploaded, now tweeting: ' + data);
                  const mediaIdStr = data.media_id_string
                  const altText = imgTitle;
                  const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

                  T.post('media/metadata/create', meta_params, function (err, data, response) {
                    const params = { status: imgTitle, media_ids: [mediaIdStr] }

                    // post a tweet with the image
                    T.post('statuses/update', params, function (err, data, response) {
                      if(err){
                        console.error(err)
                      } else {
                        console.log('posted an image')

                        fs.unlink(filePath, function(err){
                          if(err){
                            console.log(err + ' unable to delete image: ' + filePath)
                          } else {
                            console.log('image: ' + filePath + ' was deleted.')
                          }
                        })
                      }
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
  setInterval(tweeter, 4*60*60*1000)
