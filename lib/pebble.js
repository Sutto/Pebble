(function() {
  var Pebble, fs, io, path, redis, sys, web;
  path = require('path');
  sys = require('sys');
  fs = require('fs');
  io = require('socket.io');
  redis = require('./pebble/redis');
  web = require('./pebble/web');
  Pebble = (function() {
    function Pebble(config) {
      this.config = config;
      this.publishers = [];
    }
    Pebble.prototype.add = function(publisher) {
      return this.publishers.push(new publisher(this));
    };
    Pebble.prototype.addBuiltin = function(name) {
      var builtin;
      try {
        builtin = require("./pebble/" + name);
        return this.add(builtin);
      } catch (e) {
        return sys.puts("Unable to add builtin publisher: " + name + " - " + e);
      }
    };
    Pebble.prototype.run = function() {
      var publisher, _i, _len, _ref;
      sys.puts("Starting pebble...");
      this.redis = new redis(this);
      this.web = new web(this);
      this.broadcast = io.listen(this.web.app);
      this.broadcast.set('log level', 0);
      _ref = this.publishers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        publisher = _ref[_i];
        publisher.run();
      }
      return this.web.run();
    };
    Pebble.prototype.visitableURL = function() {
      var port;
      if (this._visitableURL == null) {
        this._visitableURL = "http://" + (this.host());
        port = this.port();
        if ((port != null) && port !== 80) {
          this._visitableURL += ":" + port;
        }
        this._visitableURL += "/";
      }
      return this._visitableURL;
    };
    Pebble.prototype.host = function() {
      return process.env.HOST || this.get('pebble.listen.host', 'localhost');
    };
    Pebble.prototype.port = function() {
      return process.env.PORT || this.get('pebble.listen.port', 3003);
    };
    Pebble.prototype.get = function(key, defaultValue) {
      var config, key_parts, part;
      key_parts = key.split(".");
      config = this.config;
      while (key_parts.length > 0) {
        part = key_parts.shift();
        config = config[part];
        if (config == null) {
          return defaultValue;
        }
      }
      return config;
    };
    Pebble.run = function(config_path, callback) {
      var config, runner;
      config = JSON.parse(fs.readFileSync(config_path));
      runner = new this(config);
      if (callback instanceof Function) {
        callback(runner);
      }
      runner.run();
      return runner;
    };
    return Pebble;
  })();
  Pebble.Base = require('./pebble/base');
  module.exports = Pebble;
}).call(this);
