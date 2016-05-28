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
var UtciCalc = require('../logic/utciCalculator');


console.log("running weather underground cron job");

var wuUrl = require('../config/db').wundergroundUrl;
var timeZoneAddition = require('../config/db').londongTimeZoneAddition;

function getWUnderground(url, done) {
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
function processWData(wData){
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
    //utciScore = UtciCalc.calculateUtci(weatherObj);
    //console.log("utci - " + utciScore);

    //TODO -we actually don't need this at all as we're saving everything in the utci collection anyway
    myMongo.saveWeatherData(weatherObj);

    //var utciData = {};
    //utciData.time_stamp = weatherObj.time_stamp;
    //utciData.utciScore = parseInt(utciScore * 100) / 100;

    getRadFromDb(weatherObj);
    //myMongo.saveData(utciData, "utciData");
    //res.json(weatherObj);
}
function getRadFromDb(wObj){
    var utciData = wObj;
    console.log(utciData);
    utciData.utciScore  = UtciCalc.calculateUtci(wObj.temp,wObj.dew_pt,wObj.relativeHumidity,wObj.solarRadiation,wObj.wind_kph);
    utciData.pointsUtci = [];
    console.log("global utci score - " + utciData.utciScore);
    myMongo.retrieveRad(wObj.time_stamp, function(data){
        console.log(data);
        data.points_rad_percent.forEach(function(pointRad,index){
            var adjustedRad = pointRad * wObj.solarRadiation /100;
            var utciPointScore = UtciCalc.calculateUtci(wObj.temp,wObj.dew_pt,wObj.relativeHumidity,adjustedRad,wObj.wind_kph);
            utciData.pointsUtci.push(utciPointScore);
            console.log("utci" + utciPointScore);
        });
        console.log(utciData);
        myMongo.saveData(utciData, "utciMap");
    });
}
//for testing - (run directly)
//getWUnderground(wuUrl,processWData);

var CronJob = require('cron').CronJob;
//new CronJob('30 * * * * *', function() {  //every 30 seconds

new CronJob('*/5 * * * *', function() {  //every 5 minutes
    getWUnderground(wuUrl,function(wData){
        processWData(wData);
    });
    console.log('You will see this message every cron run');
}, null, true, 'Asia/Jerusalem');


//running this with forever -
//forever -a -o out.log -e err.log cron/wucron.js