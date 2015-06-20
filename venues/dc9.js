var VENUEID = 'dc9';

var request = require('request');
var	cheerio = require('cheerio');
var queue = require('queue-async');

var url = 'http://www.dcnine.com/calendar/';

// request(url, onload);
module.exports.load = function(callback) {
    request(url, function(err, response, body) {
        if (err) return callback(err);
        try {
            processBody(body, callback);
        } catch(e) {
            return callback(err);
        }
    });
}

function processBody(body, callback) {

    var $ = cheerio.load(body);
    var links = [];

    $('#content h2').each(function(i, elem) {
        links.push($('a', elem).attr('href'));
    });

    // if (mylimit) links = links.slice(0, mylimit);

    var q = queue(process.env.SOURCE_CONCURRENCY || 1);

    links.forEach(function(link) {
        q.defer(getShow, link);
    });

    q.awaitAll(function(err, res) {
        debug('done');
        if (err) return callback(err);
        var events = res.map(parseShow);
        callback(null, events);
    });
}
	
// request(url, function (error, response, body) {
// 	if (!error) {
// 		var $ = cheerio.load(body);
// 	    var links = [];

// 	    $('#content h2').each(function(i, elem) {
// 	        links.push($('a', elem).attr('href'));
// 	    });
			
// 		console.log(links);
// 	} else {
// 		console.log('We’ve encountered an error: ' + error);
// 	}
// });