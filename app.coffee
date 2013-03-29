# Application Entry Point

fs = require 'fs'
path = require 'path'

_ = require 'underscore'
express = require 'express'
cons = require 'consolidate'
MongoStore = require 'connect-mongodb'

cfg = require './cfg'
connection = require './db'

app = express()

# Middleware
app.use express.static('public')
app.use express.logger('dev')
app.use express.errorHandler()
app.use express.bodyParser()
app.use express.methodOverride()
app.use express.cookieParser()
app.use express.session
  secret: cfg.get('session.secret')
  store: new MongoStore(url: cfg.get('mongo.url'))

# Set up view rendering.
do ->
# Find all partials.
  partials = {}
  dir = __dirname+'/views/partials/'
  for p in fs.readdirSync dir
    pname = path.basename p, '.mustache'
    partials[pname] = "partials/#{pname}"
  app.engine 'mustache', (path, options, fn) ->
    # Set partials.
    options.partials ?= _.clone partials
    cons.hogan path, options, fn
  app.set 'views', __dirname+'/views'
  app.set 'view engine', 'mustache'

# Set up routes.
require('./routes')(app)

# Start the application once the database connection is established!
connection.once 'open', ->
  PORT = 3257
  app.listen PORT
  console.log "Server listening on #{PORT}."
