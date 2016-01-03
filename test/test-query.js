/**
 * Created by chriscai on 2015/1/14.
 */

var MongoClient = require('mongodb').MongoClient;

var mongoUrl = "mongodb://betterjs:betterjs4imweb@localhost:27017/badjs";

var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(mongoUrl, function(err, db) {
    if(err){
        console.log("failed connect to mongodb");
        return ;
    }else {
        console.log("Connected correctly to mongodb");
    }
    mongoDB = db;



    var queryJSON = {};

    queryJSON.date = {$lt : new Date(1418794477352) , $gt : new Date (1418708077352) };

    queryJSON.level = {$all : [4] } ;


    mongoDB.collection('badjslog_' + 991).find(queryJSON , function (error,cursor){
        console.log(error)
        cursor.sort({'date' : -1}).skip(0).limit(500).forEach(function(item){
          if(item){
               console.log(JSON.stringify(item));cd
           }
        });

    });


});

