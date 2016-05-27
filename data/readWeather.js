/**
 * Created by boris on 5/18/2016.
 */

var myMongo= require('./../cron/wudb');

var lineReader = require('readline').createInterface({
    //input: require('fs').createReadStream('data/17.5.2016_ilondon1364_weather.dt')
    input: require('fs').createReadStream('data/wu_may_data.dt')
});

lineReader.on('line', function (line) {
    //console.log('Line from file:', line);
    var splitted = line.split(",");

    var weatherData = {};
    
    weatherData.dew_pt =  parseFloat(splitted[2]);
    weatherData.relativeHumidity = parseInt(splitted[8]);
    weatherData.solarRadiation = parseInt(splitted[13]);
    weatherData.temp = parseFloat(splitted[1]);
    var d = new Date(splitted[0]).getTime();
    weatherData.time_stamp = d/1000;
    //console.log(weatherData.time_stamp);
    weatherData.wind_kph = parseFloat(splitted[6]);

    myMongo.saveWeatherData(weatherData);
    //console.log(weatherData.temp);
    //var str = JSON.stringify(weatherData);

    /*
    fs = require('fs');
    fs.appendFile('data/weatherWrite.json', JSON.stringify(weatherData), function (err) {
        if (err) throw err;
    console.log('The "data to append" was appended to file');
    });
    */

});