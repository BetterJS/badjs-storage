var net  = require("net"),
    port =  GLOBAL.pjconfig.acceptor.port,
    address =  GLOBAL.pjconfig.acceptor.address,
    map = require('map-stream'),
    service =  GLOBAL.pjconfig.acceptor.subscribe;




/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {
  var stream = map(function (data, fn) {
    fn(null, data);
  });

    var client = new net.Socket({});


    client.connect(port , address, function() { //'connect' listener
        console.log("connected server")
    });


    client.on('data', function (data) {
        stream.write(data);
    });

    client.on("end" , function (){
        console.log("client end.");
    });

    client.on("error" , function (e){
        if(e.code == 'ECONNREFUSED') {
            client.setTimeout(4000, function() {
                client.connect(port, address);
            });
            console.log('Timeout for 4 seconds before trying port:' + port + ' again');
        }
   });

  return stream;
};