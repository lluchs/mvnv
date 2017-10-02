import PouchDB from 'pouchdb'
import {addLoginListener} from './auth'

const dbName = 'nv2_test'
export const couchURL = 'https://couchdb.mvwuermersheim.de/'+dbName

function authorizationHeader() {
  let token = sessionStorage.loginToken
  if (!token) {
    return {}
  }
  return {Authorization: 'Bearer ' + token}
}

export const db = new PouchDB(dbName)
const remoteDB = new PouchDB(couchURL)

// Workaround for https://github.com/pouchdb/pouchdb/issues/5322
const ajax = remoteDB._ajax;
remoteDB._ajax = function(opts, cb) {
  const headers = Object.assign({}, opts.headers, authorizationHeader());
  return ajax(Object.assign({}, opts, { headers }), cb);
};

var replOpts = {
  live: true,
  retry: true,
}

db.replicate.from(remoteDB, replOpts)

// Only try to replicate to CouchDB while logged in.
let rep
let replToOpts = Object.assign({}, replOpts, {
  // Disable checkpointing. This makes replicaton less efficient, but
  // avoids un-replicated changes after authentication errors.
  checkpoint: false,
})
addLoginListener(loggedIn => {
  if (loggedIn) {
    if (!rep)
      rep = db.replicate.to(remoteDB, replToOpts)
  } else {
    if (rep)
      rep.cancel()
    rep = null
  }
})
