import React from 'react'
import ReactDOM from 'react-dom'
import PouchDB from 'pouchdb'
import _ from 'lodash'

import makeCancelable from './cancelable-promise'

var db = new PouchDB('scores')

var ScorePage = React.createClass({
  getInitialState() {
    return {
      scores: [],
      showCreateNew: false,
      searchTerm: '',
    }
  },
  componentDidMount() {
    db.allDocs({include_docs: true}).then((doc) => {
      this.setState({scores: doc.rows.map((row) => row.doc)})
    })
    db.changes({since: 'now', live: true, include_docs: true}).on('change', (info) => {
      this.setState((state) => {
        let scores = state.scores.filter((score) => score._id != info.id)
        if (!info.deleted)
          scores.push(info.doc)
        return {scores: scores}
      });
    })
  },
  updateSearch(e) {
    this.setState({searchTerm: e.target.value})
  },
  filterScores(scores, searchTerm) {
    searchTerm = searchTerm.trim()
    if (!searchTerm) return scores;
    var r = new RegExp(searchTerm.split(' ').join('.*'), 'iu')
    return scores.filter((score) => {
      // Digits only? Match on ID!
      if (/^\d+$/.test(searchTerm))
        return score.id == searchTerm
      // TODO: Better search?
      return r.test(score.title)
    })
  },
  createNew() {
    this.setState((s) => ({showCreateNew: !s.showCreateNew}))
  },
  createScore(score) {
    return db.put({
      _id: `score:${score.id}`,
      ...score
    }).then((result) => {
      console.info('Create score', result)
      // Show the new score.
      this.setState({searchTerm: ''+score.id, showCreateNew: false})
    })
  },
  render() {
    let scores = this.filterScores(this.state.scores, this.state.searchTerm)
    return (
      <div>
        <p>
          <button onClick={this.createNew} className="pure-button">Neu…</button>
        </p>
        {this.state.showCreateNew &&
          <ScoreForm submitScore={this.createScore} cancel={this.createNew} />}
        <p className="pure-form">
          <input onChange={this.updateSearch} value={this.state.searchTerm} type="search" className="pure-input-rounded" placeholder="Suche" />
          {this.state.searchTerm &&
            <button onClick={this.updateSearch} className="pure-button">Zurücksetzen</button>}
        </p>

        <ScoreList scores={scores} />
      </div>
    )
  }
})

var ScoreList = React.createClass({
  getInitialState() {
    return {sortBy: 'id', sortDesc: false}
  },
  sortBy(what) {
    return (e) => {
      this.setState((state) => ({
        sortBy: what,
        sortDesc: what == state.sortBy ? !state.sortDesc : false,
      }))
    }
  },
  sortArrow(what) {
    if (this.state.sortBy == what)
      return this.state.sortDesc ? '↓' : '↑'
    else
      return ''
  },
  render() {
    let scores = _.orderBy(this.props.scores, this.state.sortBy, this.state.sortDesc ? 'desc' : 'asc')
    return (
      <table className="pure-table">
        <thead>
          <tr>
            <th onClick={this.sortBy('id')}>ID {this.sortArrow('id')}</th>
            <th onClick={this.sortBy('title')}>Titel {this.sortArrow('title')}</th>
            <th></th>
          </tr>
        </thead>
        {scores.map((score) =>
          <Score key={score._id} score={score} />)}
      </table>
    );
  }
});

var Score = React.createClass({
  getInitialState() {
    return {editing: false}
  },
  edit() {
    this.setState((s) => ({editing: !s.editing}))
  },
  saveScore(score) {
    return db.put({...this.props.score, ...score}).then((result) => {
      console.info('Update score', result)
      this.setState({editing: false})
    })
  },
  delete() {
    if (confirm(`Wirklich „${this.props.score.title}“ löschen?`))
      db.remove(this.props.score)
  },
  render() {
    let score = this.props.score
    return (
      <tbody>
        <tr>
          <td>{score.id}</td>
          <td>{score.title}</td>
          <td>
            <button onClick={this.edit} className="pure-button">Bearbeiten</button>
            <button onClick={this.delete} className="pure-button">Löschen</button>
          </td>
        </tr>
        {this.state.editing &&
          <tr>
            <td colSpan="3">
              <ScoreForm score={score} submitScore={this.saveScore} cancel={this.edit} />
            </td>
          </tr>}
      </tbody>
    );
  }
});

var ScoreForm = React.createClass({
  getInitialState() {
    let score = this.props.score || {id: '', title: ''}
    return {id: score.id, title: score.title, error: ''}
  },
  handleChange(what) {
    return (e) => {
      this.setState({[what]: e.target.value})
    }
  },
  handleSubmit(e) {
    e.preventDefault()
    this.submitPromise = makeCancelable(this.props.submitScore({
      id: +this.state.id,
      title: this.state.title,
    }))
    this.submitPromise.promise.then((result) => {
      this.setState(this.getInitialState())
    }, (err) => {
      if (err.isCanceled) return
      this.setState({error: `Could not save score: ${err}`})
    })
  },
  cancel(e) {
    e.preventDefault()
    this.props.cancel()
  },
  componentWillUnmount() {
    if (this.submitPromise)
      this.submitPromise.cancel()
  },
  render() {
    return (
      <form onSubmit={this.handleSubmit} className="pure-form pure-form-aligned">
        <p><b>{this.state.error}</b></p>
        <fieldset>
          <div className="pure-control-group">
            <label>ID</label>
            <input required type="number" value={this.state.id} onChange={this.handleChange('id')} />
          </div>
          <div className="pure-control-group">
            <label>Titel</label>
            <input required type="text" value={this.state.title} onChange={this.handleChange('title')} />
          </div>
          <div className="pure-controls">
            <button onClick={this.cancel} className="pure-button">Abbrechen</button>
            <input type="submit" className="pure-button pure-button-primary" />
          </div>
        </fieldset>
      </form>
    )
  }
})

ReactDOM.render(
  <ScorePage />,
  document.querySelector('main')
);
