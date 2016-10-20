/**
 * 内存中实时计算总数
 */

var path=require("path");


var log4js = require('log4js'),
    logger = log4js.getLogger();



var cluster = require('cluster');
cluster.setupMaster({
    exec: path.join(__dirname ,  "realTotalWorker.js")
});


var clusterPool = [];

for(var i = 0 ; i < GLOBAL.pjconfig.realTotal ; i ++){
    clusterPool.push(cluster.fork({index :  i ,debug :  !!global.debug }));
}


module.exports = {
    increase : function (id , data){
        var index = id%clusterPool.length;
        var targetCluster = clusterPool[index];
        targetCluster.send({ id : id , data : data , type: "write"  });

    },
}