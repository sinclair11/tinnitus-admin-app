import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Welcome from '@src/components/welcome/welcome';
import { Login } from '@src/components/login/login';
import UploadView from './components/upload/upload';
import { app } from '@src/config/firebase';
import { AlbumView } from '@components/album-view/album-view';
import './app.sass';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const App: React.FC<{ title: string; version: string }> = (props: { title: string; version: string }) => {
    app;
    return (
        <Router>
            <Route exact path="/" component={Login} />
            <Route exact path="/welcome" component={Welcome} />
            <Route exact path="/album" component={AlbumView} />
            <Route exact path="/audio/upload" component={UploadView} />
        </Router>
    );
};

export default App;
