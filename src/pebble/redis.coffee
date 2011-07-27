redis = require 'redis'
sys   = require 'sys'

class RedisWrapper
  
  constructor: (@runner) ->
    @host          = process.env.REDIS_HOST     || @runner.get 'redis.host', 'localhost'
    @port          = process.env.REDIS_PORT     || @runner.get 'redis.port', 6379
    @password      = process.env.REDIS_PASSWORD || @runner.get 'redis.password'
    @namespace     = @runner.get 'redis.namespace', 'juggernaut'
    @maxHistory    = @runner.get 'redis.maxHistory', 100
    @pubsubChannel = "#{@namespace}:#{@runner.get 'redis.pubsub_channel', 'pubsub'}"
    @redis         = @createConnection()
      
  createConnection:  ->
    r = redis.createClient @port, @host
    if @password?
      r.auth @password
    r
    
  publish: (key, message) ->
    if message?
      key = "#{@namespace}:#{key}"
    else
      message = key
      key     = @namespace
    sys.puts "Publishing to #{key}"
    @redis.publish key, message
  
  historyKeyFor: (channel) -> "#{@namespace}:history:#{channel}"
  
  incrementCountFor: (key, offset) ->
    @redis.hincrby "#{@namespace}:#{key}", offset, 1
  
  getCounts: (key, maximum, callback) ->
    @redis.hgetall "#{@namespace}:#{key}", (err, results) =>
      if err
        callback err
      else
        counts = []
        for i in [0..(maximum - 1)]
          counts.push parseInt(results[i] || "0", 10)
        callback false, JSON.stringify counts
        
  
  addHistory: (channel, data) ->
    key = @historyKeyFor channel
    @redis.lpush key, data
    @redis.ltrim key, 0, @maxHistory - 1
    
  getHistory: (channel, callback) ->
    key = @historyKeyFor channel
    @redis.lrange key, 0, @maxHistory - 1, (err, result) =>
      if err
        sys.puts "Had error getting history for #{key}: #{err}"
        callback err
      else if not result
        callback true
      else
        callback false, "[#{result.join(", ")}]"
    
  debugResponse: (err, result) ->
    sys.puts "Error: #{sys.inspect err}"
    sys.puts "Result: #{sys.inspect result}"
    
  publish: (channel, message) ->
    encoded = JSON.stringify
      channel: channel
      message: message
    # Publish the given method to the pubsub channel.
    @redis.publish @pubsubChannel, encoded
  
  subscribe: ->
    # Get a reference to the broadcaster so we don't have to look it up on every message.
    broadcaster = @runner.broadcast
    # create a new redis instance just for subscribing
    @subredis    = @createConnection()
    sys.puts "Subscribing to #{@pubsubChannel}"
    @subredis.on "message", (channel, message) ->
      # We use JSON because there are issues with using the channel name on it's own
      # initially. It still needs some extra work to clean it up.
      parsed = JSON.parse message
      broadcaster.broadcastDirect parsed.channel, parsed.message
    @subredis.subscribe @pubsubChannel
      
    
    
module.exports = RedisWrapper