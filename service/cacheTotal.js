var fs = require("fs");
var path=require("path");

var log4js = require('log4js'),
    logger = log4js.getLogger();

var MongoClient = require('mongodb').MongoClient;

var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(global.MONGODB.url, function(err, db) {
    if(err){
        logger.error("failed connect to mongodb");
    }else {
        logger.info("Connected correctly to mongodb");
    }
    mongoDB = db;
});





var dateFormat  = function (date , fmt){
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var key = dateFormat(new Date , "yyyy-MM-dd");
var saveData = {};

setInterval(function (){
    var newKey = key;
    var newSaveData = JSON.parse(JSON.stringify(saveData));

    key = dateFormat(new Date , "yyyy-MM-dd");
    saveData = {};

    Object.keys(newSaveData).forEach( function (key ){
        var saveValue = newSaveData[key] -0;
        var saveKey = {key : newKey +"-" + key};
        mongoDB.collection("total").findOneAndUpdate(saveKey, {$inc:{total : saveValue }} , {upsert : true} , function (err , result){
            logger.debug("cache total success - " + saveKey.key + " : " + saveValue );
        })
    });

},60000);


module.exports = {
        increase : function (data){
            var count = saveData[data.id];
            if(count >=1){
                count ++;
            }else {
                count = 1;
            }
            saveData[data.id] = count;
        },

        getTotal : function (data , cb){
            var findKey = {key : data.key +"-" + data.id};
            mongoDB.collection("total").findOne(findKey , function (err , result){
                if(err){
                    cb(err);
                }else {
                    if(result){
                        cb(null , result.total)
                    }else {
                        cb(null , 0)
                    }
                }
            })
        }
}