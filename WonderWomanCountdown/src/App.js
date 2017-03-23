import React, { Component } from 'react';
import Movie from './Components/movie.js';
import { Hello } from './Components/movie.js';
// import Hello from './Components/hello.js';
import './App.css';

class App extends Component {
  render() {
    console.log('hello ', Hello);

    return (
      <div>

        <Movie></Movie>
      </div>
    );
  }
}

export default App;
