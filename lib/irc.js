(function() {
  var Base, IRC, irc;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  irc = require('irc');
  Base = require('./base').Base;
  IRC = (function() {
    __extends(IRC, Base);
    function IRC() {
      IRC.__super__.constructor.apply(this, arguments);
    }
    IRC.prototype.name = "irc";
    IRC.prototype.setup = function() {
      this.channels = this.get('channels');
      this.client = new irc.Client(this.get('server'), this.get('user'), {
        channels: this.channels
      });
      return this.setupListeners();
    };
    IRC.prototype.listeningTo = function(channel) {
      return this.channels.indexOf(channel) > -1;
    };
    IRC.prototype.setupListeners = function() {
      return this.client.addListener('message', __bind(function(from, to, message) {
        if (this.listeningTo(to)) {
          return this.emit('message', {
            message: message,
            channel: to,
            user: from
          });
        }
      }, this));
    };
    return IRC;
  })();
  exports.publisher = IRC;
}).call(this);
