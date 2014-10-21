/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient,
    map = require('map-stream');


var insertDocuments = function(db , model) {
    var collection = db.collection('badjslog_' + model.id);
    collection.insert([
        model.model
    ] );
}

var url = 'mongodb://localhost:27017/badjs';
var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if(err){
        console.log("failed connect to server");
    }else {
        console.log("Connected correctly to server");
    }
    mongoDB = db;
});

module.exports = function (){
   return map(function (data) {
       console.log('get a msg');
       try{
        data = JSON.parse(data.toString().replace('badjs' , ''));
       }catch (e){
           console.log('parse error');
           return ;
       }

       if(!data.id ){
            console.log('not id data');
            return ;
       }

       if(!mongoDB ){

           console.log('cannot connect mongodb');
           return ;
       }
       var id = data.id;
       delete data.id;
       data.date = new Date;

       //{from , ip , msg , userAgent ,  ,date }
       insertDocuments(mongoDB , {id : id,
           model : data
       });
    });
}