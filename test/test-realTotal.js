var fs = require("fs");
var path=require("path");
var nowDate = Date.now();
var saveData = JSON.parse(fs.readFileSync("E:/szlog/2016-5-27.db"))
console.log("load span " + ( Date.now() - nowDate  ))

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

var  currentCacheName = dateFormat(new Date  , "yyyy-MM-dd") ;

console.log(currentCacheName)

var generateErrorMsgTop = function (totalData , startDate , endDate){

    Object.keys(totalData).forEach(function (key , index){

        if(key != "total"){
            var fileName = dateFormat(new Date(startDate), "yyyy-MM-dd") + "__" + key;
            var filePath = path.join("E:/szlog/test" , fileName)
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
                JSON.stringify({"startDate":startDate,"endDate":endDate,"item" :  errorList.slice(0,50) , "pv" : targetData.total })
            )
        }
    })
}
var yesterday = getYesterday();
//console.log(yesterday + 86400000 -1)
//return ;
generateErrorMsgTop(saveData ,  +yesterday  , +yesterday + 86400000 -1)
