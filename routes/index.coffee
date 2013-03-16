# Routes
module.exports = (app) ->
  app.get '/', (req, res) ->
    res.render 'index'

  app.get '/new', (req, res) ->
    res.render 'new',
      messages: req.session.messages
      method: 'POST'
    delete req.session.messages

  # Include subroutes
  require('./score')(app)
