var myMongo= require('./wudb');

var MongoClient = require('mongodb').MongoClient;
var dbUrl = require('../config/db').url;

var assert = require('assert');

var insertwData  = function(db,data,callback){
    db.collection('wunderground1').insertOne(data,function(err,result){
        assert.equal(err,null);
        console.log("inserted weather data from weather underground");
        callback();
    });
};

exports.saveWeatherData = function(data) {
    console.log("saving data");
    MongoClient.connect(dbUrl,function(err,db){
        assert.equal(null,err);
        insertwData(db,data, function(){
            db.close();
        })
        console.log("Connected to db");
    })
};