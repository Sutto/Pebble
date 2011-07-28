NTwitter = require 'ntwitter'
Base     = require './base'
sys      = require 'sys'

class Twitter extends Base
  
  name: "twitter"
  
  setup: ->
    config = @config()
    @twitter = new NTwitter({
      consumer_key:        config.consumer.key
      consumer_secret:     config.consumer.secret
      access_token_key:    config.access_token.key
      access_token_secret: config.access_token.secret
    })
    outer = @

  startStream: ->
    outer = this
    @twitter.stream 'statuses/filter', track: config.track, (stream) =>
      stream.on 'data', (tweet) =>
        outer.emit 'tweet', outer.filtered tweet
      stream.on 'end', (resp) ->
        sys.puts "Twitter Connection ended, Status code was #{resp.statusCode}"
        reconnect = -> outer.startStream()
        # Reconnect in 10 secodns
        setTimeout reconnect, 10000
      stream.on 'error', (error) ->
        sys.puts "Error in Twitter: #{error.message}"
  
  filtered: (tweet) ->
    text:       tweet.text
    created_at: tweet.created_at
    id_str:     tweet.id_str
    retweeted:  tweet.retweeted
    user:  
      name:              tweet.user.name
      profile_image_url: tweet.user.profile_image_url
      screen_name:       tweet.user.screen_name

module.exports = Twitter