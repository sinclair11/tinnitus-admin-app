import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import reduxPersist from '@store/reducers/persist';

// Application to Render
const app = <App title="TinnitusAdmin" version="1.0.0" />;
const persist = reduxPersist();

// Render application in DOM
ReactDOM.render(
    <Provider store={persist.store}>
        <PersistGate loading={null} persistor={persist.persistor}>
            {app}
        </PersistGate>
    </Provider>,
    document.getElementById('root'),
);
