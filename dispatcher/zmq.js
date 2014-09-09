var map = require('map-stream')
  , zmq = require('zmq')
  , client = zmq.socket('sub')
  , port = 'tcp://127.0.0.1:10000';

/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {
    fn(null, JSON.stringify(data));
  });
  client.connect(port);
  client.subscribe('badjs');
  socket.on('mesage', function (data) {
    stream.write(data);
  });
  return stream;
};