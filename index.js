console.log('The bot is starting');

var Twit = require('twit');
var config = require('./config');
// console.log(config)
var T = new Twit(config);

T.post('statuses/update', { status: 'hello this is a test form the rijksmuseum bot' }, function(err, data, response) {
  console.log(data)
});