'use strict';

var dispatcher = require('./acceptor/zmq')
  , save = require('./storage/fileStorage');

// use zmq to dispatch
dispatcher()
  .pipe(save());
