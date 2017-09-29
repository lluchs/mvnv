import PouchDB from 'pouchdb'

export const couchURL = 'https://couchdb.mvwuermersheim.de'

const AuthPouchDB = PouchDB.defaults({
  ajax: {
    headers: {
      get authorization () {
        let token = sessionStorage.loginToken
        if (!token) {
          return
        }
        return 'Bearer ' + token
      }
    }
  }
})

export const db = new AuthPouchDB('scores')
db.sync(couchURL + '/nv2_test', {
  live: true,
  retry: true,
})

