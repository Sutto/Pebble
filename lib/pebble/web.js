(function() {
  var EventEmitter, Web, express, sys;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  express = require('express');
  sys = require('sys');
  EventEmitter = require('events').EventEmitter;
  Web = (function() {
    __extends(Web, EventEmitter);
    function Web(runner) {
      this.runner = runner;
      EventEmitter.call(this);
      this.app = express.createServer();
      this.configuration = {};
    }
    Web.prototype.configure = function() {
      this.app.configure(__bind(function() {
        this.emit("beforeConfigure", this.app, this);
        this.app.use(express.methodOverride());
        this.app.use(express.bodyParser());
        this.app.use(this.app.router);
        return this.emit("afterConfigure", this.app, this);
      }, this));
      this.app.configure('development', __bind(function() {
        this.emit("beforeDevelopmentConfigure", this.app, this);
        this.app.use(express.errorHandler({
          dumpExceptions: true,
          showStack: true
        }));
        return this.emit("afterDevelopmentConfigure", this.app, this);
      }, this));
      return this.setupEndpoints();
    };
    Web.prototype.setupEndpoints = function() {
      this.emit("beforeEndpoints", this.app, this);
      this.app.get('/version', __bind(function(req, res) {
        return this.respondWithJSON(req, res, JSON.stringify({
          application: "Pebble",
          version: this.runner.version
        }));
      }, this));
      this.app.get('/history/:key', __bind(function(req, res) {
        var key;
        key = req.params.key;
        return this.runner.redis.getHistory(key, __bind(function(err, data) {
          if (err) {
            data = this.errorResponse("Unable to get history for channel '" + key + "'");
          }
          return this.respondWithJSON(req, res, data);
        }, this));
      }, this));
      return this.emit("afterEndpoints", this.app, this);
    };
    Web.prototype.errorResponse = function(message) {
      return JSON.stringify({
        error: message
      });
    };
    Web.prototype.respondWithJSON = function(req, res, inner) {
      if (req.query.callback) {
        res.header('Content-Type', 'application/javascript');
        return res.send("" + req.query.callback + "(" + inner + ");");
      } else {
        res.header('Content-Type', 'application/json');
        return res.send(inner);
      }
    };
    Web.prototype.run = function() {
      this.configure();
      return this.app.listen(this.runner.port());
    };
    return Web;
  })();
  module.exports = Web;
}).call(this);
