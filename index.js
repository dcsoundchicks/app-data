module.exports.venueListings = require('./venue-listings');

module.exports.sourceMap = sourceMap = {};

module.exports.venueListings.features.forEach(function(feat) {
  sourceMap[feat.properties.id] = feat;
});