# Application Entry Point

fs = require 'fs'
path = require 'path'

_ = require 'underscore'
express = require 'express'
cons = require 'consolidate'

app = express()

# Set up view rendering.
do ->
# Find all partials.
  partials = {}
  dir = __dirname+'/views/partials/'
  for p in fs.readdirSync dir
    pname = path.basename p, '.mustache'
    partials[pname] = "partials/#{pname}"
  console.log partials
  app.engine 'mustache', (path, options, fn) ->
    # Set partials.
    options.partials ?= _.clone partials
    cons.hogan path, options, fn
  app.set 'views', __dirname+'/views'
  app.set 'view engine', 'mustache'

# Set up routes.
require('./routes')(app)

# Start the application!
PORT = 3257
app.listen PORT
console.log "Server listening on #{PORT}."
