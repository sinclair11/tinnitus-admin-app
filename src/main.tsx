import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Application to Render
const app = <App title="TinnitusAdmin" version="1.0.0" />;

// Render application in DOM
ReactDOM.render(
    <Provider store={store}>{app}</Provider>,
    document.getElementById('root'),
);
