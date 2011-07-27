(function() {
  var Pebble, broadcaster, fs, path, redis, sys, web;
  path = require('path');
  sys = require('sys');
  fs = require('fs');
  redis = require('./pebble/redis');
  web = require('./pebble/web');
  broadcaster = require('./pebble/broadcaster');
  Pebble = (function() {
    function Pebble(config) {
      this.config = config;
      this.publishers = [];
      this.version = this.packageMetadata().version;
      this.configure();
    }
    Pebble.prototype.packageMetadata = function() {
      var contents, file;
      if (!this._packageMetadata) {
        file = path.normalize("" + __dirname + "/../package.json");
        contents = fs.readFileSync(file);
        this._packageMetadata = JSON.parse(contents);
      }
      return this._packageMetadata;
    };
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
      var publisher, runningPublishers, _i, _len, _ref;
      sys.puts("Starting pebble...");
      this.redis = new redis(this);
      this.web = new web(this);
      this.broadcast = new broadcaster(this);
      this.broadcast.run();
      runningPublishers = ["broadcaster (" + this.mode + ", " + this.broadcaster + ")"];
      _ref = this.publishers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        publisher = _ref[_i];
        if (publisher.shouldBeRun()) {
          publisher.run();
          runningPublishers.push(publisher.name || publisher.namespace);
        }
      }
      if (this.shouldRunWeb) {
        this.web.run();
        runningPublishers.push('web');
      }
      if (runningPublishers.length) {
        return sys.puts("Running the following publishers: " + (runningPublishers.join(', ')));
      } else {
        return sys.puts('Not running any publishers.');
      }
    };
    Pebble.prototype.visitableURL = function() {
      var port;
      if (this._visitableURL == null) {
        this._visitableURL = "http://" + this.host;
        port = this.port;
        if ((port != null) && port !== 80) {
          this._visitableURL += ":" + port;
        }
        this._visitableURL += "/";
      }
      return this._visitableURL;
    };
    Pebble.prototype.configure = function() {
      this.host = process.env.HOST || this.get('pebble.listen.host', 'localhost');
      this.port = process.env.PORT || this.get('pebble.listen.port', 3003);
      this.mode = process.env.PEBBLE_MODE || this.get('pebble.mode', 'client');
      this.broadcaster = process.env.PEBBLE_BROADCASTER || this.get('pebble.broadcaster', 'direct');
      return this.shouldRunWeb = this.mode === 'client' || this.broadcaster === 'direct';
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
    Pebble.run = function(configPath, includeCLI, callback) {
      var config;
      config = JSON.parse(fs.readFileSync(configPath));
      return this.runWithConfig(config, includeCLI, callback);
    };
    Pebble.runWithConfig = function(config, includeCLI, callback) {
      var runner;
      if (typeof includeCLI === 'function') {
        callback = includeCLI;
      } else if (includeCLI) {
        this.parseCommandLine(config);
      }
      runner = new this(config);
      if (callback instanceof Function) {
        callback(runner);
      }
      runner.run();
      return runner;
    };
    Pebble.parseCommandLine = function(config) {
      var argv, pebble, _ref, _ref2;
      if (config == null) {
        config = {};
      }
      argv = require('optimist').argv;
      pebble = (_ref = config.pebble) != null ? _ref : config.pebble = {};
            if ((_ref2 = pebble.listen) != null) {
        _ref2;
      } else {
        pebble.listen = {};
      };
      if (argv.host) {
        pebble.listen.host = argv.host;
      }
      if (argv.port) {
        pebble.listen.port = argv.port;
      }
      if (argv.direct) {
        pebble.broadcaster = 'direct';
      } else if (argv.pubsub) {
        pebble.broadcaster = 'pubsub';
      } else if (argv.broadcaster) {
        pebble.broadcaster = argv.broadcaster;
      }
      if (argv.client) {
        pebble.mode = 'client';
      } else if (argv.server) {
        pebble.mode = 'server';
      } else if (argv.mode) {
        pebble.mode = argv.mode;
      }
      if (argv.help) {
        this.printOptions();
        process.exit(1);
      }
      return config;
    };
    Pebble.printOptions = function() {
      sys.puts("Known options:");
      sys.puts("--server, --client, --mode [server,client]        - sets the mode of the current pebble-based application.");
      sys.puts("--direct, --pubsub, --broadcaster [direct,pubsub] - sets the broadcaster for the current pebble-based application.");
      sys.puts("--port [port]                                     - sets the http port for the current application.");
      return sys.puts("--host [host]                                     - sets the http host for the current application.");
    };
    return Pebble;
  })();
  Pebble.Base = require('./pebble/base');
  module.exports = Pebble;
}).call(this);
