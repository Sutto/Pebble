(function() {
  var Base, NTwitter, Twitter, sys;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  NTwitter = require('ntwitter');
  Base = require('./base').Base;
  sys = require('sys');
  Twitter = (function() {
    __extends(Twitter, Base);
    function Twitter() {
      Twitter.__super__.constructor.apply(this, arguments);
    }
    Twitter.prototype.name = "twitter";
    Twitter.prototype.setup = function() {
      var config, outer;
      config = this.config();
      this.twitter = new NTwitter({
        consumer_key: config.consumer.key,
        consumer_secret: config.consumer.secret,
        access_token_key: config.access_token.key,
        access_token_secret: config.access_token.secret
      });
      outer = this;
      return this.twitter.stream('statuses/filter', {
        track: config.track
      }, __bind(function(stream) {
        stream.on('data', __bind(function(tweet) {
          return outer.emit('tweet', outer.filtered(tweet));
        }, this));
        stream.on('end', function(resp) {
          return sys.puts("Twitter Connection ended, Status code was " + resp.statusCode);
        });
        return stream.on('error', function(error) {
          return sys.puts("Error in Twitter: " + error.message);
        });
      }, this));
    };
    Twitter.prototype.filtered = function(tweet) {
      return {
        text: tweet.text,
        created_at: tweet.created_at,
        id_str: tweet.id_str,
        retweeted: tweet.retweeted,
        user: {
          name: tweet.user.name,
          profile_image_url: tweet.user.profile_image_url,
          screen_name: tweet.user.screen_name
        }
      };
    };
    return Twitter;
  })();
  exports.publisher = Twitter;
}).call(this);
