# Score routes

Score = require '../models/Score'

module.exports = (app) ->
  # Create a new score.
  app.post '/scores', (req, res) ->
    score = new Score(req.body)
    score.save (err) ->
      ep = if err then "?err=#{err}" else ''
      res.redirect '/new'+ep

  # List scores.
  app.get '/scores', (req, res) ->
    Score.find (err, scores) ->
      res.render 'scores',
        scores: scores
