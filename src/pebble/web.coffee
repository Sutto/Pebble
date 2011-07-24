express      = require 'express'
sys          = require 'sys'
EventEmitter = require('events').EventEmitter

class Web extends EventEmitter

  constructor: (@runner) ->
    EventEmitter.call @
    @app = express.createServer()
    @configuration = {}
    
  configure: ->
    @app.configure =>
      @emit "beforeConfigure", @app, @
      @app.use express.methodOverride()
      @app.use express.bodyParser()
      @app.use @app.router
      @emit "afterConfigure", @app, @
    @app.configure 'development', =>
      @emit "beforeDevelopmentConfigure", @app, @
      @app.use express.errorHandler
        dumpExceptions: true
        showStack: true
      @emit "afterDevelopmentConfigure", @app, @
    @setupEndpoints()

  setupEndpoints: ->
    @emit "beforeEndpoints", @app, @
    @app.get '/version', (req, res) =>
      @respondWithJSON req, res, JSON.stringify
        application: "Pebble"
        version:     @runner.version
    @app.get '/history/:key', (req, res) =>
      key = req.params.key
      @runner.redis.getHistory key, (err, data) =>
        if err
          data = @errorResponse "Unable to get history for channel '#{key}'"
        @respondWithJSON req, res, data
    @emit "afterEndpoints", @app, @
  
  errorResponse: (message) ->
    JSON.stringify
      error: message
      
  respondWithJSON: (req, res, inner) ->
    if req.query.callback
      res.header 'Content-Type', 'application/javascript'
      res.send "#{req.query.callback}(#{inner});"
    else
      res.header 'Content-Type', 'application/json'
      res.send inner
      
  
  run: ->
    @configure()
    @app.listen @runner.port()

    
exports.Web = Web