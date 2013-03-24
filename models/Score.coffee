# Score Model

mongoose = require 'mongoose'
_ = require 'underscore'

Autocompletion = require './Autocompletion'

schema = new mongoose.Schema
  id:
    type: Number
    index:
      sparse: true
      unique: true
  title: 
    type: String
    required: true
    index: true
  composer: 
    type: String
    required: true
  year: Number
  publisher: String
  tags:
    type: [String]
    index: true

schema.post 'save', ->
  # Update autocompletion cache.
  Autocompletion.buildCache Score, 'publisher'
  Autocompletion.buildCache Score, 'tags'

# Sets the score's tags, optionally parsing a string.
schema.methods.setTags = (tags) ->
  unless _.isArray tags
    # Cast to String and convert.
    tags = (''+tags).split(/,/).map (s) -> s.trim()
  @tags = tags

# Get the tags concatenated to a String.
schema.methods.getTags = ->
  @tags.join ', '

module.exports = Score = mongoose.model 'Score', schema
