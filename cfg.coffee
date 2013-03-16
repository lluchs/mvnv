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

conf.validate()
module.exports = conf
