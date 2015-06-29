
process.chdir("../");


var cacheTotal = require('../service/cacheTotal');

setInterval(function (){
    cacheTotal({id:1})
},3000);


setInterval(function (){
    cacheTotal({id:2})
},2000);

//console.log(process.cwd());