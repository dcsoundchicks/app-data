var venueId = 'hamilton';

var queue = require('queue-async');
var moment = require('moment');
var debug = require('debug')(venueId);
var cheerio = require('cheerio');
var request = require('request');


var url = 'http://live.thehamiltondc.com/listing/';

module.exports.load = function(callback) {
    debug('startup');
    request(url, function(err, response, body) {
        debug('loaded');
        if (err)
            throw err;
        processBody(body, callback);
    });
}

function processBody(body, callback) {
    var $ = cheerio.load(body);
    var links = [];

    $('.headliners.summary a').each(function(i, elem) {
        var href = $(elem).attr('href');
        if (href.indexOf('private-event') > 0) {
            return
        } else {
            links.push('http://live.thehamiltondc.com/' + $(elem).attr('href'));
        }
    });

    var q = queue(1);

    links.forEach(function(link) {
        q.defer(getShow, link);
    });

    q.awaitAll(function(err, res) {
        if (err) return callback(err);
        var events = res.map(parseShow);
        callback(null, events);
    });
}

function getShow(link, callback) {
    debug('getting ', link);
    request(link, showload);

    function showload(err, response, body) {
        if (err) {
            debug('err' + err);
            return callback(err);
        }
        callback(null, {
            body: body,
            url: link
        });
    }
}

module.exports.parseShowBody = parseShowBody;

function parseShowBody(body) {
    var $ = cheerio.load(body),
        time = {
            doors: $('.times .doors').text().split('Doors: ')[1],
            show: $('.start.dtstart').text().split('Show: ')[1]
        },
        title = $('.headliners.summary').text().trim(),
        date = $('h2.dates').text(),
        prices = $('.price-range').text();

    var prices = $('h3.price-range').text().trim();
    var minage = null;
    var tickets = null;

    var href = $('a.tickets').attr('href');
    if (href && href.match(/ticketfly/g)) {
        tickets = href;
    }

    var soldout = false;
    if ($('.sold-out').length > 0) {
        soldout = true;
    }

    function toMoment() {
        var momentInTime = moment(date + '-' + time.show, 'dddd, MMM DD, YYYY-ha');
        return momentInTime;
    }

    var times = function() {
        return {
            doors: time.doors,
            show: time.show,
            formatted: toMoment().format('MMM D h:mma'),
            stamp: +toMoment().toDate()
        };
    };

    return {
        times: times(),
        title: title,
        prices: parsePrices(prices),
        date: date,
        minage: minage,
        tickets: tickets,
        venue_id: venueId
    };
}

function parsePrices(str) {
    // has a price range
    if (str.indexOf('-') > 0) {
        var price = str.replace(/(\$)/g, '').split(' - ');
        return {
            min: parseInt(price[0]),
            max: parseInt(price[1])
        }
    } else {
        return str.replace(/(\$)/g, '');
    }
}

function parseShow(show) {
    var data = parseShowBody(show.body);
    data.url = show.url;
    return data;
}
