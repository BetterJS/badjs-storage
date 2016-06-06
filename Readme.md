#badjs-storage

> save log into mongodb , and provide some of api for query 

#启动参数
--debug log 采用debug 级别, 默认使用info

--project 使用测试环境（ project.debug.json ）配置 ， 默认使用 project.json

#配置说明
```
{
    "mongodb" : { // mongodb 地址 
        "url" : "mongodb://localhost:27017/badjs",  
        "adminUrl" : "mongodb://localhost:27017/admin",  // 如果使用集群，需要超级管理员权限进行配置
        "isShard" : false      // 是否使用集群
    },
    "acceptor": {     //配置接入数据的地址， 这里使用 badjs-mq 的地址
      "port" : 10000,
      "address" : "127.0.0.1",
      "subscribe": "badjs",     // 与badjs-acceptor subscribe 对应
      "module": "./acceptor/axon"    //指定mq 模块
      // "module": "./acceptor/zmq" 使用 zmq 作为mq 模块
    },
    "maxAge" : 5 ,  // 数据保留的天数
     "port" : 9000 //  http 服务端口
}
```
