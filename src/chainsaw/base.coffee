sys = require 'sys'

class Base
  
  name: "unknown"
  
  constructor: (@runner) ->
    @configNamespace?= @name
    @namespace?= @name
    
  isEnabled: -> @runner.get('chainsaw.enabled', []).indexOf(@name) > -1
    
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
    @runner.io.sockets.emit  key, message
    @runner.redis.addHistory key, JSON.stringify(message)
  
exports.Base = Base