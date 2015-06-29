/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient,
    map = require('map-stream');

var log4js = require('log4js'),
    logger = log4js.getLogger();

var cacheTotal = require('../service/cacheTotal');


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
        collection.indexExists('date_-1_level_1' , function (err , result ){
            if(!result){
                collection.createIndex( {date : -1 , level : 1 } , function (err , result){

                });
            }
            hadCreatedCollection[collectionName] = true;
        })
    });

    logger.debug("save one log : " + JSON.stringify(model.model));
}

var url = global.MONGDO_URL;
var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if(err){
        logger.info("failed connect to server");
    }else {
        logger.info("Connected correctly to server");
    }
    mongoDB = db;
});

module.exports = function (){
   return map(function (data) {
       try{
        var dataStr = data.toString();
        data = JSON.parse(dataStr.substring(dataStr.indexOf(' ')));
       }catch (e){
           logger.error('parse error');
           return ;
       }

       if(!data.id ){
           logger.info('not id data');
            return ;
       }

       if(!mongoDB ){dataStr.substring(dataStr.indexOf(' '))
           logger.info('cannot connect mongodb');
           return ;
       }
       var id = data.id;
       delete data.id;

       var all = '';
       for(var key in data ) {
            all += ';'+key+'=' + data[key];
       }
       data.all = all;
       data.date = new Date(data.date);


       insertDocuments(mongoDB , {id : id,
           model : data
       });

       if(data.level == 4){
           cacheTotal( {id : id });
           logger.debug("cache total id : " + id);
       }

    });
}