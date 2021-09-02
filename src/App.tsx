import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import Welcome from './components/Welcome/Welcome';
import { Videos } from './components/Videos/Videos';
import './app.css'
import {Login} from './components/Login/Login'


const App: React.FC<{ title: string; version: string; }> = (props) => {
  return (
    <Router>
      <Route exact path="/" component={Login} />
      <Route exact path="/welcome" component={Welcome} />
      <Route exact path="/videos" component={Videos} />
    </Router>
  )
}

export default hot(module)(App);
