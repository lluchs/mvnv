# Universal Autocompletion Cache

mongoose = require 'mongoose'

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
  # Do an aggregation!
  aggregation =
    $project: {_id: 0}
    $group:
      _id: 'autocompletion'
      completions:
        $addToSet: "$#{field}"
  aggregation.$project[field] = 1
  Model.aggregate aggregation, (err, result) =>
    return if err
    af = getCacheField(Model, field)
    # Insert into collection.
    @findOneAndUpdate
      field: af
    ,
      field: af
      completions: result[0].completions
    ,
      upsert: true
    # Empty function: Execute, but we don't care about errors.
    , ->

# Get the autocompletion cache for the given model/field.
schema.statics.getCompletions = (Model, field, fn) ->
  @findOne {field: getCacheField(Model, field)}, (err, cmpl) ->
    if err
      fn(err)
    else
      fn(null, cmpl.completions)
  return


module.exports = Autocompletion = mongoose.model('Autocompletion', schema)
  
