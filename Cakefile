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
    
isDirectory = (f) ->
  path.existsSync(f) and fs.statSync(f).isDirectory()
    
buildUnder = (input, output) ->
  files = fs.readdirSync input
  compiling   = []
  directories = []
  for file in files
    fullPath = "#{input}/#{file}"
    if file.match /\.coffee$/
      compiling.push fullPath
    else if isDirectory fullPath
      directories.push [fullPath, "#{output}/#{file}"]
  if compiling.length
    unless isDirectory output
      fs.mkdirSync output, 0755
    run ['-c', '-o', output].concat(compiling)
  if directories.length
    for directory in directories
      buildUnder directory[0], directory[1]

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
