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
    var json = requ.query;

    if(id <= 0){
        res.writeHead(403, {
            'Content-Type': 'text/html'
        });
        res.statusCode = 403;
        res.write(JSON.stringify({msg : 'id is required'}));
        return false;
    }

    if(json.startDate || json.endDate){
        res.writeHead(403, {
            'Content-Type': 'text/html'
        });
        res.statusCode = 403;
        res.write(JSON.stringify({msg : 'startDate or endDate is required'}));
        return false;
    }


    try{
        var startDate = new Date(json.startDate);
        var endDate = new Date(json.endDate);
        json.startDate = startDate;
        json.endDate = endDate;
    }catch(e){
        res.writeHead(403, {
            'Content-Type': 'text/html'
        });
        res.statusCode = 403;
        res.write(JSON.stringify({msg : 'startDate or endDate parse error'}));
        return false;
    }
    return true;
}


module.exports = function (){
    connect()
        .use('/badjs', connect.query())
        .use('/query', function (req, res) {

            if(!validate(req , res)){
                return ;
            }


            var json = requ.query;
            var id = json , startDate = json.startDate , endDate = json.endDate;
            delete json.id;
            delete json.startDate;
            delete json.endDate;



            json.date = {$lt : endDate , $gt : startDate};

            db.collection('badjslog_' + id).find(json);

        });
}

