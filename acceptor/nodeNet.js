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

    var client = new net.Socket({});

    client.setKeepAlive(true , 3000);

    client.setEncoding("UTF-8")

    client.connect(port , address, function() { //'connect' listener
        console.log("connected server")
    });


    client.on('data', function (data) {
        stream.write(data);
    });

    client.on("end" , function (){
        console.log("client end.");
    });

    client.on("error" , function (){
        console.log("failed connect to acceptor");
        client.end();

        setTimeout(function (){
            client.connect(port , address);
        },3000)
   })
  return stream;
};