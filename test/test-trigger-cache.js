var http = require("http");

http.get("http://127.0.0.1:9000/errorMsgTopCache?ids=10_11_13_14_15_16_18_21_23_24_25_26_27_28_3_30_31_34_35_38_39_40_43_44_47_8_991&startDate=1435161600000",function (res){
//http.get("http://127.0.0.1:9005/errorMsgTopCache?ids=27&startDate=1433865600000",function (res){

    res.on('data' , function (chunk){
        console.log(chunk.toString());
    });

    res.on("end" , function (){
        console.log("fuck");
    })
}).on("error", function (e){
    console.log(e.message);
});
