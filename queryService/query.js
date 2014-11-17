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



var validate = function (req , rep){
    var json = req.query;

    if(json.id <= 0){
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



           queryJSON.date = {$lt : endDate , $gt : startDate  };

           if(!json.level || json.level.length <=0 ){
               json.level = [0];
           }

            json.level.forEach(function ( value , key){
                json.level[key] = "" + value;
            })

           queryJSON.level = {$all : json.level } ;

            var limit = 500;

            mongoDB.collection('badjslog_' + id).find(queryJSON , function (error,cursor){
                res.writeHead(200, {
                        'Content-Type': 'text/json'
                });

                res.write('[');
                var first = true;
                cursor.sort({'date' : -1}).skip((json.index  || 0) * limit).limit(limit).each(function(error,item){
                    if(item){
                        delete item.all;
                        res.write( (first ? '' : ',' ) + JSON.stringify(item));
                    }else {
                        res.write(']');
                        res.end();
                        return ;
                    }
                    first = false;

                });

            });


        }).listen(9000);

    console.log('query server start ... ')
}



