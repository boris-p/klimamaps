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