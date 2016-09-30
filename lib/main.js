// Styles
import 'purecss/build/pure.css!'
import 'react-select/dist/react-select.css!'
import './main.css!'
// Application
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, Link, IndexLink, browserHistory } from 'react-router'

import { ScorePage } from './scores'
import { LoginPage } from './login'

import * as Auth from './auth'

const App = React.createClass({
  getInitialState() {
    return {loggedIn: false}
  },
  childContextTypes: {
    loggedIn: React.PropTypes.bool,
  },
  getChildContext() {
    return {loggedIn: this.state.loggedIn}
  },
  componentDidMount() {
    Auth.addLoginListener(this.onAuth)
    Auth.checkLoginStatus()
  },
  componentWillUnmount() {
    Auth.removeLoginListener(this.onAuth)
  },
  onAuth(loggedIn) {
    this.setState({loggedIn: loggedIn})
  },
  logout() {
    Auth.logout()
  },
  render() {
    return (
      <div>
        <header>
          <div className="pure-menu pure-menu-horizontal">
            <IndexLink className="pure-menu-heading" to="/">MVNV 2</IndexLink>
            <ul className="pure-menu-list">
              {this.state.loggedIn
                ? <li className="pure-menu-item"><a onClick={this.logout} className="pure-menu-link">Logout</a></li>
                : <li className="pure-menu-item"><Link to="/login" className="pure-menu-link">Login</Link></li>}
            </ul>
          </div>
        </header>

        <main>
          {this.props.children}
        </main>
      </div>
    )
  }
})

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={ScorePage} />
      <Route path="login" component={LoginPage} />
    </Route>
  </Router>
), document.getElementById('app'))
