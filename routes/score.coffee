# Score routes

Score = require '../models/Score'

module.exports = (app) ->
  # Create a new score.
  app.post '/scores', (req, res) ->
    score = new Score(req.body)
    score.save (err) ->
      req.session.messages = if err
        type: 'error'
        msg: err
      else
        type: 'success'
        msg: 'Notensatz eingetragen!'
      res.redirect '/new'

  # List scores.
  app.get '/scores', (req, res) ->
    Score.find (err, scores) ->
      res.render 'scores',
        scores: scores
        messages: if err
          type: 'error'
          msg: err
