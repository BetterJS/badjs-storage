/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient,
    map = require('map-stream');

var log4js = require('log4js'),
    logger = log4js.getLogger();

var realTotal = require('../service/realTotalMaster');

var mongoDB, adminMongoDB;


var hadCreatedCollection = {};

var tryInit = function (db , collectionName , cb){
    if(hadCreatedCollection[collectionName] === 'ping'){
        return ;
    }
    if (hadCreatedCollection[collectionName] === true){
        var collection = db.collection(collectionName);
        cb(null , collection);
        return true;
    }

    hadCreatedCollection[collectionName] = "ping";
    db.createCollection(collectionName , function (err , collection){
        collection.indexExists('date_-1_level_1' , function (errForIE , result ){
            if(errForIE){
                throw errForIE;
            }
            if(!result){
                collection.createIndex( {date : -1 , level : 1 } , function (errForCI){
                    if(errForCI){
                        throw errForCI;
                    }
                    if (global.MONGODB.isShard){
                        adminMongoDB.command({
                            shardcollection: "badjs." + collectionName,
                            key: {_id: "hashed"}
                        }, function (errForShard, info) {
                            if (errForShard) {
                                throw errForShard;
                            } else {
                                logger.info(collectionName + " shard correctly");
                                cb(null , collection);
                                hadCreatedCollection[collectionName] = true;

                            }
                        });
                    }else {
                        cb(null , collection);
                        hadCreatedCollection[collectionName] = true;
                    }

                });
            }else {
                cb(null , collection);
                hadCreatedCollection[collectionName] = true;
            }
        })
    } )
}



var insertDocuments = function(db , model) {
    var collectionName = 'badjslog_' + model.id;

    tryInit(db ,collectionName , function (err , collection ){
        collection.insert([
            model.model
        ] , function (err , result){
            if( global.debug){
                logger.debug("save one log : " + JSON.stringify(model.model));
            }
        });
    })



}


// Use connect method to connect to the Server
MongoClient.connect(global.MONGODB.url, function(err, db) {
    if(err){
        logger.error("failed connect to mongodb");
    }else {
        logger.info("Connected correctly to mongodb");
    }
    mongoDB = db;
});


if(global.MONGODB.isShard){
    MongoClient.connect(global.MONGODB.adminUrl, function(err, db) {
        if(err){
            logger.error("failed connect to mongodb use admin admin");
        }else {
            logger.info("Connected  correctly to mongodb use admin");
        }
        adminMongoDB = db;
    });
}


module.exports = function (){
   return map(function (data) {
       try{
        var dataStr = data.toString();
        data = JSON.parse(dataStr.substring(dataStr.indexOf(' ')));
       }catch (e){
           logger.error('parse error');
           return ;
       }

       //  1-debug 2-info 4-error  ,
       if(data.level!= 4 && data.level != 2){
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
           realTotal.increase( id , data);
       }

    });
}