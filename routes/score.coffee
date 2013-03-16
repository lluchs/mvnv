# Score routes

_ = require 'underscore'

Score = require '../models/Score'
attrs = require('../models/attributes').score

module.exports = (app) ->
  # Create a new score.
  app.post '/scores', (req, res) ->
    score = new Score(_.pick req.body, attrs)
    score.save (err) ->
      req.session.messages = if err
        type: 'error'
        msg: err.message
      else
        type: 'success'
        msg: 'Notensatz eingetragen!'
      res.redirect '/new'

  # Edit a score.
  app.put '/scores', (req, res) ->
    Score.update {_id: req.body._id},
      _.pick(req.body, attrs),
      (err) ->
        req.session.messages = if err
          type: 'error'
          msg: err.message
        else
          type: 'success'
          msg: 'Notensatz aktualsiert!'
        res.redirect '/new'

  # List scores.
  app.get '/scores', (req, res) ->
    Score.find (err, scores) ->
      res.render 'scores',
        scores: scores
        messages: if err
          type: 'error'
          msg: err

  # Middleware for getting the given score.
  loadScore = (req, res, next) ->
    # Try to find the score.
    Score.findById req.params.id, (err, score) ->
      if err
        res.send 404, 'Score not found'
      else
        res.locals.score = score
        next()

  # Show a single score.
  app.get '/scores/:id', loadScore, (req, res) ->
    score = res.locals.score
    res.render 'score', score

  # Edit a score.
  app.get '/scores/:id/edit', loadScore, (req, res) ->
    score = res.locals.score
    score.method = 'PUT'
    res.render 'edit',
      score: score

