import { couchURL } from './db'

let loginListeners = new Set()

function notifyListeners(loggedIn) {
  for (let fn of loginListeners)
    fn(loggedIn)
}

export function checkLoginStatus() {
    fetch(couchURL + '/_session', {
      credentials: 'include',
    })
    .then(res => res.json())
    .then(session => {
      notifyListeners(session.ok && session.userCtx.name)
    })
}

export function login(username, password) {
    return fetch(couchURL + '/_session', {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify({name: username, password: password}),
    }).then(res => {
      if (res.ok) {
        notifyListeners(true)
      } else {
        throw res
      }
    })
}

export function logout() {
  return fetch(couchURL + '/_session', {
    method: 'DELETE',
    credentials: 'include',
    // This is necessary to get a non-empty Access-Control-Request-Headers
    // header in the CORS preflight request. See COUCHDB-3090
    headers: new Headers({'Content-Type': 'application/json'}),
  }).then((res) => {
    if (res.ok)
      notifyListeners(false)
    else
      throw res
  })
}

export function addLoginListener(fn) {
  loginListeners.add(fn)
}

export function removeLoginListener(fn) {
  loginListeners.remove(fn)
}
