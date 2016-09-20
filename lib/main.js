import React from 'react'
import ReactDOM from 'react-dom'
import PouchDB from 'pouchdb'

var db = new PouchDB('scores')

var ScorePage = React.createClass({
  getInitialState() {
    return {scores: []}
  },
  componentDidMount() {
    db.allDocs({include_docs: true}).then((doc) => {
      this.setState({scores: doc.rows.map((row) => row.doc)})
    })
    db.changes({since: 'now', live: true, include_docs: true}).on('change', (info) => {
      // TODO: Handle delete/update
      this.setState((state) => ({scores: [info.doc, ...state.scores]}))
    })
  },
  render() {
    return (
      <div>
        <ScoreForm />
        <ScoreList scores={this.state.scores} />
      </div>
    )
  }
})

var ScoreList = React.createClass({
  render() {
    var scores = this.props.scores
    return (
      <table>
        <thead>
          <tr><th>ID</th><th>Titel</th></tr>
        </thead>
        <tbody>
          {scores.map((score) =>
            <Score key={score._id} id={score.id} title={score.title} />)}
          </tbody>
      </table>
    );
  }
});

var Score = React.createClass({
  render() {
    return (
      <tr>
        <td>{this.props.id}</td>
        <td>{this.props.title}</td>
      </tr>
    );
  }
});

var ScoreForm = React.createClass({
  getInitialState() {
    return {id: '', title: '', error: ''}
  },
  handleIdChange(e) {
    this.setState({id: e.target.value})
  },
  handleTitleChange(e) {
    this.setState({title: e.target.value})
  },
  handleSubmit(e) {
    e.preventDefault()
    db.put({
      _id: `score:${this.state.id}`,
      id: +this.state.id,
      title: this.state.title,
    }).then((result) => {
      this.setState(this.getInitialState())
      console.info('New score', result)
    }, (err) => {
      this.setState({error: `Could not save score: ${err}`})
    })
  },
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <p><b>{this.state.error}</b></p>
        <label>ID:</label> <input required type="number" value={this.state.id} onChange={this.handleIdChange} />
        <label>Titel:</label> <input required type="text" value={this.state.title} onChange={this.handleTitleChange} />
        <input type="submit" />
      </form>
    )
  }
})

ReactDOM.render(
  <ScorePage />,
  document.querySelector('main')
);
