// module.exports.venues = require('./venues');

// module.exports.sourceMap = sourceMap = {};

// module.exports.venues.features.forEach(function(feat) {
//   sourceMap[feat.properties.id] = feat;
//   console.log(feat);
// });

var queue = require('queue-async'),
    flatten = require('lodash.flatten');

var venues = [
    require('./venues/dc9.js'),
];

var q = queue(1);

venues.forEach(function(venue) {
    q.defer(venue.load);
    console.log(venue);
});

q.awaitAll(function(err, res) {
    if (err) throw err;
    process.stdout.write(JSON.stringify(flatten(res), null, 2));
});