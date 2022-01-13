import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import Welcome from '@src/components/welcome/welcome';
import { VideoView } from '@src/components/videos/video';
import './app.sass';
import { Login } from '@src/components/login/login';
import { AudioView } from '@components/audio/audio';

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
		</Router>
	);
};

export default hot(module)(App);
