io = require 'socket.io'

# Broadcasters are two different methods of broadcasting messages.
# Namely:
# A) Redis pub/sub based (similar to Juggernaut 2)
# B) In process - Using a single parent process.

class Broadcaster
  
  # Config options include direct and pubsub.
  # Note that mode only matters when running as pub sub.
  constructor: (@runner) ->
    @broadcaster = @runner.broadcaster
    @mode        = @runner.mode
  
  run: ->
    if @broadcaster is 'direct'
      @broadcast = @broadcastDirect
      @setupClient()
    else if @broadcaster is 'pubsub'
      @broadcast = @broadcastViaPub
      @setupPubSub()

  setupClient: ->
    @io = io.listen @runner.web.app
    @io.set 'log level', 0
    @io.configure 'production', =>
      @io.enable 'browser client minification'
      @io.enable 'browser client etag'
    
    
  setupPubSub: ->
    # When it's indirect, we need to do some type conditional setup.
    if @mode is 'client'
      @setupClient()
      @runner.redis.subscribe()
    
  broadcastDirect: (channel, data) -> @io.sockets.emit channel, data
  
  broadcastViaPub: (channel, data) -> @runner.redis.publish channel, data

module.exports = Broadcaster
    