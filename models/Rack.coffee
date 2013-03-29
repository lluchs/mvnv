# Score Model

mongoose = require 'mongoose'
_ = require 'underscore'

schema = new mongoose.Schema
  name:
    type: String
    required: true
    index:
      unique: true
  contents: [
    min: Number
    max: Number
  ]

# Parses a content string in the form '1-10, 30-56'.
schema.methods.setContents = (contentStr) ->
  @contents = for str in contentStr.split(/,/)
    nums = str.split /-/
    continue if nums.length isnt 2
    min = +nums[0]
    max = +nums[1]
    continue unless min > 0 and max > 0
    [min, max] = [max, min] if min > max
    {min, max}

# Creates a string representing the content ranges.
schema.methods.getContents = ->
  ranges = ("#{range.min}-#{range.max}" for range in @contents)
  ranges.join ', '

# Finds a single rack by score id.
schema.statics.findByScoreId = (id, callback) ->
  Rack.findOne()
    .where('contents').elemMatch
      min: {$lte: id}
      max: {$gte: id}
    .exec callback

module.exports = Rack = mongoose.model 'Rack', schema
