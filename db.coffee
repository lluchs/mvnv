# Database Setup

mongoose = require 'mongoose'

cfg = require './cfg'

mongoose.connect cfg.get('mongo.url')

db = mongoose.connection
db.on 'error', (err) -> console.error 'Connection error: '+err

db.once 'open',  ->
  console.info 'MongoDB connection created.'

module.exports = db
