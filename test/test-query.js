/**
 * Created by chriscai on 2015/1/14.
 */


var mongoUrl = "mongodb://betterjs:betterjs4imweb@localhost:27017/badjs";

var mongoDB;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if(err){
        console.log("failed connect to server");
    }else {
        console.log("Connected correctly to server");
    }
    mongoDB = db;



    var queryJSON = {};

    queryJSON.date = {$lt : new Date(1418199180000) , $gt : new Date (1418112780000) };

    queryJSON.level = {$all : 4 } ;


    mongoDB.collection('badjslog_' + 991).find(queryJSON , function (error,cursor){
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


});

