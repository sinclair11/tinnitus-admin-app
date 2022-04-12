import React, { useEffect, useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { Icons } from '@utils/icons';
import { dialogStyles, hourglassStyle, tableStyles } from '@src/styles/styles';
import Modal from 'react-modal';
import { MessageBox } from '@src/components/messagebox/messagebox';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@src/config/firebase';

type SearchProps = {
    type: string;
};

export const SearchBar: React.FC<SearchProps> = (props: SearchProps) => {
    const [searchVal, setSearchVal] = useState('');
    //Hourglass modal state
    const [isOpen, setIsOpen] = useState(false);
    //Dialog modal state
    const [dialogOpen, setDialogOpen] = useState(false);
    //Dialog message state
    const [message, setMessage] = useState('');
    //Selected resource
    const [selected, setSelected] = useState({ name: '' });
    const dispatch = useDispatch();
    const selectedRes = useSelector<CombinedStates>((state) => state.resdataReducer.selected) as string;
    const [searchedAlbums, setSearchedAlbums] = useState<any[]>([]);

    useEffect(() => {
        if (selected !== null && selected.name != searchVal) {
            getResourceData();
        } else {
            document.getElementById('searchbar-results').style.display = 'none';
        }
    }, [searchVal]);

    function updateInfoData(dataInfo: any, dataUsage: any): void {
        const arrInfo = [
            { name: 'Nume', value: dataInfo['name'] },
            { name: 'Lungime', value: dataInfo['length'] },
            { name: 'Data upload', value: dataInfo['upload'] },
            { name: 'Tags', value: dataInfo['tags'] },
            { name: 'Descriere', value: dataInfo['description'] },
        ];
        const arrUsage = [
            {
                name: 'Total durata vizionari',
                value: dataUsage['views_length'],
            },
            { name: 'Total vizionari', value: dataUsage['views'] },
            {
                name: 'Durata per utilizator',
                value: dataUsage['views_per_user'],
            },
            { name: 'Aprecieri', value: dataUsage['likes'] },
            { name: 'Favorizari', value: dataUsage['favs'] },
            { name: 'Feedback-uri', value: dataUsage['nr_feedback'] },
        ];
        //* Store resource general information in redux
        dispatch({ type: 'resdata/info', payload: arrInfo });
        //* Store resource usage ingormation in redux
        dispatch({ type: 'resdata/usage', payload: arrUsage });
        //* Store general information as raw data in redux
        dispatch({ type: 'resdata/infodata', payload: dataInfo });
        //* Store name of selected resource
        dispatch({
            type: 'resdata/selected',
            payload: searchVal,
        });
    }

    async function getResourceData(): Promise<void> {
        if (searchVal != '') {
            try {
                //Convert first letter to uppercase
                const temp = searchVal[0].toUpperCase() + searchVal.slice(1);
                const albums = [];
                //Search for album starting with the given string
                const albumsRef = collection(db, 'albums');
                const q = query(albumsRef, where('name', '>=', temp), limit(7));
                const q1 = query(q, where('name', '<=', temp + '\uf8ff'), limit(7));
                const querySnapshot = await getDocs(q1);
                const docs = querySnapshot.docs;
                //Take all data now to avoid doing an additional request
                for (const doc of docs) {
                    const data = doc.data();
                    albums.push({
                        id: doc.id,
                        name: data.name,
                        upload_date: data.upload_date.toDate().toDateString(),
                        category: data.category,
                        description: data.description,
                        tags: data.tags,
                        length: data.length,
                        artwork: data.artwork,
                        songs: data.songs,
                        total_songs: data.total_songs,
                        likes: data.likes,
                        favorites: data.favorites,
                        reviews: data.reviews,
                    });
                }
                setSearchedAlbums(albums);
                document.getElementById('searchbar-results').style.display = 'flex';
            } catch (error) {
                console.log(error);
            }
        } else {
            document.getElementById('searchbar-results').style.display = 'none';
            setSearchedAlbums([]);
        }
    }

    async function getListOfResources(): Promise<void> {
        return;
    }

    function clearListModal(): void {
        // setTableOpen(false);
        // setTableElements([]);
    }

    function closeListView(): void {
        clearListModal();
    }

    function cancelList(): void {
        clearListModal();
    }

    function okList(): void {
        clearListModal();
        // setSearchVal(selected);
    }

    function onItemClick(name: string): void {
        setSearchVal(name);
        const selectedItem = searchedAlbums.find((item) => item.name === name);
        setSelected(selectedItem);
        document.getElementById('searchbar-results').style.display = 'none';
    }

    async function onSearchBtnClick(): Promise<void> {
        await getResourceData();
        document.getElementById('searchbar-results').style.display = 'none';
        const selectedItem = searchedAlbums.find((item) => item.name === searchVal);
        setSelected(selectedItem);
    }

    return (
        <InputGroup className="SearchGroup">
            <div
                className="searchbar-div"
                // onBlur={(): void => {
                //     document.getElementById('searchbar-results').style.display = 'none';
                // }}
            >
                <FormControl
                    id="searchbar-albums"
                    placeholder={'Album name...'}
                    aria-label={`Nume ${props.type}`}
                    aria-describedby="basic-addon2"
                    className="SearchBar"
                    value={searchVal}
                    onChange={(e: any): void => {
                        setSearchVal(e.target.value);
                    }}
                />
                <div id="searchbar-results">
                    {searchedAlbums.map((album: any, key: number) => (
                        <div
                            className="searchbar-result-item"
                            key={key}
                            onClick={(): void => onItemClick(album.name)}
                            id={album.name}
                        >
                            <img src={album.artwork} />
                            <p className="album-name">{album.name}</p>
                            <p className="album-upload-date">{album.upload_date}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Button
                // data-tip="Cauta"
                className="SearchButton"
                onClick={onSearchBtnClick}
            >
                <img src={Icons['MagnifierIcon']} className="SearchIcon"></img>
            </Button>
            <Button
                // data-tip="Lista video"
                className="SearchButton"
                style={{ marginLeft: '5px' }}
                onClick={getListOfResources}
            >
                <img src={Icons['ListIcon']} className="SearchIcon"></img>
            </Button>
            <Modal isOpen={isOpen} style={hourglassStyle} ariaHideApp={false}>
                <div className="hourglass"></div>
            </Modal>
            <Modal style={dialogStyles} isOpen={dialogOpen} ariaHideApp={false}>
                <MessageBox setIsOpen={setDialogOpen} message={message} />
            </Modal>
            <Modal style={tableStyles} isOpen={false} ariaHideApp={false}>
                {/* <Reslist entries={tableElements} selectFromList={setSelected} /> */}
                <p className="modal-title">List {props.type}</p>
                <img src={Icons['CancelIcon']} className="cancel-icon" onClick={closeListView} />
                <Button className="ListOk" onClick={okList}>
                    OK
                </Button>
                <Button className="ListCancel" onClick={cancelList}>
                    Cancel
                </Button>
            </Modal>
        </InputGroup>
    );
};
