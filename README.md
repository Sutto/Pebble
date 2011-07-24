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

To use a publisher in your.

### Configuration

Pebble uses a standard `config.json` file which uses nested keys according to:

* Pebble Settings (`pebble`)
* Redis settings (`redis`)
* Publisher settings (either the publisher name or the `configNamespace` value on a given publisher).

An example of this can be seen in the `config.example.json` file which contains **all** options.
Please note that most options are optional.

Lastly, in the case of the following, they can also be overridden by an environment variable:

* `pebble.listen.host` (by `HOST`)
* `pebble.listen.port` (by `PORT`)
* `pebble.redis.host` (by `REDIS_HOST`)
* `pebble.redis.port` (by `REDIS_HOST`)
* `pebble.redis.password` (by `REDIS_PASSWORD`)
* `pebble.redis.maxHistory` (by `REDIS_MAXHISTORY`)

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