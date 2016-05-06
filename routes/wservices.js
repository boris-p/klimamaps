var express = require('express');
var router = express.Router();
var myMongo= require('../mongo_tests');

/* GET Hello World page. */
router.get('/helloworld1', function(req, res) {
    //res.json({ a: 1 }); if one wanted to send json
    res.render('helloworld', { title: 'Hello, hexagon World!' });
});

/* GET Userlist page. */
router.get('/weatherdata', function(req, res) {
    var startTime = parseInt(req.query['start'] || 0);
    console.log(startTime);
        myMongo.retrievewUnderground(startTime,function(weatherData){
        res.json(weatherData);
    });
})
/* GET rhino data - later this will be radiation only (probably). */
router.get('/rhinodata', function(req, res) {
    var startTime = parseInt(req.query['start'] || 0);
    console.log(startTime);
    myMongo.retrieveRhinoData(startTime,function(rhinoData){
        res.json(rhinoData);
    });
})

router.get('/weather', function(req, res) {
    var wUnderground= require('../wunderground');
    //var url ="http://api.wunderground.com/api/ec8d43ee5e79c981/conditions/q/pws:ILONDON297.json"; // closest but no solar radiation
    var url = "http://api.wunderground.com/api/ec8d43ee5e79c981/conditions/q/pws:IENGLAND1059.json";

    wUnderground.getWUnderground(url,function(wData){
        //console.log(body);
        var weatherObj = {};

        weatherObj.location = wData['current_observation']['display_location']['city'];
        weatherObj.dew_pt = wData['current_observation']['dewpoint_c'];
        weatherObj.solarRadiation = wData['current_observation']['solarradiation'];
        weatherObj.temp = wData['current_observation']['temp_c'];
        weatherObj.relativeHumidity = wData['current_observation']['relative_humidity'];
        weatherObj.wind_kph = wData['current_observation']['wind_kph'];
        console.log(wData['current_observation']['temp_c']);
        //res.json(body);
        res.json(weatherObj);
    });
})
module.exports = router;
