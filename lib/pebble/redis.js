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
      this.pubsubChannel = "" + this.namespace + ":" + (this.runner.get('redis.pubsub_channel', 'pubsub'));
      this.redis = this.createConnection();
    }
    RedisWrapper.prototype.createConnection = function() {
      var r;
      r = redis.createClient(this.port, this.host);
      if (this.password != null) {
        r.auth(this.password);
      }
      return r;
    };
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
        if (err) {
          sys.puts("Had error getting history for " + key + ": " + err);
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
    RedisWrapper.prototype.publish = function(channel, message) {
      var encoded;
      encoded = JSON.stringify({
        channel: channel,
        message: message
      });
      return this.redis.publish(this.pubsubChannel, encoded);
    };
    RedisWrapper.prototype.subscribe = function() {
      var broadcaster;
      broadcaster = this.runner.broadcast;
      this.subredis = this.createConnection();
      sys.puts("Subscribing to " + this.pubsubChannel);
      this.subredis.on("message", function(channel, message) {
        var parsed;
        parsed = JSON.parse(message);
        return broadcaster.broadcastDirect(parsed.channel, parsed.message);
      });
      return this.subredis.subscribe(this.pubsubChannel);
    };
    return RedisWrapper;
  })();
  module.exports = RedisWrapper;
}).call(this);
