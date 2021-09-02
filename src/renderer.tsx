import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { inDev } from './utils/helpers';

// Say something
console.log('[ERWT] : Renderer execution started');

// Application to Render
const app = <App title='TinnitusAdmin' version='1.0.0' />;

// Render application in DOM
ReactDOM.render(app, document.getElementById('root'));

// Hot module replacement
if (inDev() && module.hot) module.hot.accept();
