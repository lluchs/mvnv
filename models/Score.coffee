# Score Model

mongoose = require 'mongoose'

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

module.exports = Score = mongoose.model 'Score', schema
