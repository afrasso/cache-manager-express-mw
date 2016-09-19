var getCacheKey = require("../../helpers/getcachekey.js"),
    expect      = require("chai").expect;

describe("GetCacheKey", function() {
  var context;

  beforeEach(function() {
    context = { };

    context.request = {
      method: "GET",
      path: "/a/b/c"
    };
  });

  describe("Getting a cache key for a request", function() {
    it("should return the expected key", function() {
      var key = getCacheKey(context.request);
      expect(key).to.equal("GET:/a/b/c");
    });
  });

  describe("Getting a cache key for a request with a prefix", function() {
    it("should return the expected key", function() {
      var key = getCacheKey(context.request, "MyPrefix");
      expect(key).to.equal("MyPrefix:GET:/a/b/c");
    });
  });

  describe("Getting a cache key for a request with a prefix with a colon suffix", function() {
    it("should return the expected key", function() {
      var key = getCacheKey(context.request, "MyPrefix:");
      expect(key).to.equal("MyPrefix:GET:/a/b/c");
    });
  });

  describe("Getting a cache key for a request with a query string", function() {
    it("should return the expected key", function() {
      context.request.query = { def: 123 };
      var key = getCacheKey(context.request);
      expect(key).to.equal("GET:/a/b/c?def=123");
    });
  });

  describe("Getting a cache key for a request with a query string with no values", function() {
    it("should return the expected key", function() {
      context.request.query = { def: null };
      var key = getCacheKey(context.request);
      expect(key).to.equal("GET:/a/b/c");
    });
  });

  describe("Getting a cache key for a request with a query string and a default value", function() {
    it("should return the expected key", function() {
      context.request.query = { def: 123 };
      var key = getCacheKey(context.request, null, { ghi: false });
      expect(key).to.equal("GET:/a/b/c?def=123&ghi=false");
    });

    it("should not be overwritten by the default value if present", function() {
      context.request.query = { def: 123 };
      var key = getCacheKey(context.request, null, { def: false });
      expect(key).to.equal("GET:/a/b/c?def=123");
    });
  });
});