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

  password:
    doc: 'The administration password SHA1 sum.'
    format: (val) -> val.match /\w{40}/
    default: '590fca77bd84edd046905c9b9aeb3e13ed42ec32'
    env: 'MVNV_PASSWORD'

conf.validate()
module.exports = conf
