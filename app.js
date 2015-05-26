'use strict';



var argv = process.argv.slice(2);
if(argv.indexOf('--project') >= 0){
    GLOBAL.pjconfig =  require('./project.debug.json');
}else {
    GLOBAL.pjconfig = require('./project.json');
}

GLOBAL.MONGDO_URL = GLOBAL.pjconfig.mongodb.url;
var dispatcher = require('./acceptor/zmq')
  , save = require('./storage/MongodbStorage');


// use zmq to dispatch
dispatcher()
  .pipe(save());


console.log('badjs-storage start ...');

setTimeout(function (){
    require('./service/query')();
    require('./service/autoClear')();
},1000);