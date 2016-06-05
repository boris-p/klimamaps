/**
 * Created by boris on 4/9/2016.
 */
var MongoClient = require('mongodb').MongoClient;
var dbConfig = require('./config/db');
var assert = require('assert');

var insertDocument  = function(db,callback){
    db.collection('customers').insertOne({
        "_id" : 3,
        "name" : "John",
        "last_name": "Lock",
        "age" : 28
    },function(err,result){
        assert.equal(err,null);
        console.log("inserted a document into the customers collection");
        callback();
    });
};

var findCustomers = function(db, callback) {
    //var cursor =db.collection('customers').find( {});
    //var cursor =db.collection('customers').find( {age:26}); // search with special parameters
    //var cursor =db.collection('customers').find( {age:{$gt:26 }}); // search with conditions
    var cursor =db.collection('customers').find().sort({age:1}); // sort results - 1 ascending, -1 descending
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            console.dir(doc);
        } else {
            callback();
        }
    });
};

exports.retrieveCustomersNew = function(age,callback){
    //var url = "mongodb://username:password@localhost:27017/exampledatabase",
    console.log("test");
    console.log(age);
    console.log(dbConfig.url);
    MongoClient.connect(dbConfig.url, function(err, db) {
        db.collection('customers', function(err, collection) {
            collection.find({"age":{$gt:age }}).toArray(function(err, users) {
                // console.log(users);
                callback(users);
                db.close();
            });
        });
    });
};

exports.retrievewUnderground = function(timeStamp,callback){
    //var url = "mongodb://username:password@localhost:27017/exampledatabase",
    //db.wunderground.find({time_stamp:{$gt:1462035013}})
    console.log(timeStamp);
    console.log(dbConfig.url);
    MongoClient.connect(dbConfig.url, function(err, db) {
        db.collection('wunderground', function(err, collection) {
            collection.findOne({"time_stamp":{$gt:timeStamp }},function(err, document) {
                //console.log(document.name);
                 console.log(document);
                callback(document);
                db.close();
            });
        });
    });
};
exports.retrieveRhinoData = function(timeStamp,callback){
    //FYI - Paging can be achieved with option parameters limit and skip
    MongoClient.connect(dbConfig.url, function(err, db) {
        db.collection('rhinoRadiation', function(err, collection) {
            collection.find({"time_stamp":{$gt:timeStamp }},{"limit":200}).toArray(function(err, results) {
                // console.log(users);
                callback(results);
                db.close();
            });
        });
    });
};

//TODO - not using it. delete
exports.retrieveRhinoDataClamp = function(start,end, callback){
    MongoClient.connect(dbConfig.url, function(err, db) {
        db.collection('rhinoRadiation', function(err, collection) {
            collection.find({"time_stamp":{$gt: start, $lt :end }}).toArray(function(err, results) {
                // console.log(users);
                callback(results);
                db.close();
            });
        });
    });
};
exports.retrieveUtci = function(start,end, callback){
    MongoClient.connect(dbConfig.url, function(err, db) {
        db.collection('utciMap', function(err, collection) {
            collection.find({"time_stamp":{$gt: start, $lte :end }}).sort({"time_stamp":1}).toArray(function(err, results) {
                callback(results);
                db.close();
            });
        });
    });
};
exports.retrieveModcamData = function(timeStamp,callback){
    console.log("retrieving modcam data");
    MongoClient.connect(dbConfig.url, function(err, db) {
        db.collection('modcam', function(err, collection) {
            collection.findOne({"time_stamp":{$gt:timeStamp }},function(err, document) {
                console.log(err);
                console.log(document);
                callback(document);
                db.close();
            });
        });
    });
};

exports.retrieveCustomers = function(){
    MongoClient.connect(dbConfig.url, function(err, db) {
    assert.equal(null, err);
    findCustomers(db, function() {
        db.close();
    });
});
};

function connectToMongo(){
    MongoClient.connect(dbConfig.url,function(err,db){
        assert.equal(null,err);
        insertDocument(db,function(){
            db.close();
        })
        console.log("Connected to server, all is good");
    })
}


exports.saveSomeData = function(str) {
    connectToMongo();
    console.log(str);
};