# Universal Autocompletion Cache

mongoose = require 'mongoose'
_ = require 'underscore'
async = require 'async'

schema = new mongoose.Schema
  # The 'model'-'field' to autocomplete.
  field:
    type: String
    required: true
    index: true
    unique: true
  # The completions.
  completions: [String]

# Returns the cache field name for the given Model/field.
getCacheField = (Model, field) -> "#{Model.modelName}|#{field}"

# Builds the autocompletion cache for the given model/field.
schema.statics.buildCache = (Model, field) ->
  Model.distinct field, {}, (err, result) =>
    return if err
    af = getCacheField(Model, field)
    # Insert into collection.
    @findOneAndUpdate
      field: af
    ,
      field: af
      completions: _.compact result
    ,
      upsert: true
    # Empty function: Execute, but we don't care about errors.
    , ->

# Get the autocompletion cache for the given model/field.
#
# Multiple fields may be defined.
schema.statics.getCompletions = (Model, field, fn) ->
  if _.isArray(field)
    async.map field, (=> @getCompletion Model, arguments...), fn
  else
    @getCompletion arguments...

# Implementation
schema.statics.getCompletion = (Model, field, fn) ->
  @findOne {field: getCacheField(Model, field)}, (err, cmpl) ->
    if err
      fn(err)
    else
      fn(null, cmpl?.completions or [])
  return

module.exports = Autocompletion = mongoose.model('Autocompletion', schema)
  

