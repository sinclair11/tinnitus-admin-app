import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import Welcome from './components/Welcome/Welcome';
import { Videos } from './components/Videos/Videos';
import './app.css'


const App: React.FC<{ title: string; version: string; }> = (props) => {
  return (
    <Router>
      <Route exact path="/" component={Welcome} />
      <Route exact path="/videos" component={Videos} />
    </Router>
  )
}

export default hot(module)(App);
