(function() {
  var Chainsaw;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Chainsaw = (function() {
    Chainsaw.run = function(host, callback) {
      var chainsaw;
      chainsaw = new Chainsaw;
      callback(chainsaw);
      return chainsaw;
    };
    function Chainsaw(host) {
      this.events = {};
      this.socket = io.connect(host);
    }
    Chainsaw.prototype.on = function(event, callback) {
      var _base, _ref;
            if ((_ref = (_base = this.events)[event]) != null) {
        _ref;
      } else {
        _base[event] = [];
      };
      return this.events[event].push(callback);
    };
    Chainsaw.prototype.watchAll = function() {
      var callback, channels, name, _results;
      channels = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (name in channels) {
        callback = channels[name];
        _results.push(this.watch(name, callback));
      }
      return _results;
    };
    Chainsaw.prototype.watch = function(channel, callback) {
      this.on(channel, callback);
      return this.loadHistoryFor(this, channel, __bind(function() {
        return this.socket.on(channel, __bind(function(data) {
          return this.receive(channel, data);
        }, this));
      }, this));
    };
    Chainsaw.prototype.trigger = function() {
      var args, callback, callbacks, name, _base, _i, _len, _ref, _results;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      callbacks = ((_ref = (_base = this.events)[name]) != null ? _ref : _base[name] = []);
      _results = [];
      for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
        callback = callbacks[_i];
        _results.push(callback.apply(this, args));
      }
      return _results;
    };
    Chainsaw.prototype.disconnected = function(callback) {
      return this.on('disconnect', callback);
    };
    Chainsaw.prototype.connected = function(callback) {
      return this.on('connect', callback);
    };
    Chainsaw.prototype.reconnected = function(callback) {
      return this.on('reconnect', callback);
    };
    Chainsaw.prototype.receive = function(channel, message) {
      return this.trigger(channel, message);
    };
    Chainsaw.prototype.loadHistory = function(channel, callback) {
      return $.getJSON("/history/" + channel, __bind(function(data) {
        var message, _i, _len, _ref;
        _ref = data.reverse();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          message = _ref[_i];
          this.receive(channel, message);
        }
        if (callback instanceof Function) {
          return callback();
        }
      }, this));
    };
    return Chainsaw;
  })();
  window['Chainsaw'] = Chainsaw;
}).call(this);
