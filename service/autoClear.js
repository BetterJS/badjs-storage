/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient;


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





// 90 天前的数据
var beforeDate = 1000 * 60 * 60 *24 *90 ;

var autoClearStart = function (){
    console.log('start auto clear data before 90d and after 7d will clear again');
    mongoDB.collections(function (error,collections){
            collections.forEach(function (collection ,key ){
                if(collection.s.name.indexOf("badjs")<0) {
                    return ;
                }
                collection.deleteMany({ date : { $lt : new Date(new Date - beforeDate)}} , function (err , result){
                    if(err){
                        console.log("clear error " +  err);
                    }
                })
            })
    });
}


module.exports = function (){
    setTimeout(function (){


        autoClearStart();


        // 一周清理一次
        setInterval(function (){
            autoClearStart();
        }, 1000 * 60 * 60 * 24 *7)

    },5000);
}





