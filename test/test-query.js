/**
 * Created by chriscai on 2015/1/14.
 */

var MongoClient = require('mongodb').MongoClient;

var mongoUrl = "mongodb://betterjs:betterjs4imweb@localhost:27017/badjs";

var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(mongoUrl, function(err, db) {
    if(err){
        console.log("failed connect to server");
    }else {
        console.log("Connected correctly to server");
    }
    mongoDB = db;



    var queryJSON = {};

    queryJSON.date = {$lt : new Date(1418199180000) , $gt : new Date (1418112780000) };

    queryJSON.level = {$all : 4 } ;


    mongoDB.collection('badjslog_' + 991).find(queryJSON , function (error,cursor){
        cursor.sort({'date' : -1}).skip(json.index * limit).limit(limit).forEach(function(error,item){
           if(error){
               console.log("error : " + error);
           }else if(){
               console.log(JSON.stringify(item));
           }
        });

    });


});

