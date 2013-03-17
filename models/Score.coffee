# Score Model

mongoose = require 'mongoose'

Autocompletion = require './Autocompletion'

schema = new mongoose.Schema
  id:
    type: Number
    index: true
  title: 
    type: String
    required: true
    index: true
  composer: 
    type: String
    required: true
  year: Number
  publisher: String

schema.post 'save', ->
  # Update autocompletion cache.
  Autocompletion.buildCache Score, 'publisher'

module.exports = Score = mongoose.model 'Score', schema
