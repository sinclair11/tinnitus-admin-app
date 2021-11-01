import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import Welcome from '@components/welcome/Welcome';
import { Videos } from '@components/videos/Videos';
import './app.sass';
import { Login } from '@components/login/Login';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const App: React.FC<{ title: string; version: string }> = (props: {
	title: string;
	version: string;
}) => {
	return (
		<Router>
			<Route exact path="/" component={Login} />
			<Route exact path="/welcome" component={Welcome} />
			<Route exact path="/videos" component={Videos} />
		</Router>
	);
};

export default hot(module)(App);
