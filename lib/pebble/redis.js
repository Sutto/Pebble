(function() {
  var RedisWrapper, redis, sys;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  redis = require('redis');
  sys = require('sys');
  RedisWrapper = (function() {
    function RedisWrapper(runner) {
      this.runner = runner;
      this.host = process.env.REDIS_HOST || this.runner.get('redis.host', 'localhost');
      this.port = process.env.REDIS_PORT || this.runner.get('redis.port', 6379);
      this.password = process.env.REDIS_PASSWORD || this.runner.get('redis.password');
      this.namespace = this.runner.get('redis.namespace', 'juggernaut');
      this.maxHistory = this.runner.get('redis.maxHistory', 100);
      sys.puts("Connecting to Redis at " + this.host + ":" + this.port);
      this.redis = redis.createClient(this.port, this.host);
      if (this.password != null) {
        sys.puts('Authing with redis password.');
        this.redis.auth(this.password);
      }
    }
    RedisWrapper.prototype.publish = function(key, message) {
      if (message != null) {
        key = "" + this.namespace + ":" + key;
      } else {
        message = key;
        key = this.namespace;
      }
      sys.puts("Publishing to " + key);
      return this.redis.publish(key, message);
    };
    RedisWrapper.prototype.historyKeyFor = function(channel) {
      return "" + this.namespace + ":history:" + channel;
    };
    RedisWrapper.prototype.incrementCountFor = function(key, offset) {
      return this.redis.hincrby("" + this.namespace + ":" + key, offset, 1);
    };
    RedisWrapper.prototype.getCounts = function(key, maximum, callback) {
      return this.redis.hgetall("" + this.namespace + ":" + key, __bind(function(err, results) {
        var counts, i, _ref;
        if (err) {
          return callback(err);
        } else {
          counts = [];
          for (i = 0, _ref = maximum - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
            counts.push(parseInt(results[i] || "0", 10));
          }
          return callback(false, JSON.stringify(counts));
        }
      }, this));
    };
    RedisWrapper.prototype.addHistory = function(channel, data) {
      var key;
      key = this.historyKeyFor(channel);
      this.redis.lpush(key, data);
      return this.redis.ltrim(key, 0, this.maxHistory - 1);
    };
    RedisWrapper.prototype.getHistory = function(channel, callback) {
      var key;
      key = this.historyKeyFor(channel);
      return this.redis.lrange(key, 0, this.maxHistory - 1, __bind(function(err, result) {
        sys.puts("Getting history for " + key + " - " + (this.maxHistory - 1));
        if (err) {
          sys.puts("Hadd error: " + err);
          return callback(err);
        } else if (!result) {
          return callback(true);
        } else {
          return callback(false, "[" + (result.join(", ")) + "]");
        }
      }, this));
    };
    RedisWrapper.prototype.debugResponse = function(err, result) {
      sys.puts("Error: " + (sys.inspect(err)));
      return sys.puts("Result: " + (sys.inspect(result)));
    };
    return RedisWrapper;
  })();
  module.exports = RedisWrapper;
}).call(this);
