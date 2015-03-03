var map = require('map-stream')
  , zmq = require('zmq')
  , client = zmq.socket('sub')
  , port = GLOBAL.pjconfig.zmq.url
  , service = GLOBAL.pjconfig.zmq.subscribe;

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