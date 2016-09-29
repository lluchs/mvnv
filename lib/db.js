import PouchDB from 'pouchdb'

export const couchURL = 'https://couchdb.mvwuermersheim.de'

export const db = new PouchDB('scores')
db.sync(couchURL + '/nv2_test', {
  live: true,
  retry: true,
})

