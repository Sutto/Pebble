fs            = require 'fs'
path          = require 'path'
{spawn, exec} = require 'child_process'

# Compiles source files into the lib folder
run = (args, cb) ->
  proc =         spawn 'coffee', args
  proc.stderr.on 'data', (buffer) -> console.log buffer.toString()
  proc.on        'exit', (status) ->
    process.exit(1) if status != 0
    cb() if typeof cb is 'function'
    
buildUnder = (input, output) ->
  files = fs.readdirSync input
  files = (input + '/' + file for file in files when file.match(/\.coffee$/))
  run ['-c', '-o', output].concat(files)

task 'build:library', 'builds the library from coffee-script library', bl = ->
  console.log "Building the private server JavaScript..."
  buildUnder 'src', 'lib'
  
task 'build:client', 'builds the client from coffee-script library', bc = ->
  console.log "Building the public client JavaScript..."
  buildUnder 'public/coffeescripts', 'public/javascripts'
  
task 'build', 'builds both the library and the client', ->
  console.log "Building all..."
  bl()
  bc()
