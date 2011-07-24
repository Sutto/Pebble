irc  = require('irc')
Base = require('./base').Base

class IRC extends Base
  
  name: "irc"
  
  setup: ->
    @channels = @get('channels')
    @client = new irc.Client @get('server'), @get('user'),
      channels: @channels
    @setupListeners()
    
  listeningTo: (channel) ->
    @channels.indexOf(channel) > -1
    
  setupListeners: ->
    @client.addListener 'message', (from, to, message) =>
      if @listeningTo to
        @emit 'message',
          message: message
          channel: to,
          user:    from
        
exports.publisher = IRC