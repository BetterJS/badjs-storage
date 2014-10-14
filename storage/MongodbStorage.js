/**
 * Created by chriscai on 2014/10/14.
 */

var MongoClient = require('mongodb').MongoClient;


var insertDocuments = function(db , model) {
    var collection = db.collection('badjslog_' + model.id);
    collection.insert([
        model.model
    ] );
}

var url = 'mongodb://localhost:27017/badjs';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    console.log("Connected correctly to server");
    insertDocuments(db , {id : '1' ,
        model : {
            uin: '345446383',
            ip: '127.0.0.1',
            msg: 'Script Error:Uncaught TypeError: Cannot read property \'1\' of null',
            from : 'http://ke.qq.com/activity/mobile/languagues/index.html?_wv=769',
            browser: 'HS-T950_TD/1.0 Android/4.0.3 Release/28.10.2012 Browser/AppleWebKit534.30 Profile/MIDP-2.0 Configuration/CLDC-1.1 V1_AND_SQ_5.1.1_158_YYB_D PA QQ/5.1.1.2245',
            date : new Date()
        }
    });
    db.close();
});

