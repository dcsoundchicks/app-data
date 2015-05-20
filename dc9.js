var request = require('request');
var	cheerio = require('cheerio');
var queue = require('queue-async');

url = 'http://www.dcnine.com/calendar/';
	
request(url, function (error, response, body) {
	if (!error) {
		var $ = cheerio.load(body);
	    var links = [];

	    $('#content h2').each(function(i, elem) {
	        links.push($('a', elem).attr('href'));
	    });
			
		console.log(links);
	} else {
		console.log('We’ve encountered an error: ' + error);
	}
});