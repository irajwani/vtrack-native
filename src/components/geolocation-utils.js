var glu;
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof reqqq&&reqqq;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof reqqq&&reqqq,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(reqqq,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.knotsToMeterPerSecond = knotsToMeterPerSecond;
exports.meterPerSecondToKnots = meterPerSecondToKnots;
exports.knotsToKmPerHour = knotsToKmPerHour;
exports.kmPerHourToKnots = kmPerHourToKnots;
/**
 * Convert an angle in degrees into an angle in radians
 * @param {number} angle   An angle in degrees
 * @return {number} Returns an angle in radians
 */
function degToRad(angle) {
  return angle * Math.PI / 180;
}

/**
 * Convert an angle in radians into an angle in degrees
 * @param {number} angle  An angle in radians
 * @return {number} Returns an angle in degrees
 */
function radToDeg(angle) {
  return angle * 180 / Math.PI;
}

/**
 * Convert a speed in knots into a speed in meter per second
 * 1 knot is 0.514444 m/s
 * @param {number} knots 
 * @return {number} Returns speed in m/s
 */
function knotsToMeterPerSecond(knots) {
  return knots * 0.514444;
}

/**
 * Convert a speed in meter per second into a speed in knots
 * 1 knot is 0.514444 m/s
 * @param {number} knots 
 * @return {number} Returns speed in m/s
 */
function meterPerSecondToKnots(meterPerSecond) {
  return meterPerSecond / 0.514444;
}

/**
 * Convert a speed in knots into a speed in kilometer per hour
 * 1 knot is 1.852 kilometer per hour
 * @param {number} knots   A speed in knots
 * @return {number} Returns speed in km/h
 */
function knotsToKmPerHour(knots) {
  return knots * 1.852;
}

/**
 * Convert a speed in kilometer per hour into a speed in knots
 * 1 knot is 1.852 kilometer per hour
 * @param {number} kmPerHour   A speed in km/h
 * @return {number} Returns speed in knots
 */
function kmPerHourToKnots(kmPerHour) {
  return kmPerHour / 1.852;
}
},{}],2:[function(reqqq,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cpa = cpa;
exports.cpaTime = cpaTime;
exports.cpaDistance = cpaDistance;

var _geo = reqqq('./geo');

var _convert = reqqq('./convert');

var EPSILON = 1e-8;

/**
 * Calculate the CPA (closest point of approach) for two tracks
 *
 *     !!!MINT THE UNITS (ALL SI) !!!
 *
 * - Position of the tracks is a longitude/latitude
 * - Speed is in meters per second
 * - Heading is an angle in degrees
 * - Returned time is in seconds
 * - Returned distance is in meters
 *
 * Note: this function calculates a cheap, linear approximation of CPA
 *
 * Source: http://geomalgorithms.com/a07-_distance.html
 *
 * @param {LocationHeadingSpeed} track1
 * @param {LocationHeadingSpeed} track2
 * @return {TimeDistance}  Returns an object with time (s) and distance (m)
 */
function cpa(track1, track2) {
  var _headingDistanceTo = (0, _geo.headingDistanceTo)(track1.location, track2.location),
      distance = _headingDistanceTo.distance,
      heading = _headingDistanceTo.heading;

  var dx = distance * Math.sin((0, _convert.degToRad)(heading));
  var dy = distance * Math.cos((0, _convert.degToRad)(heading));

  var tr1 = {
    position: {
      x: 0,
      y: 0
    },
    vector: {
      x: track1.speed * Math.sin((0, _convert.degToRad)(track1.heading)),
      y: track1.speed * Math.cos((0, _convert.degToRad)(track1.heading))
    }
  };

  var tr2 = {
    position: {
      x: dx,
      y: dy
    },
    vector: {
      x: track2.speed * Math.sin((0, _convert.degToRad)(track2.heading)),
      y: track2.speed * Math.cos((0, _convert.degToRad)(track2.heading))
    }
  };

  return {
    time: cpaTime(tr1, tr2), // seconds
    distance: cpaDistance(tr1, tr2) // meters
  };
}

/**
 * Compute the time of CPA for two tracks
 * @param {{position: {x, y}, vector: {x, y}}} tr1
 * @param {{position: {x, y}, vector: {x, y}}} tr2
 * @return {number} The time at which the two tracks are closest in seconds
 * @private
 */
function cpaTime(tr1, tr2) {
  var dv = subtract(tr1.vector, tr2.vector);

  var dv2 = dot(dv, dv);
  if (dv2 < EPSILON) {
    // the  tracks are almost parallel
    return 0; // any time is ok. Use time 0.
  }

  var w0 = subtract(tr1.position, tr2.position);
  return -dot(w0, dv) / dv2; // time of CPA
}

/**
 * Compute the distance at CPA for two tracks
 * @param {{position: {x, y}, vector: {x, y}}} tr1
 * @param {{position: {x, y}, vector: {x, y}}} tr2
 * @return {number} The distance for which the two tracks are closest
 * @private
 */
function cpaDistance(tr1, tr2) {
  var time = cpaTime(tr1, tr2);
  var p1 = add(tr1.position, times(time, tr1.vector));
  var p2 = add(tr2.position, times(time, tr2.vector));

  return distance(p1, p2); // distance at CPA
}

function dot(u, v) {
  return u.x * v.x + u.y * v.y;
}

function add(u, v) {
  return {
    x: u.x + v.x,
    y: u.y + v.y
  };
}

function times(factor, v) {
  return {
    x: factor * v.x,
    y: factor * v.y
  };
}

function subtract(u, v) {
  return {
    x: u.x - v.x,
    y: u.y - v.y
  };
}

function distance(u, v) {
  return norm(subtract(u, v));
}

function norm(v) {
  return Math.sqrt(dot(v, v));
}
},{"./convert":1,"./geo":3}],3:[function(reqqq,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EARTH_RADIUS = undefined;
exports.isLatLon = isLatLon;
exports.isLatLng = isLatLng;
exports.isLatitudeLongitude = isLatitudeLongitude;
exports.isLonLatTuple = isLonLatTuple;
exports.getLocationType = getLocationType;
exports.createLocation = createLocation;
exports.toLatLon = toLatLon;
exports.toLatLng = toLatLng;
exports.toLatitudeLongitude = toLatitudeLongitude;
exports.toLonLatTuple = toLonLatTuple;
exports.getLongitude = getLongitude;
exports.getLatitude = getLatitude;
exports.moveTo = moveTo;
exports.headingDistanceTo = headingDistanceTo;
exports.headingTo = headingTo;
exports.distanceTo = distanceTo;
exports.insideBoundingBox = insideBoundingBox;
exports.insidePolygon = insidePolygon;
exports.insideCircle = insideCircle;
exports.normalizeHeading = normalizeHeading;
exports.normalizeLatitude = normalizeLatitude;
exports.normalizeLongitude = normalizeLongitude;
exports.normalizeLocation = normalizeLocation;
exports.average = average;
exports.getBoundingBox = getBoundingBox;

var _pointInPolygon = reqqq('point-in-polygon');

var _pointInPolygon2 = _interopreqqqDefault(_pointInPolygon);

var _convert = reqqq('./convert');

function _interopreqqqDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var EARTH_RADIUS = exports.EARTH_RADIUS = 6378137; // Earth's radius in meters

/**
 * Test whether an object is an object containing numeric properties `lat` and `lon`
 * @param {*} object Anything
 * @param {boolean} Returns true when object is of type LatLon
 */
function isLatLon(object) {
  return !!object && typeof object.lat === 'number' && typeof object.lon === 'number';
}

/**
 * Test whether an object is an object containing numeric properties `lat` and `lng`
 * @param {*} object Anything
 * @param {boolean} Returns true when object is of type LatLng
 */
function isLatLng(object) {
  return !!object && typeof object.lat === 'number' && typeof object.lng === 'number';
}

/**
 * Test whether an object is an object containing numeric properties `latitude` and `longitude`
 * @param {*} object Anything
 * @param {boolean} Returns true when object is of type LatitudeLongitude
 */
function isLatitudeLongitude(object) {
  return !!object && typeof object.latitude === 'number' && typeof object.longitude === 'number';
}

/**
 * Test whether an object is an array containing two numbers (longitude and latitude)
 * 
 * IMPORTANT: this function cannot see the difference between an array with lat/lon
 *            or an array with lon/lat numbers. It assumes an order lon/lat.
 * 
 * @param {*} object Anything
 * @param {boolean} Returns true when object is of type LonLatTuple
 */
function isLonLatTuple(object) {
  return Array.isArray(object) && typeof object[0] === 'number' && typeof object[1] === 'number';
}

/**
 * Get the type of a location object
 * @param {Location} location
 * @return {string} Returns the type of the location object
 *                  Recognized types: 'LonLatTuple', 'LatLon', 'LatLng', 'LatitudeLongitude'
 */
function getLocationType(location) {
  if (isLonLatTuple(location)) {
    return 'LonLatTuple';
  }

  if (isLatLon(location)) {
    return 'LatLon';
  }

  if (isLatLng(location)) {
    return 'LatLng';
  }

  if (isLatitudeLongitude(location)) {
    return 'LatitudeLongitude';
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Create a location object of a specific type
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} type  Available types: 'LonLatTuple', 'LatLon', 'LatLng', 'LatitudeLongitude'
 */
function createLocation(latitude, longitude, type) {
  if (type === 'LonLatTuple') {
    return [longitude, latitude];
  }

  if (type === 'LatLon') {
    return { lat: latitude, lon: longitude };
  }

  if (type === 'LatLng') {
    return { lat: latitude, lng: longitude };
  }

  if (type === 'LatitudeLongitude') {
    return { latitude: latitude, longitude: longitude };
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Convert a location into an object with properties `lat` and `lon`
 * @param {Location} location
 * @returns {LatLon}
 */
function toLatLon(location) {
  if (isLonLatTuple(location)) {
    return {
      lat: location[1],
      lon: location[0]
    };
  }

  if (isLatLon(location)) {
    return {
      lat: location.lat,
      lon: location.lon
    };
  }

  if (isLatLng(location)) {
    return {
      lat: location.lat,
      lon: location.lng
    };
  }

  if (isLatitudeLongitude(location)) {
    return {
      lat: location.latitude,
      lon: location.longitude
    };
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Convert a location into an object with properties `lat` and `lng`
 * @param {Location} location
 * @returns {LatLng}
 */
function toLatLng(location) {
  if (isLonLatTuple(location)) {
    return {
      lat: location[1],
      lng: location[0]
    };
  }

  if (isLatLon(location)) {
    return {
      lat: location.lat,
      lng: location.lon
    };
  }

  if (isLatLng(location)) {
    return {
      lat: location.lat,
      lng: location.lng
    };
  }

  if (isLatitudeLongitude(location)) {
    return {
      lat: location.latitude,
      lng: location.longitude
    };
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Convert a location into an object with properties `latitude` and `longitude`
 * @param {Location} location
 * @returns {LatitudeLongitude}
 */
function toLatitudeLongitude(location) {
  if (isLonLatTuple(location)) {
    return {
      latitude: location[1],
      longitude: location[0]
    };
  }

  if (isLatLon(location)) {
    return {
      latitude: location.lat,
      longitude: location.lon
    };
  }

  if (isLatLng(location)) {
    return {
      latitude: location.lat,
      longitude: location.lng
    };
  }

  if (isLatitudeLongitude(location)) {
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Convert a location into a tuple `[longitude, latitude]`, as used in the geojson standard
 * 
 * Note that for example Leaflet uses a tuple `[latitude, longitude]` instead, be careful!
 * 
 * @param {Location} location
 * @returns {LonLatTuple}
 */
function toLonLatTuple(location) {
  if (isLonLatTuple(location)) {
    return [location[0], location[1]];
  }

  if (isLatLon(location)) {
    return [location.lon, location.lat];
  }

  if (isLatLng(location)) {
    return [location.lng, location.lat];
  }

  if (isLatitudeLongitude(location)) {
    return [location.longitude, location.latitude];
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Get the longitude of a location
 * @param {Location} location
 * @return {number} Returns the longitude
 */
function getLongitude(location) {
  if (isLonLatTuple(location)) {
    return location[0];
  }

  if (isLatLon(location)) {
    return location.lon;
  }

  if (isLatLng(location)) {
    return location.lng;
  }

  if (isLatitudeLongitude(location)) {
    return location.longitude;
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Get the latitude of a location object or array
 * @param {Location} location
 * @return {number} Returns the latitude
 */
function getLatitude(location) {
  if (isLonLatTuple(location)) {
    return location[1];
  }

  if (isLatLon(location)) {
    return location.lat;
  }

  if (isLatLng(location)) {
    return location.lat;
  }

  if (isLatitudeLongitude(location)) {
    return location.latitude;
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Move to a new location from a start location, heading, and distance
 *
 * This is a rough estimation.
 *
 * Source: 
 * 
 *   http://gis.stackexchange.com/questions/2951/algorithm-for-offsetting-a-latitude-longitude-by-some-amount-of-meters
 * 
 * @param {Location} from             Start location
 * @param {HeadingDistance} headingDistance   An object with property `heading` in degrees and `distance` in meters
 * @return {Location} Returns the moved location
 */
function moveTo(from, headingDistance) {
  // TODO: improve precision of this function moveTo
  var lat = getLatitude(from);
  var lon = getLongitude(from);
  var heading = headingDistance.heading,
      distance = headingDistance.distance;


  var dLat = distance * Math.cos((0, _convert.degToRad)(heading)) / EARTH_RADIUS;
  var dLon = distance * Math.sin((0, _convert.degToRad)(heading)) / (EARTH_RADIUS * Math.cos((0, _convert.degToRad)(lat)));

  return createLocation(lat + (0, _convert.radToDeg)(dLat), lon + (0, _convert.radToDeg)(dLon), getLocationType(from));
}

/**
 * Calculate the heading and distance between two locations
 *
 * Sources:
 * 
 *   http://www.movable-type.co.uk/scripts/latlong.html
 *   http://mathforum.org/library/drmath/view/55417.html
 * 
 * @param {Location} from   Start location
 * @param {Location} to     End location
 * @return {HeadingDistance}  Returns an object with `heading` in degrees and `distance` in meters
 */
function headingDistanceTo(from, to) {
  var fromLat = getLatitude(from);
  var fromLon = getLongitude(from);
  var toLat = getLatitude(to);
  var toLon = getLongitude(to);

  var lat1 = (0, _convert.degToRad)(fromLat);
  var lat2 = (0, _convert.degToRad)(toLat);
  var dlat = (0, _convert.degToRad)(toLat - fromLat);
  var dlon = (0, _convert.degToRad)(toLon - fromLon);

  var a = Math.sin(dlat / 2) * Math.sin(dlat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = EARTH_RADIUS * c;

  var y = Math.sin(dlon) * Math.cos(lat2);
  var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dlon);
  var heading = (0, _convert.radToDeg)(Math.atan2(y, x));

  return { distance: distance, heading: heading };
}

/**
 * Calculate the heading from one location to another location
 * @param {Location} center 
 * @param {Location} location 
 * @return {number} Returns an heading in degrees
 */
function headingTo(center, location) {
  return headingDistanceTo(center, location).heading;
}

/**
 * Calculate the distance between two locations
 * @param {Location} center 
 * @param {Location} location 
 * @return {number} Returns the distance in meters
 */
function distanceTo(center, location) {
  return headingDistanceTo(center, location).distance;
}

/**
 * Test whether a location lies inside a given bounding box.
 * @param {Location} location
 * @param {BoundingBox} boundingBox
 *            A bounding box containing a top left and bottom right location.
 *            The order doesn't matter.
 * @return {boolean} Returns true when the location is inside the bounding box
 *                   or on the edge.
 */
function insideBoundingBox(location, boundingBox) {
  var lat = getLatitude(location);
  var lon = getLongitude(location);

  var topLeftLon = getLongitude(boundingBox.topLeft);
  var topLeftLat = getLatitude(boundingBox.topLeft);
  var bottomRightLon = getLongitude(boundingBox.bottomRight);
  var bottomRightLat = getLatitude(boundingBox.bottomRight);

  var minLat = Math.min(topLeftLat, bottomRightLat);
  var maxLat = Math.max(topLeftLat, bottomRightLat);
  var minLon = Math.min(topLeftLon, bottomRightLon);
  var maxLon = Math.max(topLeftLon, bottomRightLon);

  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
}

/**
 * Test whether a location lies inside a given polygon
 * @param {Location} location 
 * @param {Location[]} polygon  
 * @return {boolean} Returns true when the location is inside the bounding box
 *                   or on the edge.
 */
function insidePolygon(location, polygon) {
  if (!polygon || !Array.isArray(polygon)) {
    throw new TypeError('Invalid polygon. Array with locations expected');
  }
  if (polygon.length === 0) {
    throw new TypeError('Invalid polygon. Non-empty Array expected');
  }

  return (0, _pointInPolygon2.default)(toLonLatTuple(location), polygon.map(toLonLatTuple));
}

/**
 * Test whether a location lies inside a circle with certain radius
 * @param {Location} location 
 * @param {Location} center 
 * @param {number} radius    A radius in meters
 * @return {boolean} Returns true when the location lies inside or 
 *                   on the edge of the circle
 */
function insideCircle(location, center, radius) {
  return distanceTo(center, location) <= radius;
}

/**
 * Normalize an heading into the range [0, 360)
 * @param {number} heading   An heading in degrees
 * @return {number} Returns the normalized heading (degrees)
 */
function normalizeHeading(heading) {
  var normalized = heading % 360;

  if (normalized < 0) {
    normalized += 360;
  }

  if (normalized >= 360) {
    normalized -= 360;
  }

  return normalized;
}

/**
 * Normalize a latitude into the range [-90, 90] (upper and lower bound included)
 * 
 * See https://stackoverflow.com/questions/13368525/modulus-to-limit-latitude-and-longitude-values
 * 
 * @param {number} latitude 
 * @return {number} Returns the normalized latitude
 */
function normalizeLatitude(latitude) {
  return Math.asin(Math.sin(latitude / 180 * Math.PI)) * (180 / Math.PI);
}
/**
 * Normalize a longitude into the range (-180, 180] (lower bound excluded, upper bound included)
 * 
 * @param {number} longitude 
 * @return {number} Returns the normalized longitude
 */
function normalizeLongitude(longitude) {
  var normalized = longitude % 360;

  if (normalized > 180) {
    normalized -= 360;
  }

  if (normalized <= -180) {
    normalized += 360;
  }

  return normalized;
}

/**
 * Normalize the longitude and latitude of a location.
 * Latitude will be in the range [-90, 90] (upper and lower bound included)
 * Lontitude will be in the range (-180, 180] (lower bound excluded, upper bound included)
 * @param {Location} location 
 * @return {Location} Returns the normalized location
 */
function normalizeLocation(location) {
  if (isLonLatTuple(location)) {
    return [normalizeLongitude(location[0]), normalizeLatitude(location[1])];
  }

  if (isLatLon(location)) {
    return {
      lat: normalizeLatitude(location.lat),
      lon: normalizeLongitude(location.lon)
    };
  }

  if (isLatLng(location)) {
    return {
      lat: normalizeLatitude(location.lat),
      lng: normalizeLongitude(location.lng)
    };
  }

  if (isLatitudeLongitude(location)) {
    return {
      latitude: normalizeLatitude(location.latitude),
      longitude: normalizeLongitude(location.longitude)
    };
  }

  throw new Error('Unknown location format ' + JSON.stringify(location));
}

/**
 * Calculate the average of a list with locations
 * @param {Location[]} locations 
 * @return {Location} Returns the average location or null when the list is empty
 *                    Location has the same structure as the first location from
 *                    the input array.
 */
function average(locations) {
  if (!Array.isArray(locations) || locations.length === 0) {
    return null;
  }

  var first = locations[0];
  var latitude = avg(locations.map(getLatitude));
  var longitude = avg(locations.map(getLongitude));

  return createLocation(latitude, longitude, getLocationType(first));
}

/**
 * Get the bounding box of a list with locations
 * @param {Locations[]} locations
 * @param {number} [margin]   Optional margin in meters. Zero by default.
 * @return {BoundingBox} Returns a bounding box described by it's top left 
 *                       and bottom right location
 */
function getBoundingBox(locations) {
  var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!Array.isArray(locations) || locations.length === 0) {
    return {
      topLeft: null,
      bottomRight: null
    };
  }

  var type = getLocationType(locations[0]);
  var topLeftLat = Math.max.apply(Math, _toConsumableArray(locations.map(getLatitude)));
  var topLeftLon = Math.min.apply(Math, _toConsumableArray(locations.map(getLongitude)));
  var bottomRightLat = Math.min.apply(Math, _toConsumableArray(locations.map(getLatitude)));
  var bottomRightLon = Math.max.apply(Math, _toConsumableArray(locations.map(getLongitude)));

  var topLeft = createLocation(topLeftLat, topLeftLon, type);
  var bottomRight = createLocation(bottomRightLat, bottomRightLon, type);

  if (margin === null || margin === 0) {
    // no margin
    return { topLeft: topLeft, bottomRight: bottomRight };
  } else {
    // add a margin in meters
    var distance = Math.SQRT2 * margin;
    return {
      topLeft: moveTo(topLeft, { heading: 315, distance: distance }),
      bottomRight: moveTo(bottomRight, { heading: 135, distance: distance })
    };
  }
}

/**
 * Calculate the average of a list with numbers
 * @param {number[]} values 
 * @return {number}
 */
function avg(values) {
  return sum(values) / values.length;
}

/**
 * calculate the sum of a list with numbers
 * @param {number[]} values 
 * @return {number} Returns the sum
 */
function sum(values) {
  return values.reduce(function (a, b) {
    return a + b;
  }, 0);
}
},{"./convert":1,"point-in-polygon":5}],4:[function(reqqq,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _convert = reqqq('./convert');

Object.keys(_convert).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _convert[key];
    }
  });
});

var _geo = reqqq('./geo');

Object.keys(_geo).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _geo[key];
    }
  });
});

var _cpa = reqqq('./cpa');

Object.defineProperty(exports, 'cpa', {
  enumerable: true,
  get: function get() {
    return _cpa.cpa;
  }
});
},{"./convert":1,"./cpa":2,"./geo":3}],5:[function(reqqq,module,exports){
module.exports = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

},{}],6:[function(reqqq,module,exports){
// import { 
//   toLatLon, toLatitudeLongitude, headingDistanceTo, moveTo, insideCircle
// } from 'geolocation-utils';

glu = reqqq('geolocation-utils');


},{"geolocation-utils":4}]},{},[6]);


module.exports = glu;