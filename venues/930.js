var venueId = '930';

var queue = require('queue-async');
var moment = require('moment');
var debug = require('debug')(venueId);
var cheerio = require('cheerio');
var request = require('request');

var url = 'http://www.930.com/concerts/';

module.exports.load = function(callback) {
    debug('startup');
    request(url, function(err, response, body) {
        if (err) return callback(err);
        try {
            processBody(body, callback);
        } catch(e) {
            return callback(err);
        }
    });
};

function processBody(body, callback) {

    var $ = cheerio.load(body);
    var links = [];

    $('#content .list-view-details h1').each(function(i, elem) {
        links.push('http://www.930.com' + $('a', elem).attr('href'));
    });

    var q =  queue(1);

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

function getShow(link, callback) {
    request(link, showload);
    debug('getting ' + link);

    function showload(err, response, body) {
        callback(null, {
            body: body,
            url: link
        });
    }
}

module.exports.parseShowBody = parseShowBody;

function parseShowBody(body) {
    var $ = cheerio.load(body),
        times = [],
        title = $('h1.headliners').text().trim(),
        date = $('h2.dates').first().text();

    $('h2.times span').each(function(i, elem) {
        var txt = $(elem).text().trim();
        if (txt.match(/Doors/)) {
            times.push({
                label: 'doors',
                stamp: +moment(date + ' ' + txt.replace(/Doors\:/, ''),'ddd MM/DD/YY  h:mm a').toDate()
            });
        }
    });

    var supports = $('h2.supports').first().text().trim();

    var prices = $('.showinfo h3').text().trim();

    var minage = null;

    if ($('.showinfo').text().match(/all ages/)) {
        minage = 0;
    } else if ($('.showinfo').text().match(/21\+/)) {
        minage = 21;
    }

    var youtube = [],
        soundcloud = [];

    $('#content iframe').each(function(i, elem) {
        var iframesrc = $(elem).attr('src');
        if (iframesrc.match(/youtube/)) youtube.push(iframesrc);
        if (iframesrc.match(/soundcloud/)) soundcloud.push(iframesrc);
    });

    var tickets = null;

    $('h3.ticket-link.primary-link a').each(function(i, elem) {
        var href = $(elem).attr('href');
        if (href.match(/ticketfly/g)) {
            tickets = href;
        }
    });

    return {
        times: times,
        title: title,
        prices: parsePrices(prices),
        date: date,
        minage: minage,
        tickets: tickets,
        youtube: youtube,
        soundcloud: soundcloud,
        supporters: [supports],
        venue_id: venueId
    };
}

module.exports.parsePrices = parsePrices;

function parseShow(show) {
    var data = parseShowBody(show.body);
    data.url = show.url;
    return data;
}

function parsePrices(prices) {
    return [];
}
