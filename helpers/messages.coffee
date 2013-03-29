# Helpers for handling (flash) messages

_ = require 'underscore'

module.exports =
  # Concatenates multiple messages, which might be arrays or message objects.
  cat: (messages...) ->
    _.compact _.flatten messages

  # Creates a message from an error object which might be null.
  err: (err) ->
    if err
      type: 'error'
      msg: err.message

  # Creates a success message with the given content.
  success: (msg) ->
    type: 'success'
    msg: msg
