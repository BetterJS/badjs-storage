var net  = require("net"),
    port =  GLOBAL.pjconfig.dispatcher.port,
    address =  GLOBAL.pjconfig.dispatcher.address,
    map = require('map-stream'),
    service =  GLOBAL.pjconfig.dispatcher.subscribe;




/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {
    fn(null, data);
  });

    var client = new net.Socket();
    client.connect(port , address, function() { //'connect' listener
    });


  client.on('data', function (data) {
    stream.write(data);
  });
  return stream;
};