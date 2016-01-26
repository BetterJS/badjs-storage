var http = require("http");


http.createServer(function (request , response ){


}).listen(8085);

/*
 http.get("http://127.0.0.1:9005/errorMsgTopCache?ids=8_991_4_25_28_34_35_3_9_19_20_11_13_30_10_12_16_14_15_18_23_21_24_26_29_31&startDate=1433865600000",function (res){
 //http.get("http://127.0.0.1:9005/errorMsgTopCache?ids=27&startDate=1433865600000",function (res){

 res.on('data' , function (chunk){
 console.log(chunk.toString());
 });
 }).on("error", function (e){
 console.log(e.message);
 });*/

console.log("request;");


http.get("http://127.0.0.1:9000/errorMsgTop?id=991&startDate=1433865600000", function (res , req){

    res.on('data' , function (chunk){
        console.log(chunk.toString());
    });
}).on("error", function (e){
    console.log(e.message);
});