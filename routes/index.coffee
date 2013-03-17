# Routes

Autocompletion = require '../models/Autocompletion'
Score = require '../models/Score'

module.exports = (app) ->
  app.get '/', (req, res) ->
    res.render 'index'

  app.get '/new', (req, res) ->
    Autocompletion.getCompletions Score, 'publisher', (err, cmpl) ->
      res.render 'new',
        messages: req.session.messages
        method: 'POST'
        publishers: cmpl
      delete req.session.messages

  # Include subroutes
  require('./score')(app)
