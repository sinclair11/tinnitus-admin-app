import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Welcome from '@src/components/welcome/welcome';
import { VideoView } from '@src/components/videos/video';
import './app.sass';
import { Login } from '@src/components/login/login';
import { AudioView } from '@components/audio/audio';
import UploadView from './components/upload/upload';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const App: React.FC<{ title: string; version: string }> = (props: {
    title: string;
    version: string;
}) => {
    return (
        <Router>
            <Route exact path="/" component={Login} />
            <Route exact path="/welcome" component={Welcome} />
            <Route exact path="/video" component={VideoView} />
            <Route exact path="/audio" component={AudioView} />
            <Route exact path="/audio/upload" component={UploadView} />
        </Router>
    );
};

export default App;
