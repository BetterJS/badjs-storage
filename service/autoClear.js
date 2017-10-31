/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient;

var log4js = require('log4js'),
    logger = log4js.getLogger();


var url = global.MONGODB.url;

var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if(err){
        logger.error("failed connect to mongodb");
    }else {
        logger.info("Connected correctly to mongodb");
    }
    mongoDB = db;
});


var maxAge = GLOBAL.pjconfig.maxAge ;


// 清理 maxAge 天前的数据
var beforeDate = 1000 * 60 * 60 *24 *  maxAge ;

var autoClearStart = function (){
    logger.info('start auto clear data before  '+maxAge+'d and after '+(maxAge > 24 ? 24 : maxAge)+'d will clear again');
    mongoDB.collections(function (error,collections){
            collections.forEach(function (collection ,key ){
                if(collection.s.name.indexOf("badjs")<0) {
                    return ;
                }
                logger.info("start clear " + collection.s.name);
                collection.deleteMany({ date : { $lt : new Date(new Date - beforeDate)}} , function (err , result){
                    if(err){
                        logger.info("clear error " +  err);
                    }else {
                        logger.info("clear success id=" + collection.s.name);
                    }
                })
            })
    });
}


module.exports = function (){


        var afterDate = new Date;
        afterDate.setDate(afterDate.getDate()+1);
        afterDate.setHours(04);

       // autoClearStart();


        var afterTimestamp = afterDate - new Date ;

        logger.info(afterTimestamp + "s should clear");

        //greater than 2147483648 , setInterval or setTimeout will overflow
        var start = function (){
            autoClearStart();
            setInterval(function (){
                autoClearStart();
            } , 86400000 *(maxAge > 24 ? 24 : maxAge) );
        };

        //明天凌晨4点，启动
        setTimeout(function (){
            start();
        }, afterTimestamp);

}





