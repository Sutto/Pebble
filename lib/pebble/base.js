(function() {
  var Base, sys;
  sys = require('sys');
  Base = (function() {
    Base.prototype.name = "unknown";
    function Base(runner) {
      var _ref, _ref2;
      this.runner = runner;
            if ((_ref = this.configNamespace) != null) {
        _ref;
      } else {
        this.configNamespace = this.name;
      };
            if ((_ref2 = this.namespace) != null) {
        _ref2;
      } else {
        this.namespace = this.name;
      };
    }
    Base.prototype.isEnabled = function() {
      return this.runner.get('pebble.enabled', []).indexOf(this.name) > -1;
    };
    Base.prototype.run = function() {
      if (this.isEnabled()) {
        sys.puts("Starting publisher: " + this.name);
        return this.setup();
      }
    };
    Base.prototype.get = function(key, defaultValue) {
      return this.runner.get("" + this.configNamespace + "." + key, defaultValue);
    };
    Base.prototype.config = function() {
      return this.runner.get(this.configNamespace);
    };
    Base.prototype.emit = function(key, message) {
      if (message != null) {
        key = "" + this.namespace + ":" + key;
      } else {
        message = key;
        key = this.namespace;
      }
      this.runner.broadcast.broadcast(key, message);
      return this.runner.redis.addHistory(key, JSON.stringify(message));
    };
    Base.prototype.shouldBeRun = function() {
      return this.runner.mode === 'server' || this.runner.broadcaster === 'direct';
    };
    return Base;
  })();
  module.exports = Base;
}).call(this);
