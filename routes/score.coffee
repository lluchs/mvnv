# Score routes

_ = require 'underscore'

Autocompletion = require '../models/Autocompletion'
Score = require '../models/Score'
attrs = require('../models/attributes').score

module.exports = (app) ->
  # Create a new score.
  app.post '/scores', (req, res) ->
    score = new Score(_.pick req.body, attrs)
    score.setTags req.body.tags
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
    id = req.body._id
    Score.findOne {_id: id}, (err, score) ->
      for a in attrs
        score[a] = req.body[a]
      score.setTags req.body.tags
      score.save (err) ->
        req.session.messages = if err
          type: 'error'
          msg: err.message
        else
          type: 'success'
          msg: 'Notensatz aktualisiert!'
        res.redirect "/scores/#{id}"

  # List scores.
  app.get '/scores', (req, res) ->
    Score.find (err, scores) ->
      res.render 'scores',
        scores: scores
        messages: if err
          type: 'error'
          msg: err

  # Go to the score identified by this id.
  app.get '/scores/by/id', (req, res) ->
    id = req.query.id
    Score.findOne {id}, (err, score) ->
      if err or not score?
        res.status(404).render 'index',
          id: id
          messages:
            type: 'error'
            msg: err?.message or 'Notensatz nicht gefunden.'
      else
        res.redirect "/scores/#{score._id}"

  # Search for scores.
  app.get '/scores/search', (req, res) ->
    query = (''+req.query.q).split /\s+/
    # Remove all ASCII symbols (special meaning in regexes)
    query = (s.replace(/[\x00-\x2F,\x3A-\x40,\x5B-\x60,\x7B-\x80]+/g, '') for s in query)

    # Search for all scores containing all of the given words.
    search = Score.find()
    for q in query
      regex = new RegExp q, 'i'
      search.find {$or: [{title: regex}, {composer: regex}, {publisher: regex}]}

    search.exec (err, scores) ->
      if err or scores.length is 0
        res.render 'index',
          search: req.query.q
          messages:
            type: 'info'
            msg: 'Nichts gefunden.'
      else
        res.render 'scores',
          search: req.query.q
          scores: scores
          messages:
            type: 'info'
            msg: "#{scores.length} Resultat#{if scores.length isnt 1 then 'e' else ''}:"

  # Middleware for getting the given score.
  loadScore = (req, res, next) ->
    # Try to find the score.
    Score.findById req.params.id, (err, score) ->
      if err or not score?
        res.status(404).render 'error',
          messages:
            type: 'error'
            msg: 'Notensatz nicht gefunden'
      else
        res.locals.score = score
        next()

  # Show a single score.
  app.get '/scores/:id', loadScore, (req, res) ->
    score = res.locals.score
    res.render 'score',
      score: score
      messages: req.session.messages
    delete req.session.messages

  # Edit a score.
  app.get '/scores/:id/edit', loadScore, (req, res) ->
    Autocompletion.getCompletions Score, ['publisher', 'tags'], (err, cmpl) ->
      score = res.locals.score
      score.method = 'PUT'
      res.render 'edit',
        score: score
        publishers: cmpl[0]
        taglist: cmpl[1]

