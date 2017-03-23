import React from 'react';
// import ReactDOM from 'react-dom';
import moment from 'moment';
// import countdown from 'countdown';
import momentCountdown from 'moment-countdown';

import MovieData from './../config.json';

var rightNow = moment().format();
var movieName = MovieData.movie_name;
var movieDate = MovieData.date;
var momentMovieDate = moment(movieDate).format();
var waitingForWonderWoman = moment(rightNow).isBefore(momentMovieDate);
var yesOrNo = waitingForWonderWoman ? 'No' : 'Yes';

export default class Movie extends React.Component {
  constructor() {
    super();

    this.state = {
      howMuchLonger: 'a few days'
    };

    this.countdownToWorldSaving = this.countdownToWorldSaving.bind(this);
  }

  componentDidMount() {
    setInterval(this.countdownToWorldSaving, 1000);
  }

  countdownToWorldSaving() {
    if(yesOrNo === 'Yes') {
      this.setState({howMuchLonger: 'on right now'});
      return;
    }
    var tmpHowMuchLonger = moment(momentMovieDate).countdown().toString();
    this.setState({howMuchLonger: tmpHowMuchLonger});
  }

  render() {
    return (
      <div className="parent-div center-align">
        <div className="center-align">
          <h1 className="App">{movieName} are {yesOrNo !== 'Yes' && 'only' } {this.state.howMuchLonger} {yesOrNo !== 'Yes' && 'away' }!!</h1>
        </div>
      </div>
    );
  }
}

export class Hello extends React.Component {
  render() {
    return(
      <h1>Hello {this.props.name}!</h1>
    );
  }
}
