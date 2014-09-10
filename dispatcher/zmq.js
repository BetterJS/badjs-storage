var map = require('map-stream')
  , zmq = require('zmq')
  , client = zmq.socket('sub')
  , port = 'tcp://127.0.0.1:10000'
  , service = 'badjs';

/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {
    fn(null, data);
  });
  client.connect(port);
  client.subscribe(service);
  client.on('message', function (data) {
    stream.write(data);
  });
  return stream;
};