var myMongo= require('./wudb');

var MongoClient = require('mongodb').MongoClient;
var dbUrl = require('../config/db').url;

var assert = require('assert');

var insertwData  = function(db,data,callback){
    db.collection('wunderground3').insertOne(data,function(err,result){
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


//TODO - refactor this in relation to mongo-tests - we need to be more sonsistent
var insertData  = function(db,table,data,callback){
    db.collection(table).insertOne(data,function(err,result){
        assert.equal(err,null);
        console.log("inserted new object to " + table + " collection");
        callback();
    });
};

exports.saveData = function(data,table) {
    console.log("saving data");
    MongoClient.connect(dbUrl,function(err,db){
        assert.equal(null,err);
        insertData(db,table,data, function(){
            db.close();
        })
        console.log("Connected to db");
    })
};

exports.retrieveRad = function(timeStamp,callback){
    MongoClient.connect(dbUrl, function(err, db) {
        db.collection('rad0528', function(err, collection) {
            //assuming that when I choose one greater than it takes the next one because they were all inserted in the right order!
            //seemed like it works but might be worth taking a second look at some point
            collection.findOne({"time_stamp":{$gt:timeStamp }},function(err, document) {
                //console.log(document.name);
                callback(document);
                db.close();
            });
        });
    });
};