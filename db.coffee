# Database Setup

mongoose = require 'mongoose'

cfg = require './cfg'

mongoose.connect cfg.get('mongo.url')

conn = mongoose.connection
conn.on 'error', (err) -> console.error 'Connection error: '+err

conn.once 'open',  ->
  console.info 'MongoDB connection created.'

module.exports = conn
