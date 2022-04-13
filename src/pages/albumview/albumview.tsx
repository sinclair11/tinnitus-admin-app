import React, { createRef, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import SearchBar from '@src/components/searchbar/searchbar';
import Toolbar from '@src/components/toolbar/toolbar';
import { useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import Sidebar from '@components/sidebar/sidebar';
import { useHistory, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { app } from '@config/firebase';
import { SongData } from '@src/types/album';
import Artwork from '@components/artwork/artwork';
import '@components/modal-search/modal-search.css';

type AlbumViewProps = {
    location: any;
};

const AlbumView: React.FC<AlbumViewProps> = (props: AlbumViewProps) => {
    const { id } = useParams<{ id: string }>();
    const albumData = useRef();
    const auth = useSelector<CombinedStates>((state) => state.generalReducer.auth) as any;
    const history = useHistory();
    const searchbarRef = createRef<any>();

    useEffect(() => {
        if (auth) {
        } else {
            history.push('/login');
        }
    }, [getAuth(app).currentUser]);

    useEffect(() => {
        //Continue in page
        if (id !== '0') {
            //Load data for selected album
            albumData.current = props.location.state;
        } else {
            //Reset value of searchbar
            searchbarRef.current.setSearchValue('');
        }
    }, [id]);

    function displayContent(): JSX.Element {
        if (id === '0') {
            return (
                <div className="section-no-content">
                    <p>Please select an album to see more information</p>
                </div>
            );
        } else {
            return (
                <div className="section-album-content">
                    {id !== '0' ? <Artwork type="view" img={props.location.state.artwork} /> : null}
                </div>
            );
        }
    }

    return (
        <div className="page">
            <Sidebar />
            <div className="section-album">
                <div className="SearchBarDiv">
                    <SearchBar type="album" ref={searchbarRef} />
                </div>
                <Container id="content" className="ContentPlaceholder">
                    <Toolbar type="audio" />
                    {displayContent()}
                </Container>
            </div>
        </div>
    );
};

export default AlbumView;
