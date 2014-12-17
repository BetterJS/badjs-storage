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

       //{from , ip , msg , userAgent , uin  ,date , url , rowNum , colNum }
       insertDocuments(mongoDB , {id : id,
           model : data
       });
    });
}