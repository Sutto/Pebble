redis = require 'redis'
sys   = require 'sys'

class RedisWrapper
  
  constructor: (@runner) ->
    @host       = process.env.REDIS_HOST     || @runner.get 'redis.host', 'localhost'
    @port       = process.env.REDIS_PORT     || @runner.get 'redis.port', 6379
    @password   = process.env.REDIS_PASSWORD || @runner.get 'redis.password'
    @namespace  = @runner.get 'redis.namespace', 'juggernaut'
    @maxHistory = @runner.get 'redis.maxHistory', 100
    sys.puts "Connecting to Redis at #{@host}:#{@port}"
    @redis     = redis.createClient @port, @host
    if @password?
      sys.puts 'Authing with redis password.'
      @redis.auth @password
    
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
      sys.puts "Getting history for #{key} - #{@maxHistory - 1}"
      if err
        sys.puts "Hadd error: #{err}"
        callback err
      else if not result
        callback true
      else
        callback false, "[#{result.join(", ")}]"
    
  debugResponse: (err, result) ->
    sys.puts "Error: #{sys.inspect err}"
    sys.puts "Result: #{sys.inspect result}"
    
    
exports.RedisWrapper = RedisWrapper