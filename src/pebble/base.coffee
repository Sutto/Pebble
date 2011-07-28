sys = require 'sys'
uuid = require 'node-uuid'

class Base
  
  name: "unknown"
  
  constructor: (@runner) ->
    @configNamespace?= @name
    @namespace?= @name
    
  isEnabled: -> @runner.get('pebble.enabled', []).indexOf(@name) > -1
    
  run: ->
    if @isEnabled()
      sys.puts "Starting publisher: #{@name}"
      @setup()
    
  get: (key, defaultValue) ->
    @runner.get "#{@configNamespace}.#{key}", defaultValue
  
  config: -> @runner.get @configNamespace
  
  emit: (key, message) ->
    if message?
      key = "#{@namespace}:#{key}"
    else
      message = key
      key     = @namespace
    # Generate a unique uuid for each outgoing message.
    message._id = uuid()
    @runner.broadcast.broadcast key, message
    @runner.redis.addHistory    key, JSON.stringify(message)
    
  shouldBeRun: -> @runner.mode is 'server' or @runner.broadcaster is 'direct'
  
module.exports = Base