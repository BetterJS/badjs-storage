'use strict';

var dispatcher = require('./acceptor/zmq')
  , save = require('./storage/MongodbStorage');

// use zmq to dispatch
dispatcher()
  .pipe(save());
