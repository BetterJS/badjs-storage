/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient,
    map = require('map-stream');


var hadCreatedCollection = {};

var insertDocuments = function(db , model) {
    var collectionName = 'badjslog_' + model.id;
    var collection = db.collection(collectionName);
    collection.insert([
        model.model
    ] , function (err , result){
        if (hadCreatedCollection[collectionName]) {
            return ;
        }
        collection.indexExists('date_-1' , function (err , result ){
            if(!result){
                collection.createIndex( {date : -1 } , function (err , result){

                });
            }
            hadCreatedCollection[collectionName] = true;
        })
    });
}

var url = global.MONGDO_URL;
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
       try{
        var dataStr = data.toString();
        data = JSON.parse(dataStr.substring(dataStr.indexOf(' ')));
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

       var all = '';
       for(var key in data ) {
            all += ';'+key+'=' + data[key];
       }
       data.all = all;
       data.date = new Date;


           insertDocuments(mongoDB , {id : id,
               model : data
           });

    });
}