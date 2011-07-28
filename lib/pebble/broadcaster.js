(function() {
  var Broadcaster, io;
  io = require('socket.io');
  Broadcaster = (function() {
    function Broadcaster(runner) {
      this.runner = runner;
      this.broadcaster = this.runner.broadcaster;
      this.mode = this.runner.mode;
    }
    Broadcaster.prototype.run = function() {
      if (this.broadcaster === 'direct') {
        this.broadcast = this.broadcastDirect;
        return this.setupClient();
      } else if (this.broadcaster === 'pubsub') {
        this.broadcast = this.broadcastViaPub;
        return this.setupPubSub();
      }
    };
    Broadcaster.prototype.setupClient = function() {
      this.io = io.listen(this.runner.web.app);
      return this.io.set('log level', 0);
    };
    Broadcaster.prototype.setupPubSub = function() {
      if (this.mode === 'client') {
        this.setupClient();
        return this.runner.redis.subscribe();
      }
    };
    Broadcaster.prototype.broadcastDirect = function(channel, data) {
      return this.io.sockets.emit(channel, data);
    };
    Broadcaster.prototype.broadcastViaPub = function(channel, data) {
      return this.runner.redis.publish(channel, data);
    };
    return Broadcaster;
  })();
  module.exports = Broadcaster;
}).call(this);
