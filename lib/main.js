// Styles
import 'purecss/build/pure.css!'
import 'react-select/dist/react-select.css!'
import './main.css!'
// Application
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'
import { ScorePage } from './scores'

const App = React.createClass({
  render() {
    return (
      <div>
        <header>
          <div className="pure-menu pure-menu-horizontal">
            <a className="pure-menu-heading" href="">MVNV 2</a>
            <ul className="pure-menu-list">
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
    </Route>
  </Router>
), document.getElementById('app'))
