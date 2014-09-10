'use strict';

var dispatcher = require('./dispatcher/zmq')
  , save = require('./lib/save');

// use zmq to dispatch
dispatcher()
  .pipe(save());
