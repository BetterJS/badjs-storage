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



    var unProcessBuff = new Buffer(0);
    client.on('data', function (data) {
        var buff = Buffer.concat([unProcessBuff , data])
        var preIndex = 0;
        for(var i = 0 ; i < buff.length ; i ++){
            if(buff[i] == 3){
                stream.write(buff.slice(preIndex , i));
                unProcessBuff = new Buffer(0);
                preIndex = i+1;
            }

            if(i >= (buff.length -1) && buff[i] != 3){
                unProcessBuff = buff.slice(preIndex  );
            }
        }
       /* data.forEach()

        array.forEach(function (value){
            if(value.length > 5){
                stream.write(value);
            }
        })*/

    });

    var reconnect = function (){
        client.setTimeout(4000, function() {
            client.connect(port, address);
            console.log('Timeout for 4 seconds before trying port:' + port + ' again');
        });
    }

    client.on("end" , function (){
        console.log("client end.");
        reconnect();
    });

    client.on("error" , function (e){
            reconnect();
   });

  return stream;
};