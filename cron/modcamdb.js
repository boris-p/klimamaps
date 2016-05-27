var MongoClient = require('mongodb').MongoClient;
var dbUrl = require('../config/db').url;

var assert = require('assert');

var insertmcData  = function(db,data,callback){
    db.collection('modcam').insertOne(data,function(err,result){
        assert.equal(err,null);
        console.log("inserted modcam data from the modcam api");
        callback();
    });
};

exports.savemodcamData = function(data) {
    console.log("saving data");
    MongoClient.connect(dbUrl,function(err,db){
        assert.equal(null,err);
        insertmcData(db,data, function(){
            db.close();
        })
        console.log("Connected to db");
    })
};