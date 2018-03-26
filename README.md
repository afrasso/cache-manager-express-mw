# cache-manager-express-mw

Middleware for Express that uses cache-manager to add a caching layer in front of your application.

## Features

* [cache-manager](https://github.com/BryanDonovan/node-cache-manager) is a robust caching solution for node that provides a number of features.
* Uses [HTTP/1.1 Cache-Control header](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9) to control the cache behavior.
* Cache keys are autogenerated based on the HTTP method and route to ensure consistency.

## Installation

    npm install cache-manager-express-mw

## Examples

You can register the middleware globally using ```app.use()```.
```js
var cacheManager = require("cache-manager");
var cache = cacheManager.caching({ store: "memory" });

var cacheManagerExpress = require("cache-manager-express-mw");
app.use(cacheManagerExpress({ cache }));
```

Alternatively, you register the middleware with a specific route to allow for different routes to use different caching mechanisms and options:
```js
app.get("/", cacheManagerExpress({ cache }), (req, res) => {
  // ...
});
```

In addition to the cache, you can pass in a options object to control the behavior of the middleware:
```js
var cacheManagerExpress = require("cache-manager-express-mw");
app.use(cacheManagerExpress({ cache, options: { prefix: "MyApp" } }));
```

A fully functional sample app is available in this repository under the [sample](sample) directory.

## Options

| Property  | Default   | Description                                                                                   |
| ----------|-----------|-----------------------------------------------------------------------------------------------|
| prefix    | undefined | A prefix to append to the front of the generated cache key in case differentiation is needed. |
| defaults  | undefined | An object containing query string default values so that a missing query string value and the specified default resolve to the same cache key. For example, ```{ defaults: { val: "abc" } }``` will ensure that the routes ```/a/b/c``` and ```/a/b/c?val=abc``` resolve to the same cache key. |
| headers   | undefined | A list of headers whose values should be included in the cache key. For example, { headers: [ "Authorization" ] } will include the value of the "Authorization" header in the cache key, so calls made with different Authorization headers won't result in cache hits, but calls with the same Authorization headers will. |
| callbacks | undefined | An object containing one or more callback functions (see [Callbacks](#callbacks) below). |

## Callbacks

It is possible to specify callback functions that are called when an during attempts to retrieve a value from the cache:

* `onAttempt(key)`: executed when any attempt is made to retrieve a value from the cache
* `onHit(key, value)`: executed when a cache hit occurs and the value is retrieved from the cache
* `onMiss(key)`: executed when a cache miss occurs and the value is not present in the cache
* `onError(err, key)`: executed when an error occurs during the attempt to retrieve a value from the cache

## Changelog

### 0.3.0

* Using ES6 syntax.
* Changed cacheManagerExpress function to take an object `{ cache, options }` rather than the parameters separately.

## License

[MIT](LICENSE)
