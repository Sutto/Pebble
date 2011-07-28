# Pebble

Pebble is real time event streams / pub sub done simply.

* Cleaner in terms of code
* Simpler to run (One process, versus many)
* Easy to extend (based on a simple publisher model)

With the whole goal of making real time event streams (pulling events
from external sources) as simple as possible.

Originally built for [Rails Rumble 2010](http://www.railsrumble.com/) like
I built prior versions for earlier rumbles.

## Getting Started

First, make sure you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

Next, install the package and then you can do the following:

```coffeescript
config = path.normalize("#{__dirname}/config.json")

MyCustomPublisher = require 'my_customer_publisher'

runner = Pebble.run config, (runner) ->
  # Defines a given runner, by default these are irc and
  # twitter
  runner.addBuiltin 'twitter'
  runner.add MyCustomPublisher
  
puts "App is now running on on #{runner.visitableURL()}"

```

### Writing a Publisher

Publishers are just the general idea of a configurable item which can push things to the notifications list.
For example, to implement a simple publisher, you can do (in CoffeeScript):

```coffeescript
Base = require('pebble').Base

class MyPublisher extends Base
  name: "my-publisher"
  
  setup: ->
    # Called automatically.
    stored_name = @get "name" # gets name in the my-publisher key in the configuration
    setInterval((=>
      @emit some: "data"
    ), 10000)
    
module.exports = MyPublisher
```
        
You define a setup method that starts doing processing, configure a name (and optionally, `namespace`
for events and `configNamespace` for the configuration json namespace). This simple yet flexible architecture
makes it possible to build a wide variety of publishers.

To use a publisher in your app, just require the file and use:

```coffeescript
runner_instance.add YourPublisher
```

Like is seen above.

### Different Modes & Broadcasters

Pebble can be run in two modes (`client` (the default) and `server`, set via `pebble.mode`) as well as with two different broadcaster options
(`pubsub` or `direct`, the default).

In `direct` broadcaster mode, everything will be run in process where as in the `pubsub` mode, you typically run
socket.io and a front end in the `client` and any publishers (e.g. twitter) in the server process, allowing 1 publisher
setup broadcasting to many clients. One key thing of this approach is that it allows some flexibility in regards
to dealing with apps, ultimately making it simpler to build out (e.g. not running everything in a single process).

By default, any `add`-ed publishers are only run when the app is using the `direct` broadcaster or is running in `server` mode.
This can be changed on a per-publisher based by overriding the `shouldBeRun` function on your publisher, allowing conditional logic.

E.g. to run something on whatever app runs the web server, one would replace it with:

```coffeescript
class MyPublisher extends Base
  shouldBeRun: -> @runner.shouldRunWeb
```

### Configuration

Pebble uses a standard `config.json` file which uses nested keys according to:

* Pebble Settings (`pebble`)
* Redis settings (`redis`)
* Publisher settings (either the publisher name or the `configNamespace` value on a given publisher).

An example of this can be seen in the `config.example.json` file which contains **all** options.
Please note that most options are optional.

Likewise, if you pass a second parameter before the callback to `Pebble.run` with a value of true,
you can pass command line arguments to your program - e.g.:

```coffeescript
Pebble.run config, true, (runner) ->
  runner.addBuiltin 'twitter'
```

And then invoke your program with --help. This lets you set mode, broadcaster, host and port for the
app in a content-sensitive manner.

Lastly, in the case of the following, they can also be overridden by an environment variable:

* `pebble.listen.host` (by `HOST`)
* `pebble.listen.port` (by `PORT`)
* `pebble.redis.host` (by `REDIS_HOST`)
* `pebble.redis.port` (by `REDIS_HOST`)
* `pebble.redis.password` (by `REDIS_PASSWORD`)
* `pebble.redis.maxHistory` (by `REDIS_MAXHISTORY`)
* `pebble.broadcaster` (by `PEBBLE_BROADCASTER`)
* `pebble.mode` (by `PEBBLE_MODE`)

### The Public JavaScript Portion

Please note the public portion can be found in `public/` and that
your application uses Pebble. It'd be pretty simple to port it to use
something other than jQuery but that is left as an exercise for the reader.

## Developing Pebble

To develop pebble, you'll also need to install coffee-script via:

```bash
npm install coffee-script
````

Next, to compile the javascript, you can run:

```bash
cake build
```