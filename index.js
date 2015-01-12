'use strict';

global.MONGDO_URL = "mongodb://betterjs:betterjs4imweb@localhost:27017/badjs";
var dispatcher = require('./acceptor/zmq')
  , save = require('./storage/MongodbStorage');


// use zmq to dispatch
dispatcher()
  .pipe(save());


console.log('badjs-storage start ...');

setTimeout(function (){
    require('./queryService/query')();
},1000);