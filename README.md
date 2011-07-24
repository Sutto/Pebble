# Chainsaw App v2

A complete rewrite of the old convoluted chainsaw codebase to make it:

* Cleaner in terms of code
* Simpler to run (One process, versus many)
* Easy to extend (based on a simple publisher model)

With the whole goal of making real time event streams (pulling events
from external sources) as simple as possible.

Originally built for [Rails Rumble 2010](http://www.railsrumble.com/) like
I built prior versions for earlier rumbles.

## Getting Started

First, make sure you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

### Writing a Publisher

Publishers are just the general idea of a configurable item which can push things to the notifications list.
For example, to implement a simple publisher, you can do (in CoffeeScript):

```coffeescript
Base = require('chainsaw/base).Base

class MyPublisher extends Base
  name: "my-publisher"
  
  setup: ->
    # Called automatically.
    stored_name = @get "name" # gets name in the my-publisher key in the configuration
    setInterval((=>
      @emit some: "data"
    ), 10000)
```
        
You define a setup method that starts doing processing, configure a name (and optionally, `namespace`
for events and `configNamespace` for the configuration json namespace). This simple yet flexible architecture
makes it possible to build a wide variety of publishers.


### Configuration

Chainsaw uses a standard `config.json` file which uses nested keys according to:

* Chainsaw Settings (`chainsaw`)
* Redis settings (`redis`)
* Publisher settings (either the publisher name or the `configNamespace` value on a given publisher).

An example of this can be seen in the `config.example.json` file which contains **all** options.
Please note that most options are optional.

Lastly, in the case of the following, they can also be overridden by an environment variable:

* `chainsaw.listen.host` (by `HOST`)
* `chainsaw.listen.port` (by `PORT`)
* `chainsaw.redis.host` (by `REDIS_HOST`)
* `chainsaw.redis.port` (by `REDIS_HOST`)
* `chainsaw.redis.password` (by `REDIS_PASSWORD`)
* `chainsaw.redis.maxHistory` (by `REDIS_MAXHISTORY`)

### The Public JavasScript Portion

Please note the public portion can be found in `public/` and that
your application uses Chainsaw. It'd be pretty simple to port it to use
something other than jQuery but that is left as an exercise for the reader.

## Developing Chainsaw

To develop chainsaw, you'll also need to install coffee-script via:

```bash
npm install coffee-script
````