path        = require 'path'
sys         = require 'sys'
fs          = require 'fs'
redis       = require './pebble/redis'
web         = require './pebble/web'
broadcaster = require './pebble/broadcaster'

class Pebble
  
  constructor: (@config) ->
    @publishers = []
    @version    = @packageMetadata().version
    @configure()
    
  packageMetadata: ->
    unless @_packageMetadata
      file = path.normalize "#{__dirname}/../package.json"
      contents = fs.readFileSync file
      @_packageMetadata = JSON.parse contents
    @_packageMetadata  
  
  # Adds a publisher to the current runner.
  add: (publisher) ->
    @publishers.push new publisher(@)
   
  addBuiltin: (name) ->
    try
      builtin = require "./pebble/#{name}"
      @add builtin
    catch e
      sys.puts "Unable to add builtin publisher: #{name} - #{e}"
  
  run: ->
    sys.puts "Starting pebble..."
    @redis            = new redis @
    @web              = new web @
    @broadcast        = new broadcaster @
    @broadcast.run()
    runningPublishers = ["broadcaster (#{@mode}, #{@broadcaster})"]
    for publisher in @publishers
      if publisher.shouldBeRun()
        publisher.run() 
        runningPublishers.push(publisher.name or publisher.namespace)
    if @shouldRunWeb
      @web.run()
      runningPublishers.push 'web'
    
    if runningPublishers.length
      sys.puts "Running the following publishers: #{runningPublishers.join ', '}"
    else
      sys.puts 'Not running any publishers.'
  
  visitableURL: -> 
    unless @_visitableURL?
      @_visitableURL = "http://#{@host}"
      port = @port
      if port? and port isnt 80
        @_visitableURL += ":#{port}"
      @_visitableURL += "/"
    @_visitableURL
  
  
  configure: ->
    @host         = process.env.HOST or @get 'pebble.listen.host', 'localhost'
    @port         = process.env.PORT or @get 'pebble.listen.port', 3003
    @mode         = process.env.PEBBLE_MODE        or @get 'pebble.mode', 'client'
    @broadcaster  = process.env.PEBBLE_BROADCASTER or @get 'pebble.broadcaster', 'direct'
    @shouldRunWeb = @mode is 'client' or @broadcaster is 'direct'
    
  get: (key, defaultValue) ->
    key_parts = key.split "."
    config = @config
    while key_parts.length > 0
      part = key_parts.shift()
      config = config[part]
      return defaultValue unless config?
    config
    
  
  
  @run: (configPath, includeCLI, callback) ->
    config = JSON.parse fs.readFileSync configPath
    @runWithConfig config, includeCLI, callback
  
  
  @runWithConfig: (config, includeCLI, callback) ->
    if typeof includeCLI is 'function'
      callback = includeCLI 
    else if includeCLI
      @parseCommandLine config
    runner = new @ config
    callback runner if callback instanceof Function
    runner.run()
    runner
    
  @parseCommandLine: (config = {}) ->
    argv = require('optimist').argv
    pebble = config.pebble ?= {}
    pebble.listen ?= {}
    # First, accept --host and --port
    pebble.listen.host = argv.host if argv.host
    pebble.listen.port = argv.port if argv.port
    # Next, accept the broadcaster options
    if argv.direct
      pebble.broadcaster = 'direct'
    else if argv.pubsub
      pebble.broadcaster = 'pubsub'
    else if argv.broadcaster
      pebble.broadcaster = argv.broadcaster
    # And finally also accept mode options
    if argv.client
      pebble.mode = 'client'
    else if argv.server
      pebble.mode = 'server'
    else if argv.mode
      pebble.mode = argv.mode
    if argv.help
      @printOptions()
      process.exit 1
    config
  
  @printOptions: ->
    sys.puts "Known options:"
    sys.puts "--server, --client, --mode [server,client]        - sets the mode of the current pebble-based application."
    sys.puts "--direct, --pubsub, --broadcaster [direct,pubsub] - sets the broadcaster for the current pebble-based application."
    sys.puts "--port [port]                                     - sets the http port for the current application."
    sys.puts "--host [host]                                     - sets the http host for the current application."

Pebble.Base = require './pebble/base'
module.exports = Pebble
