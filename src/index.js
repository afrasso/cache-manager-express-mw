var _       = require("lodash"),
    Promise = require("bluebird");

var caching = function(cache, options) {
  var prefix = options && options.prefix ? `${options.prefix}:` : "";
  var cacheControlAccessibility =
    options && options.cacheControlAccessibility ? options.cacheControlAccessibility : "public";

  var isProduction = function() {
    return process.env.NODE_ENV === "production";
  };

  var getMaxAge = function(res) {
    var cacheControlHeader = res.get("Cache-Control");
    if (!cacheControlHeader) {
      return;
    }
    var match = cacheControlHeader.match(/.*max-age=(\d+).*/);
    if (!match || match.length < 2) {
      return;
    }
    var maxAge = parseInt(match[1]);
    return maxAge;
  };

  var getValue = function(key) {
    return new Promise(function(resolve, reject) {
      cache.get(key, function(err, result) {
        if (err) {
          if (!isProduction()) {
            console.warn("Error retrieving value from cache: " + err);
          }
        }
        resolve(result);
      });
    });
  };

  var getTtl = function(key) {
    if (typeof cache.ttl !== "function") {
      return Promise.resolve();
    }
    return new Promise(function(resolve, reject) {
      cache.ttl(key, function(err, result) {
        if (err) {
          if (!isProduction()) {
            console.warn("Error retrieving ttl from cache: " + err);
          }
        }
        resolve(result);
      });
    });
  };

  var setCacheControlHeader = function(res, ttl) {
    if (ttl) {
      res.set("Cache-Control", `${cacheControlAccessibility}, max-age=${ttl}`);
    }
  };

  var handleCacheHit = function(res, key, value) {
    getTtl(key)
      .then(ttl => setCacheControlHeader(res, ttl))
      .then(x => {
        // This is dumb, but it results in a prettier JSON format
        try {
          var obj = JSON.parse(value.body);
          res.status(value.statusCode).json(obj);
        } catch (error) {
          res.status(value.statusCode).send(value.body);
        }
      });
  };

  var handleCacheMiss = function(res, key) {
    var send = res.send.bind(res);

    res.send = function(body) {
      var ret = send(body);

      if (/^2/.test(res.statusCode)) {
        cache.set(key, { statusCode: res.statusCode, body: body }, { ttl: getMaxAge(res) }, function(err) {
          if (!isProduction()) {
            console.warn("Error setting value in cache: " + err);
          }
        });
      }

      return ret;
    };
  };

  var middleware = function(req, res, next) {
    if (!cache) {
      next();
      return;
    }

    var query = _.assign({ }, options.defaults, req.query);
    var sortedQueryString = _(query).keys().sortBy().map(key => `${key}=${query[key]}`).join("&");
    var key = `${prefix}${req.method}:${req.path}?${sortedQueryString}`;

    getValue(key)
      .then(value => {
        if (value) {
          handleCacheHit(res, key, value);
        } else {
          handleCacheMiss(res, key);
          next();
        }
      })
      .catch(error => {
        if (!isProduction()) {
          console.warn("Error accessing cache: " + err);
        }
        next();
      });
  };

  return middleware;
};

module.exports = caching;
