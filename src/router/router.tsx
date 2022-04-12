import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Route } from 'react-router';
import { routes } from './routes';
import AlbumView from '@pages/albumview/albumview';
import Login from '@pages/login/login';
import AlbumCreate from '@pages/albumcreate/albumcreate';
import Welcome from '@pages/home/home';

const Router: React.FC = () => {
    return (
        <BrowserRouter>
            <Route exact path={routes.HOME} component={Welcome} />
            <Route exact path={routes.LOGIN} component={Login} />
            <Route exact path={routes.ALBUM_VIEW} component={AlbumView} />
            <Route exact path={routes.ALBUM_CREATE} component={AlbumCreate} />
        </BrowserRouter>
    );
};

export default Router;
