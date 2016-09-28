import React from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import PouchDB from 'pouchdb'
import _ from 'lodash'

import makeCancelable from './cancelable-promise'

var db = new PouchDB('scores')
db.sync('https://couchdb.mvwuermersheim.de/nv2_test', {
  live: true,
  retry: true,
})

var ScorePage = React.createClass({
  getInitialState() {
    return {
      scores: [],
      showCreateNew: false,
      searchTerm: '',
      selectedTags: new Set(),
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
  updateSelectedTags(selected) {
    this.setState({selectedTags: selected})
  },
  filterScores(scores, searchTerm, selectedTags) {
    searchTerm = searchTerm.trim()
    if (!searchTerm && !selectedTags.size) return [scores, tagsFromScores(scores)];
    // Perform filtering based on search term first.
    var r = new RegExp(searchTerm.split(' ').join('.*'), 'iu')
    scores = scores.filter((score) => {
      // Digits only? Match on ID!
      if (/^\d+$/.test(searchTerm))
        return score.id == searchTerm
      // TODO: Better search?
      return r.test(score.title)
    })
    // Now find all tags from the filtered scores.
    let tags = tagsFromScores(scores)
    // Filter scores again, but ignore selected tags which no score has.
    scores = scores.filter((score) => {
      let st = new Set(score.tags)
      for (let tag of selectedTags)
        if (tags.has(tag) && !st.has(tag)) return false;
      return true;
    })
    return [scores, tagsFromScores(scores)]
    function tagsFromScores(scores) {
      return scores
        .filter((score) => score.tags)
        .reduce((tags, score) =>
          (score.tags.forEach((tag) => tags.add(tag)), tags), new Set())
    }
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
    let [scores, tags] = this.filterScores(this.state.scores, this.state.searchTerm, this.state.selectedTags)
    return (
      <div>
        <p>
          <button onClick={this.createNew} className="pure-button">Neu…</button>
        </p>
        {this.state.showCreateNew &&
          <ScoreForm submitScore={this.createScore} cancel={this.createNew} />}
        <p className="pure-form search-form">
          <input onChange={this.updateSearch} value={this.state.searchTerm} type="search" className="pure-input-rounded" placeholder="Suche" />
          {this.state.searchTerm &&
            <button onClick={this.updateSearch} title="Zurücksetzen" className="pure-button emoji-button">❌</button>}
        </p>

        <TagList tags={tags} selected={this.state.selectedTags} onChange={this.updateSelectedTags} />

        <ScoreList scores={scores} />
      </div>
    )
  }
})

var TagList = React.createClass({
  toggle(tag) {
    return (e) => {
      let selected = new Set(this.props.selected)
      if (selected.has(tag))
        selected.delete(tag)
      else
        selected.add(tag)
      this.props.onChange(selected)
    }
  },
  render() {
    return (
      <ul className="tag-list">
        {[...this.props.tags].sort().map((tag) => (
          <li onClick={this.toggle(tag)} key={tag} className={this.props.selected.has(tag) ? 'selected' : ''}>{tag}</li>))}
      </ul>
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
          </tr>
        </thead>
        {scores.map((score) =>
          <Score key={score._id} score={score} />)}
        {scores.length == 0 &&
          <tbody>
            <tr>
              <td colSpan='3'><em>Keine Noten gefunden bzw. geladen</em></td>
            </tr>
          </tbody>}
      </table>
    );
  }
});

var Score = React.createClass({
  getInitialState() {
    return {open: false, editing: false}
  },
  open() {
    this.setState((s) => ({open: !s.open}))
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
          <td onClick={this.open}>{score.title}</td>
        </tr>
        {this.state.open &&
          <tr>
            <td></td>
            <td>
              <table className="pure-table">
                <tbody>
                  <tr>
                    <td>Komponist</td>
                    <td>{score.composer || <i>?</i>}</td>
                  </tr>
                  <tr>
                    <td>Jahr</td>
                    <td>{score.year || <i>?</i>}</td>
                  </tr>
                  <tr>
                    <td>Verlag</td>
                    <td>{score.publisher || <i>?</i>}</td>
                  </tr>
                  <tr>
                    <td>Tags</td>
                    <td>
                      <TagList tags={score.tags} selected={new Set()} onChange={x=>x} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                <button onClick={this.edit} title="Bearbeiten" className="pure-button emoji-button">🖊</button>&nbsp;
                <button onClick={this.delete} title="Löschen" className="pure-button emoji-button">🗑</button>
              </p>
              {this.state.editing &&
                <ScoreForm score={score} submitScore={this.saveScore} cancel={this.edit} />}
            </td>
          </tr>}
      </tbody>
    );
  }
});

var ScoreForm = React.createClass({
  getInitialState() {
    let score = this.props.score || {id: '', title: '', tags: []}
    return {id: score.id, title: score.title, tags: score.tags, error: ''}
  },
  handleChange(what) {
    return (e) => {
      this.setState({[what]: e.target.value})
    }
  },
  handleTagChange(tags) {
    this.setState({tags: tags})
  },
  handleSubmit(e) {
    e.preventDefault()
    this.submitPromise = makeCancelable(this.props.submitScore({
      id: +this.state.id,
      title: this.state.title,
      tags: this.state.tags.map(t => t.value),
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
          <div className="pure-control-group">
            <label>Tags</label>
            <Select.AsyncCreatable
              multi={true}
              value={this.state.tags}
              loadOptions={loadTags}
              onChange={this.handleTagChange}
              ignoreCase={false}
            />
          </div>
          <div className="pure-controls">
            <button type="reset" onClick={this.cancel} className="pure-button">Abbrechen</button>&nbsp;
            <input type="submit" className="pure-button pure-button-primary" />
          </div>
        </fieldset>
      </form>
    )

    function loadTags() {
      return db.query('tags/autocompletion', {group: true})
        .then(({rows}) => ({
          options: rows.map(r => ({value: r.key, label: r.key})),
          complete: true
        }))
    }
  }
})

ReactDOM.render(
  <ScorePage />,
  document.querySelector('main')
);
