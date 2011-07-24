(function() {
  var Chainsaw, fs, io, path, redis, sys, web;
  path = require('path');
  sys = require('sys');
  fs = require('fs');
  io = require('socket.io');
  redis = require('./redis').RedisWrapper;
  web = require('./web').Web;
  Chainsaw = (function() {
    function Chainsaw(config) {
      this.config = config;
      this.publishers = [];
    }
    Chainsaw.prototype.add = function(publisher) {
      return this.publishers.push(new publisher(this));
    };
    Chainsaw.prototype.addFromRequire = function(path) {
      return this.add(require(path).publisher);
    };
    Chainsaw.prototype.run = function() {
      var publisher, _i, _len, _ref;
      sys.puts("Starting chainsaw...");
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
    Chainsaw.prototype.visitableURL = function() {
      if (this._visitableURL == null) {
        this._visitableURL = "http://" + (this.host());
        if (this.port() != null) {
          this.visitableURL += ":" + (this.port());
        }
        this._visitableURL += "/";
      }
      return this._visitableURL;
    };
    Chainsaw.prototype.host = function() {
      return process.env.HOST || this.get('chainsaw.listen.host', 'localhost');
    };
    Chainsaw.prototype.port = function() {
      return process.env.PORT || this.get('chainsaw.listen.port', 3003);
    };
    Chainsaw.prototype.get = function(key, defaultValue) {
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
    Chainsaw.run = function(config_path, callback) {
      var config, runner;
      config = JSON.parse(fs.readFileSync(config_path));
      runner = new this(config);
      if (callback instanceof Function) {
        callback(runner);
      }
      runner.run();
      return runner;
    };
    return Chainsaw;
  })();
  Chainsaw.Base = require("./base").Base;
  module.exports = Chainsaw;
}).call(this);
