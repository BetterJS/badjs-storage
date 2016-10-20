
process.chdir("../");


var cacheTotal = require('../service/cacheTotal');

setInterval(function (){
    cacheTotal.increase({id:1})
},3000);


setInterval(function (){
    cacheTotal.increase({id:2})
},2000);

//console.log(realTotal.getTotal({key:"2015-02-02" , id:15}))

//console.log(process.cwd());