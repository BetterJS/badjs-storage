/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient,
     connect = require('connect');

var log4js = require('log4js'),
    logger = log4js.getLogger();


var fs = require("fs");
var path = require("path");

var cacheTotal = require('../service/cacheTotal');


var url = global.MONGODB.url;

var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if(err){
        logger.error("failed connect to server");
    }else {
        logger.info("Connected correctly to server");
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




var validateDate = function (date){
        var startDate = new Date(date-0) - 0;
        if(isNaN(startDate)){
            return {ok : false , msg : 'date error'};
        }

}

var validate = function (req , rep){
    var json = req.query;

    var id;
    if(isNaN(( id = req.query.id - 0) ) || id <=0 ||id >= 9999){
        return {ok : false , msg : 'id is required'};
    }

    if(!json.startDate || !json.endDate){
        return {ok : false , msg : 'startDate or endDate is required'};
    }


    try{
        var startDate = new Date(json.startDate - 0);
        var endDate = new Date(json.endDate - 0) ;
        json.startDate = startDate;
        json.endDate = endDate;
    }catch(e){
        return {ok : false , msg : 'startDate or endDate parse error'};
    }

    try{
        if(json.include){
            json.include = JSON.parse(json.include)
        }else {
            json.include = [];
        }

        if(json.exclude ){
            json.exclude  = JSON.parse(json.exclude )
        }else {
            json.exclude = [];
        }
    }catch(e){
        return {ok : false , msg : 'include or exclude parse error'};
    }


    try{
        if(json.level){
            if(toString.apply(json.level) == "[object Array]"){
            }else {
                json.level = JSON.parse(json.level);
            }

        }else {
            json.level = [];
        }
    }catch(e){
        return {ok : false , msg : 'level parse error'};
    }

    return {ok : true};
}

var totalKey = dateFormat(new Date , "yyyy-MM-dd");

var errorMsgTop = function (json , cb){
    var id;
    if(isNaN(( id = json.id - 0) ) || id <=0 ||id >= 9999){
        cb({ok : false , msg : 'id is required'});
    }

    var oneDate = new Date(json.startDate ) ;

    if( isNaN( +oneDate ) ){
        cb( new Error("parse date error") ,  {ok : false , msg : 'startDate or endDate parse error'});
        return ;
    }

    var nowDate = new Date(dateFormat(new Date , "yyyy-MM-dd")) - 0;

    if(( +oneDate  ) > (+nowDate )){
        cb(   new Error("can not found today"),  {ok : false , msg : 'can not found today'});
        return ;
    }

    var startDate =  oneDate;
    var endDate = new Date( +startDate  + 86400000);

    var queryJSON =  {date : {$lt : endDate , $gte : startDate } , level : 4 };

    var limit = json.limit || 50;

    var outResult = {startDate : +startDate  , endDate : +endDate  , item:[]};


  /*  mongoDB.collection('badjslog_' + id).find(queryJSON).count(function(error, doc){
        if(error){
            cb(error)
            return ;
        }*/

    cacheTotal.getTotal({id : id , key : totalKey} , function (err , total){
        if(err){
            throw err;
        }

        var cursor =  mongoDB.collection('badjslog_' + id).aggregate(
            [
                {$match: queryJSON},
                {$group: {_id: "$msg", total: {$sum: 1}}},
                {$sort: {total: -1}},
                {$limit: limit}
            ],
            {allowDiskUse: true}
        );

        cursor.toArray(function (err , docs){
            if(err){
                cb(err)
                return ;
            }
            outResult.item = docs;
            outResult.pv = total;
            cb(err,outResult);
        });
    });
//    });
}


var getErrorMsgFromCache = function (query , isJson , cb){
    var fileName = dateFormat(new Date(query.startDate), "yyyy-MM-dd") +"__" + query.id;
    var filePath = path.join("." , "cache" , "errorMsg" , fileName);

    var returnValue = function (err , doc){
        if(query.noReturn){
            cb(err );
        }else {
            cb(err , doc );
        }
    }
    if(fs.existsSync(filePath)){
        logger.info("get ErrorMsg from cache id="+ query.id );
        if(isJson){
            returnValue(null , JSON.parse(fs.readFileSync(filePath)));
        }else {
            returnValue(null , fs.readFileSync(filePath));
        }

        return;
    }
    errorMsgTop(query, function (err , doc){
        if(err){
            logger.info("cache errorMsgTop error fileName="+fileName + " " + err.toString())
        }
        returnValue(err , isJson ?doc : JSON.stringify(doc));
    });
}


module.exports = function (){
    connect()
        .use('/query', connect.query())
        .use('/query', function (req, res) {

            var result = validate(req , res);

            if(!result.ok){
                res.writeHead(403, {
                    'Content-Type': 'text/html'
                });
                res.statusCode = 403;
                res.write(JSON.stringify(result));
                return ;
            }


            var json = req.query;
            var id = json.id , startDate = json.startDate , endDate = json.endDate;


            var queryJSON  = {all : {}};

            var includeJSON = [];
            json.include.forEach(function (value , key){
                includeJSON.push( new RegExp( value ));
            });

            if(includeJSON.length > 0){
                queryJSON.all.$all = includeJSON;
            }

            var excludeJSON = [];
            json.exclude.forEach(function (value , key){
                excludeJSON.push(new RegExp( value ));
            });

            if(excludeJSON.length > 0){
                queryJSON.all.$not = {$in : excludeJSON};
            }

            if(includeJSON.length <= 0 && excludeJSON.length <=0){
                delete queryJSON.all;
            }

            json.level.forEach(function ( value , key){
                json.level[key] =  value - 0;
            })


           queryJSON.date = {$lt : endDate , $gt : startDate  };


           queryJSON.level = {$in : json.level } ;

            var limit = 500;

            if(json.index - 0){
                json.index = (json.index - 0);
            }else {
                json.index = 0
            }

            if( global.debug == true){
                logger.debug("query logs id="+ id + ",query=" + JSON.stringify(queryJSON))
            }


            mongoDB.collection('badjslog_' + id).find(queryJSON , function (error,cursor){
                res.writeHead(200, {
                        'Content-Type': 'text/json'
                });

                cursor.sort({'date' : -1}).skip(json.index * limit).limit(limit).toArray(function(err , item){
                        res.write(   JSON.stringify(item));
                        res.end();

                });


            });


        })
        .use('/errorMsgTop', connect.query())
        .use('/errorMsgTop', function (req, res) {
            var error =  validateDate(req.query.startDate)
            if(error){
                res.end(JSON.stringify(error));
                return ;
            }


            req.query.startDate = req.query.startDate  - 0;

            getErrorMsgFromCache(req.query , false , function (error ,doc ){
                res.writeHead(200, {
                    'Content-Type': 'text/json'
                });
                res.write(doc);
                res.end();
            });

        })
        .use('/errorMsgTopCache', connect.query())
        .use('/errorMsgTopCache', function (req, res) {
            var error =  validateDate(req.query.startDate)
            if(error){
                res.end(JSON.stringify(error));
                return ;
            }

            req.query.startDate = req.query.startDate  - 0;
            var startDate = req.query.startDate;

            res.end();

            totalKey = dateFormat(new Date(startDate) , "yyyy-MM-dd");


            req.query.ids.split("_").forEach(function (value , key){
                var fileName = dateFormat(new Date(startDate), "yyyy-MM-dd") +"__" +value;
                var filePath = path.join("." , "cache" , "errorMsg" , fileName);

                logger.info("start cache id=" + value);

                if(fs.existsSync(filePath)){
                    logger.info("id=" + value +" had cached");
                    return ;
                }

                getErrorMsgFromCache({id : value , startDate : startDate  } , false , function (err , doc){
                    if(err){
                        logger.info("cache errorMsgTop error fileName="+fileName + " " + err)
                    }else {
                        logger.info("id = " +  value  + "cache success");
                        fs.writeFileSync(filePath , doc );
                    }
                });

            });


        })
        .listen(9000);

    logger.info('query server start ... ')
}



