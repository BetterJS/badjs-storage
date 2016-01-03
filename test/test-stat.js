/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient,
    connect = require('connect');

var fs = require("fs");
var path = require("path");


var url = "mongodb://localhost:27111/badjs";

var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if(err){
        console.log("failed connect to mongodb");
    }else {
        console.log("Connected correctly to mongodb");
    }
    mongoDB = db;

    fuck({id : 991 , startDate : new Date("2015-06-15 00:00:00") });
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




function fuck(json , cb){


            var id ;

            if(isNaN(( id = json.id - 0) ) || id <=0 ||id >= 9999){
                return {ok : false , msg : 'id is required'};
            }

            try{
                var oneDate = new Date(json.startDate - 0);
            }catch(e){
                return {ok : false , msg : 'startDate or endDate parse error'};
            }

            if( isNaN(oneDate - 0) ){
                return {ok : false , msg : 'startDate or endDate parse error'};
            }

            var nowDate = new Date(dateFormat(new Date , "yyyy-MM-dd"));

            if(oneDate > nowDate){
                return {ok : false , msg : 'can not found today'};
            }

            var startDate =  new Date(oneDate);
            var endDate = new Date(startDate - 0 + 86400000);

            var queryJSON =  {date : {$lt : endDate , $gte : startDate } , level : 4 };

            var limit = json.limit || 50;

            var outResult = {startDate : startDate - 0 , endDate : endDate - 0 , item:[]};

            mongoDB.collection('badjslog_' + id).find(queryJSON).count(function(error, doc){
                if(error){
                    cb(error)
                    return ;
                }

                var cursor =  mongoDB.collection('badjslog_' + id).aggregate([
                    {$match:queryJSON },
                    {$group: { _id : "$msg",total : {$sum:1} }},
                    {$sort : {total:-1}},
                    {$limit : limit},
                    {allowDiskUse: true}
                ]);

                cursor.toArray(function (err , docs){
                    if(error){
                        cb(error)
                        return ;
                    }
                    outResult.item = docs;
                    outResult.pv = doc;
                });

            });
}



