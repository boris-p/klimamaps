/**
 * Created by boris on 5/18/2016.
 * TODO - delete this
 */

var myMongo= require('./mongo_tests');


function getRadiationData(cb){
    //here using the values for 17th of may to return just that one day
    myMongo.retrieveRhinoDataClamp(1463443200,1463529600 ,function(rhinoData){
        cb(rhinoData);
    });
}

function getPoints(rhinoData, callback){
    rhinoData.forEach(function(element, index){
        console.log(element.points_rad);
    });
    var pointVals = [];
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('data/points.pt')
    });
    var total = 0;
    lineReader.on('line', function (line) {
        var splitted = line.split(",");
        console.log(splitted[1].length);
        total += splitted[1].length;

        for (var column = 0; column < splitted[1].length; column++) {
            pointVals.push(parseInt(splitted[1][column]));
        }
    }).on('close',function(){
        console.log(total);
        getRelaventRadiation(pointVals,rhinoData,callback);
    });
}
function getRelaventRadiation(pointList,radiationData,cb){
    var newRadTotalVals = [];
    radiationData.forEach(function(radItem){
        console.log(radItem);
        var newRadTimeVals = {};
        newRadTimeVals.time_stamp = radItem.time_stamp;
        newRadTimeVals.pointVals = [];
        pointList.forEach(function(element,index){
            if (element == 2){
                newRadTimeVals.pointVals.push(radItem.points_rad[index]);
            }
        });
        newRadTotalVals.push(newRadTimeVals);
        console.log(newRadTimeVals.length);
    })
    cb(newRadTotalVals);
}

//function getData(callback){
exports.getData = function(callback){
    console.log("test");
    var rd = getRadiationData(function(rhinoData){
        getPoints(rhinoData,callback);
        //return rhinoData;
    });
}