# Routes

Autocompletion = require '../models/Autocompletion'
Score = require '../models/Score'

module.exports = (app) ->
  app.get '/', (req, res) ->
    # Load tags for tag list.
    Autocompletion.getCompletions Score, 'tags', (err, cmpl) ->
      res.render 'index',
        tags: cmpl
        messages: req.session.messages
      delete req.session.messages

  app.get '/new', (req, res) ->
    Autocompletion.getCompletions Score, ['publisher', 'tags'], (err, cmpl) ->
      res.render 'new',
        messages: req.session.messages
        method: 'POST'
        publishers: cmpl[0]
        taglist: cmpl[1]
      delete req.session.messages

  # Include subroutes
  require('./score')(app)
  require('./rack')(app)
