/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient,
     connect = require('connect');


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


var mongodbReduce = function(doc, out){if(!out.distinctMap[doc.msg] ){out.distinctMap[doc.msg] = 0;};out.distinctMap[doc.msg]++;};


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
            json.level = JSON.parse(json.level)
        }else {
            json.level = [];
        }
    }catch(e){
        return {ok : false , msg : 'level parse error'};
    }

    return {ok : true};
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


           queryJSON.level = {$all : json.level } ;

            var limit = 500;

            if(json.index - 0){
                json.index = (json.index - 0);
            }else {
                json.index = 0
            }

            mongoDB.collection('badjslog_' + id).find(queryJSON , function (error,cursor){
                res.writeHead(200, {
                        'Content-Type': 'text/json'
                });

                res.write('[');
                var first = true;
                cursor.sort({'date' : -1}).skip(json.index * limit).limit(limit).forEach(function(error,item){
                    if(item){
                        delete item.all;
                        item.date = item.date -0;
                        res.write( (first ? '' : ',' ) + JSON.stringify(item));
                    }else {
                        res.write(']');
                        res.end();
                        return ;
                    }
                    first = false;

                });

            });


        })
        .use('/errorMsgTop', connect.query())
        .use('/errorMsgTop', function (req, res) {

            var json = req.query;

            var id ;

            if(isNaN(( id = req.query.id - 0) ) || id <=0 ||id >= 9999){
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

            var outResult = {startDate : startDate - 0 , endDate : endDate - 0};


            mongoDB.collection('badjslog_' + id).group( [{"msg":true}] , queryJSON ,  {"distinctMap":{} }, mongodbReduce.toString() , "function (out){return out}", function (error,results){
                if(!results || !results[0]){
                    outResult.result = {};
                }else {
                    outResult.result = results[0].distinctMap;
                }
                res.writeHead(200, {
                    'Content-Type': 'text/json'
                });
                res.write(JSON.stringify(outResult));
                res.end();

            });

        })
        .listen(9000);

    console.log('query server start ... ')
}



