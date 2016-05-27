/**
 * Created by boris on 4/30/2016.
 */

/*
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('hello world\n');
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');
*/
var request = require('request');
var myMongo= require('./wudb');


console.log("running weather underground cron job");

var getWUnderground = function(url, done) {
    console.log(url);
    request(url, function(err, res, body) {
        //console.log(body);
        if (err) {
            console.log(err);
            return done(-1);
        }
        //if (res.statusCode !== 200) return done(new Error('Returned: ' + res.statusCode));
        if (res.statusCode !== 200) return done(res.statusCode);
        if (body) {
            try {
                body = JSON.parse(body);
                if (body.response.error) return done(body.response.error.description);
                else return done(body);
            } catch (e) {
                console.log(e);
                return done(-1);
            }
        }
    });
}

var wuUrl = require('../config/db').wundergroundUrl;
var timeZoneAddition = require('../config/db').londongTimeZoneAddition;

var CronJob = require('cron').CronJob;
//new CronJob('30 * * * * *', function() {  //every 30 seconds
new CronJob('*/5 * * * *', function() {  //every 5 minutes
    getWUnderground(wuUrl,function(wData){
        var weatherObj = {};
        //console.log(wData);
        //weatherObj.location = wData['current_observation']['display_location']['city'];
        weatherObj.dew_pt = parseFloat(wData['current_observation']['dewpoint_c']);
        weatherObj.solarRadiation = parseInt(wData['current_observation']['solarradiation']);
        weatherObj.temp = parseFloat(wData['current_observation']['temp_c']);
        weatherObj.relativeHumidity = parseInt(wData['current_observation']['relative_humidity']);
        weatherObj.wind_kph = parseFloat(wData['current_observation']['wind_kph']);
        //make sure the time zone offset is correct (i assume +1 for london)
        weatherObj.time_stamp = parseInt(wData['current_observation']['local_epoch']) + timeZoneAddition;
        console.log(weatherObj);
        myMongo.saveWeatherData(weatherObj);
        //res.json(weatherObj);
    });
    console.log('You will see this message every cron run');
}, null, true, 'Asia/Jerusalem');

//running this with forever -
//forever -a -o out.log -e err.log cron/wucron.js