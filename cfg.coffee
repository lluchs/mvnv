convict = require 'convict'

conf = convict
  env:
    doc: 'The applicaton environment.'
    format: ['production', 'development', 'test']
    default: 'development'
    env: 'NODE_ENV'

  mongo:
    url:
      doc: 'The MongoDB connection URL.'
      default: 'mongodb://localhost/mvnv'
      env: 'MONGO_URL'

  session:
    secret:
      doc: 'The Connect session secret string.'
      default: 'mvnvsecret'
      env: 'SESSION_SECRET'

conf.validate()
module.exports = conf
