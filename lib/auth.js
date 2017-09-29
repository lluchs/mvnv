import { couchURL } from './db'
import { browserHistory } from 'react-router'

let loginListeners = new Set()

function notifyListeners(loggedIn) {
  for (let fn of loginListeners)
    fn(loggedIn)
}

export function checkLoginStatus() {
  let token = sessionStorage.loginToken
  let loggedIn = false
  if (token) {
    // Verify token age
    try {
      tp = JSON.parse(atob(token.split('.')[1].replace('-', '+').replace('_', '/')))
      loggedIn = tp.exp > new Date().valueOf() / 1000
    } catch (e) {}
  }
  notifyListeners(loggedIn)
}

export function login() {
  sessionStorage.lastPage = location.href
  location.href = 'https://intern.mvwuermersheim.de/jwt?app=mvnv2'
}

export function logout() {
  delete sessionStorage.loginToken
  notifyListeners(false)
}

export function addLoginListener(fn) {
  loginListeners.add(fn)
}

export function removeLoginListener(fn) {
  loginListeners.remove(fn)
}

export function setLoginToken(token) {
  sessionStorage.loginToken = token
  checkLoginStatus()
  browserHistory.replace(sessionStorage.lastPage || '/')
  delete sessionStorage.lastPage
}
