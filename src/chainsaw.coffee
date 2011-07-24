path   = require 'path'
sys    = require 'sys'
fs     = require 'fs'
io     = require 'socket.io'
redis  = require('./redis').RedisWrapper
web    = require('./web').Web

class Chainsaw
  
  constructor: (@config) ->
    @publishers = []
  
  # Adds a publisher to the current runner.
  add: (publisher) ->
    @publishers.push new publisher(@)
  
  addFromRequire: (path) ->
    @add require(path).publisher
  
  run: ->
    sys.puts "Starting chainsaw..."
    @redis         = new redis @
    @web           = new web @
    @broadcast     = io.listen @web.app
    @broadcast.set 'log level', 0
    for publisher in @publishers
      publisher.run()
    @web.run()
  
  visitableURL: -> 
    unless @_visitableURL?
      @_visitableURL = "http://#{@host()}"
      if @port()?
        @visitableURL += ":#{@port()}"
      @_visitableURL += "/"
    @_visitableURL
    
  host:         -> process.env.HOST or @get 'chainsaw.listen.host', 'localhost'
  port:         -> process.env.PORT or @get 'chainsaw.listen.port', 3003
    
  get: (key, defaultValue) ->
    key_parts = key.split "."
    config = @config
    while key_parts.length > 0
      part = key_parts.shift()
      config = config[part]
      return defaultValue unless config?
    config
    
  
  @run: (config_path, callback) ->
    config = JSON.parse fs.readFileSync(config_path)
    runner = new @(config)
    callback runner if callback instanceof Function
    runner.run()
    runner

Chainsaw.Base = require("./base").Base
module.exports = Chainsaw
