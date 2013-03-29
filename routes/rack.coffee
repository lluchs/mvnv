# Rack routes

_ = require 'underscore'

Rack = require '../models/Rack'
Score = require '../models/Score'
msg = require '../helpers/messages'

module.exports = (app) ->
  # Create a new rack.
  app.post '/racks', (req, res) ->
    rack = new Rack name: req.body.name
    rack.setContents req.body.contents
    rack.save (err) ->
      if err
        req.session.messages = msg.err(err)
        req.session.rack = rack.toObject()
        res.redirect "/racks/new"
      else
        req.session.messages = msg.success 'Notenschrank eingetragen!'
        res.redirect "/racks/#{rack._id}"

  # Update a rack.
  app.put '/racks', (req, res) ->
    id = req.body._id
    Rack.findOne {_id: id}, (err, rack) ->
      rack.name = req.body.name
      rack.setContents req.body.contents
      rack.save (err) ->
        if err
          req.session.messages = msg.err(err)
          req.session.rack = rack.toObject()
          res.redirect "/racks/#{rack._id}/edit"
        else
          req.session.messages = msg.success 'Notenschrank aktualisiert!'
          res.redirect "/racks/#{rack._id}"

  # List racks.
  app.get '/racks', (req, res) ->
    Rack.find (err, racks) ->
      res.render 'racks',
        racks: racks
        messages: msg.cat(req.session.messages, msg.err(err))
      delete req.session.messages

  # New Rack.
  app.get '/racks/new', (req, res) ->
    res.render 'new_rack',
      messages: req.session.messages
      method: 'POST'
    delete req.session.messages

  # Find a rack by score id.
  app.get '/racks/by/score/:id', (req, res) ->
    id = +req.params.id
    Rack.findByScoreId id, (err, rack) ->
      if rack
        res.redirect "/racks/#{rack._id}"
      else
        res.status(404).render 'error',
          messages:
            type: 'error'
            msg: 'Notenschrank nicht gefunden'

  # Middleware for getting the given rack.
  loadRack = (req, res, next) ->
    # Try to find the rack.
    Rack.findById req.params.id, (err, rack) ->
      if err or not rack?
        res.status(404).render 'error',
          messages:
            type: 'error'
            msg: 'Notenschrank nicht gefunden'
      else
        res.locals.rack = rack
        next()

  # Show a single rack, including its associated scores.
  app.get '/racks/:id', loadRack, (req, res) ->
    rack = res.locals.rack
    # Retrieve scores.
    ranges = for range in rack.contents
        id:
          $gte: range.min
          $lte: range.max
    Score.find {$or: ranges}, (err, scores) ->
      res.render 'rack',
        rack: rack
        scores: scores
        messages: msg.cat(req.session.messages, msg.err(err))
      delete req.session.messages

  # Delete a rack.
  app.delete '/racks/:id', loadRack, (req, res) ->
    res.locals.rack.remove (err) ->
      req.session.messages = if err
        msg.err(err)
      else
        type: 'success'
        msg: 'Notenschrank gelöscht.'
      res.redirect '/racks'

  # Edit a rack.
  app.get '/racks/:id/edit', loadRack, (req, res) ->
    rack = res.locals.rack
    rack.method = 'PUT'
    res.render 'edit_rack',
      rack: rack
      messages: req.session.messages
    delete req.session.messages

