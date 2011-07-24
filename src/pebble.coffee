path   = require 'path'
sys    = require 'sys'
fs     = require 'fs'
io     = require 'socket.io'
redis  = require('./pebble/redis').RedisWrapper
web    = require('./pebble/web').Web

class Pebble
  
  constructor: (@config) ->
    @publishers = []
  
  # Adds a publisher to the current runner.
  add: (publisher) ->
    @publishers.push new publisher(@)
  
  addFromRequire: (path) ->
    @add require(path).publisher
  
  run: ->
    sys.puts "Starting pebble..."
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
    
  host: -> process.env.HOST or @get 'pebble.listen.host', 'localhost'
  port: -> process.env.PORT or @get 'pebble.listen.port', 3003
    
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

Pebble.Base = require("./pebble/base").Base
module.exports = Pebble
