const config = require('../project.json');
const MongoClient = require('mongodb').MongoClient;

const L_DEBUG = 1;
const L_INFO = 2;
const L_ERROR = 4;
const HOUR = 60 * 60 * 1000;

const limit = 20;
const url = config.mongodb.url;

var unicode = function(str) {
    return str.toString().replace(/./g, function(char) {
        return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).substr(-4);
    });
};

var start = function(db, params) {
    var now = +new Date();
    var id = params.id;
    var start = params.start || (now - HOUR);
    var end = params.end || now;
    var level = Array.isArray(params.level) ? params.level : [L_ERROR];
    var include = Array.isArray(params.include) ? params.include : []; // RegExp
    var exclude = Array.isArray(params.exclude) ? params.exclude : []; // RegExp

    var filter = {
        all: {
            $all: include,
            $not: {
                $in: exclude
            }
        },
        date: {
            $gt: new Date(start),
            $lt: new Date(end)
        },
        level: {
            $in: level
        }
    };

    include.length === 0 && delete filter.all.$all;
    exclude.length === 0 && delete filter.all.$not;
    include.length === 0 && exclude.length === 0 && delete filter.all;

    console.info('query id: ', filter);

    db.collection('badjslog_' + id).find(filter, function(error, cursor) {
        cursor.sort({
                'date': -1
            })
            // .skip(limit * count)
            .limit(limit)
            .toArray(function(err, item) {
                console.log('counts:', item.length);
                process.exit();
            });
    });
};

MongoClient.connect(url, function(err, db) {
    start(db, {
        id: 25,
        include: [new RegExp(unicode('加载次数'))]
    });
});