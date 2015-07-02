var fs = require("fs");
var path=require("path");

var log4js = require('log4js'),
    logger = log4js.getLogger();




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
GLOBAL.total = {};
GLOBAL.total[key] = saveData;

var existFile = path.join("." , "cache" , "cacheTotal" , key);

if(fs.existsSync(existFile)){
    logger.info("load exist file  = " + existFile);
    try{
        saveData =  JSON.parse(fs.readFileSync(existFile));
    }catch(e){
        saveData= {};
    }

}

setInterval(function (){
    var filePath = path.join("." , "cache" , "cacheTotal" , key);
    fs.writeFileSync(filePath , JSON.stringify(saveData));

    logger.info("save into disk , key = " + key);

    // clear old data
    var newKey = dateFormat(new Date , "yyyy-MM-dd");
    if(newKey != key){
        logger.info("new day  and clear old data , newkey = " + key);
        key = newKey;
        GLOBAL.total = {};
        GLOBAL.total[key] = saveData = {};
    }
},300000);

module.exports ={
        increase : function (data){
            var count = saveData[data.id];
            if(count >=1){
                count ++;
            }else {
                count = 1;
            }
            saveData[data.id] = count;
        },

        getTotal : function (data){
            if(!GLOBAL.total[data.key] ||  "{}" == JSON.stringify(GLOBAL.total[data.key])){
                var filePath = path.join("." , "cache" , "cacheTotal" , data.key);
                try{
                    var json = JSON.parse(fs.readFileSync(filePath));
                    GLOBAL.total[data.key] = json;
                }catch(e){
                    logger.error("load cacheTotal fail :" + JSON.stringify(data));
                    return 0;
                }
            }

            var count = GLOBAL.total[data.key][data.id];
            if( count >0 ){
               return count;
            }else {
                return 0;
            }
        }
    }