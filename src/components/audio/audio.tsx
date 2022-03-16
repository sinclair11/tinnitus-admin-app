import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { SearchBar } from '@src/components/searchbar/searchbar';
import { InfoFile } from '@src/components/infofile/infofile';
import { Toolbar } from '@src/components/toolbar/toolbar';
// import ReactPlayer from 'react-player';
import '@components/modal-search/modal-search.css';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import Sidebar from '../sidebar/sidebar';

type ArtworkProps = {
    img: any;
};

const AlbumArtwork: React.FC<ArtworkProps> = (props: ArtworkProps) => {
    const selected = useSelector<CombinedStates>(
        (state) => state.resdataReducer.selected,
    ) as string;

    function displayArtwork(): JSX.Element {
        //Check if a resource was selected
        if (selected !== '') {
            //Insert video player
            return <img src={`data:image/png;base64,${props.img}`} />;
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
                        height: '100%',
                    }}
                >
                    <p>Selectati un album pentru a vedea coperta</p>
                </div>
            );
        }
    }

    return <div className="section-album-artwork">{displayArtwork()}</div>;
};

export const AudioView: React.FC = () => {
    const dispatch = useDispatch();
    const thumbnail = useSelector<CombinedStates>(
        (state) => state.resdataReducer.thumbnail,
    ) as string;

    useEffect(() => {
        //No resource data on first rendering
        dispatch({ type: 'resdata/selected', payload: '' });
    }, []);

    return (
        <div className="page">
            <Sidebar />
            <div className="section-album">
                <div className="SearchBarDiv">
                    <SearchBar type="album" />
                </div>
                <Container id="content" className="ContentPlaceholder">
                    <Toolbar type="audio" />
                    <div className="section-album-content">
                        <AlbumArtwork img={thumbnail} />
                        <InfoFile
                            title="Informatii generale"
                            type={'general'}
                        />
                    </div>
                </Container>
            </div>
        </div>
    );
};
