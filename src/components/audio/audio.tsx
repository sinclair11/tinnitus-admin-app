import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { SearchBar } from '@src/components/searchbar/searchbar';
import { InfoFile } from '@src/components/infofile/infofile';
import { Toolbar } from '@src/components/toolbar/toolbar';
import '@components/modal-search/modal-search.css';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import Sidebar from '../sidebar/sidebar';
import { useHistory } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { db, app } from '@config/firebase';
import { doc, getDoc } from 'firebase/firestore';

type ArtworkProps = {
    img: any;
};

const AlbumArtwork: React.FC<ArtworkProps> = (props: ArtworkProps) => {
    return (
        <div className="section-album-artwork">
            <img src={`data:image/png;base64,${props.img}`} />
        </div>
    );
};

export const AudioView: React.FC = () => {
    const dispatch = useDispatch();
    const auth = useSelector<CombinedStates>(
        (state) => state.generalReducer.auth,
    ) as any;
    const selected = useSelector<CombinedStates>(
        (state) => state.resdataReducer.selected,
    ) as string;
    const thumbnail = useSelector<CombinedStates>(
        (state) => state.resdataReducer.thumbnail,
    ) as string;
    const history = useHistory();

    useEffect(() => {
        //No resource data on first rendering
        dispatch({ type: 'resdata/selected', payload: '' });
    }, []);

    useEffect(() => {
        if (auth) {
            //Continue in page
        } else {
            history.push('/');
        }
    }, [getAuth(app).currentUser]);

    function displayContent(): JSX.Element {
        //Check if a resource was selected
        if (selected !== '') {
            //Insert video player
            return (
                <div className="section-album-content">
                    <AlbumArtwork img={thumbnail} />
                    <InfoFile title="Informatii generale" type={'general'} />
                </div>
            );
        }
        //Functionality N/A
        else {
            return (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        color: 'black',
                    }}
                >
                    <p>
                        Selectati un album pentru a vedea informatii despre el
                    </p>
                </div>
            );
        }
    }

    return (
        <div className="page">
            <Sidebar />
            <div className="section-album">
                <div className="SearchBarDiv">
                    <SearchBar type="album" />
                </div>
                <Container id="content" className="ContentPlaceholder">
                    <Toolbar type="audio" />
                    {displayContent()}
                </Container>
            </div>
        </div>
    );
};
