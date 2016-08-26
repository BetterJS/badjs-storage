/**
 * 内存中实时计算总数
 */

var fs = require("fs");
var path=require("path");

var crypto = require('crypto');

var log4js = require('log4js'),
    logger = log4js.getLogger();

//var MongoClient = require('mongodb').MongoClient;
//
//var mongoDB;
//// Use connect method to connect to the Server
//MongoClient.connect(global.MONGODB.url, function(err, db) {
//    if(err){
//        logger.error("failed connect to mongodb");
//    }else {
//        logger.info("Connected correctly to mongodb");
//    }
//    mongoDB = db;
//});

var getYesterday = function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
};

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

var saveData = {}, currentCacheName = dateFormat(new Date  , "yyyy-MM-dd") ;


(function (){
    var filePath = path.join(__dirname , "..", "cache", "total", currentCacheName )
    if(fs.existsSync(filePath)){
        logger.info("cache is exists , load it , path: " + filePath)
        saveData = JSON.parse(fs.readFileSync(filePath))
    }
}())



var generateErrorMsgTop = function (totalData , startDate , endDate){

    Object.keys(totalData).forEach(function (key , index){
        if(key != "total"){
            var fileName = dateFormat(new Date(startDate), "yyyy-MM-dd") + "__" + key;
            var filePath = path.join(__dirname , "..", "cache", "errorMsg", fileName)
            var targetData =  totalData[key];
            var errorMap = targetData.errorMap;
            var errorList = [];
            Object.keys(errorMap).forEach( function (errorMapKey){
                errorList.push({ "_id" :  errorMap[errorMapKey].msg , "total" : errorMap[errorMapKey].total})
            })
            errorList.sort(function (a , b){
                return a.total < b.total ? 1 : -1;
            })

            fs.writeFile(
                filePath ,
                JSON.stringify({"startDate":startDate,"endDate":endDate,"item" :  errorList.slice(0,50) , "pv" : targetData.total }),
                function (err){
                    if (err) {
                        logger.error('generated total cache error : ' + filePath);
                    }else {
                        logger.info('generated total cache succes : ' + filePath);
                    }
                }
            )
        }
    })
}

var flushCacheToDisk = function (resetCache , fileName){
    var filePath = path.join(__dirname , "..", "cache", "total", fileName)
    var tickDate = Date.now();
    var content = JSON.stringify(saveData);
    logger.info( "stringify spend time : " +  (Date.now() - tickDate))

    if(resetCache){
        var yesterday = getYesterday();
        generateErrorMsgTop(saveData ,  +yesterday , +yesterday + 86400000 -1)
        saveData = {};
    }

    logger.info("flush cache to disk , path : " + filePath );

    fs.writeFile(  filePath  , content )
}


var tick = 0;
setInterval(function() {

    tick ++;

    var newCacheName = dateFormat(new Date  , "yyyy-MM-dd")
    // not today , flush
    if(currentCacheName != newCacheName){
        flushCacheToDisk(true , currentCacheName);
        logger.info("reset cache  , currentName " + currentCacheName + ", newCacheName " + newCacheName  );
        currentCacheName = newCacheName;

        tick = 0;
    }else if(tick >= 30) { // 每30 分钟才生成一次
        flushCacheToDisk(false , currentCacheName);
        tick = 0;
    }

},  1 * 60 *  1000 );


module.exports = {
        increase : function (id , data){

            var md5 = "";
            try{
                md5 = crypto.createHash("md5").update(data.msg).digest('hex');
            }catch(e){
                logger.error("md5 error : " + e)
                return ;
            }

            if(saveData["total"] == undefined) {
                saveData["total"] = 0;
            }else {
                ++saveData["total"];
            }

            if(saveData[id]){
                saveData[id].total++;
            }else {
                saveData[id]  = { total :1 , errorMap:{} };
            }

            var errorMap = saveData[id].errorMap;
            if( errorMap[md5] ){
                errorMap[md5].total ++;
            }else {
                errorMap[md5] ={total :1 , msg :data.msg+"" }
            }


        },

}