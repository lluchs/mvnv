# Login/logout routes

crypto = require 'crypto'

cfg = require '../cfg'
msg = require '../helpers/messages'

sha1sum = (str) ->
  crypto.createHash('sha1').update(str).digest('hex')

module.exports = (app) ->
  app.get '/login', (req, res) ->
    if req.session.login
      req.session.messages =
        type: 'info'
        msg: 'Bereits eingeloggt.'
      res.redirect '/'
    else
      res.render 'login',
        messages: req.session.messages
      delete req.session.messages

  app.post '/login', (req, res) ->
    if cfg.get('password') is sha1sum(req.body.password)
      req.session.login = true
      req.session.messages = msg.success 'Willkommen zurück.'
      # The cookie is used to let the client JS know.
      res.cookie 'login', '1'
      res.redirect '/'
    else
      res.render 'login',
        messages:
          type: 'error'
          msg: 'Falsches Passwort.'

  app.post '/logout', (req, res) ->
    if delete req.session.login
      req.session.messages = msg.success 'Bis bald!'
    res.clearCookie 'login'
    res.redirect '/'
