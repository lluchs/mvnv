# Routes
module.exports = (app) ->
  app.get '/', (req, res) ->
    res.render 'index'

  app.get '/new', (req, res) ->
    res.render 'new'

  # Include subroutes
  require('./score')(app)
