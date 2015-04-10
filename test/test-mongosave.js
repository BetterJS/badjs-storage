/**
 * Created by chriscai on 2015/1/14.
 */

var MongoClient = require('mongodb').MongoClient;

global.MONGDO_URL = "mongodb://localhost:27017/badjs";


var map = require('map-stream');

var save = require('../storage/MongodbStorage');

var stream  = map(function (data, fn) {
    fn(null, data);
});


stream.pipe(save());


setTimeout(function (){
    stream.write(JSON.stringify({id:110, msg : 'fuck'}));
},1000)

setTimeout(function (){
    stream.write(JSON.stringify({id:110, msg : 'fuck'}));
},5000)




