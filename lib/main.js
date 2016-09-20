import React from 'react'
import ReactDOM from 'react-dom'

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
            <Score id={score.id} title={score.title} />)}
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

var scores = [
  {id: '1533', title: 'Abba Gold'},
  {id: '720', title: 'Hoch Badnerland'},
]

ReactDOM.render(
  <ScoreList scores={scores} />,
  document.querySelector('main')
);
