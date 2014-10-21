/**
 * Created by chriscai on 2014/10/16.
 */

var map = require('map-stream');
/**
 * dispatcher
 * @returns {Stream}
 */
var stream = map(function (data, fn) {
    fn(null, data);
});

stream.write('asdfasdfasdfasdfadsf');