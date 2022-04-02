import { Icons } from '@src/utils/icons';
import React, { useState, useRef, useEffect } from 'react';
import { FormControl } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Sidebar from '../sidebar/sidebar';
import { TableData, TableEdit } from '@components/table/table';
import Dropdown from '@components/dropdown/dropdown';
import ErrorHandler from '@src/utils/errorhandler';
import { useHistory } from 'react-router-dom';
import { db, app } from '@config/firebase';
import { collection, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useDispatch } from 'react-redux';
import { ProgressbarUpload } from '../progressbar/progressbar-upload';
import axios from 'axios';
import { getDurationFormat } from '@src/utils/utils';

const UploadView: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const auth = useSelector<CombinedStates>((state) => state.generalReducer.auth) as any;
    const [name, setName] = useState('');
    const [nameinvalid, setNameInvalid] = useState('');
    const [description, setDescription] = useState('');
    const [descInvalid, setDescInvalid] = useState('');
    const [notification, setNotification] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailInvalid, setThumbnailInvalid] = useState('');
    const thumbnailFile = useRef(null);
    const [tags, setTags] = useState('');
    const [tableInvalid, setTableInvalid] = useState('');
    const inputImg = useRef(null);
    const tableObj: { function: any } = { function: null };
    const [categories, setCategories] = useState(['General']);
    const category = useRef('');
    const basicTxtColor = useRef('#00FFFF');

    useEffect(() => {
        if (auth) {
            onFetchCategories().then((data) => {
                setCategories(data);
                category.current = data[0];
            });
        } else {
            history.push('/');
        }
    }, [getAuth(app).currentUser]);

    async function onFetchCategories(): Promise<Array<string>> {
        try {
            const docRef = doc(db, 'misc', 'albums');
            const docSnap = await getDoc(docRef);
            return docSnap.data().categories;
        } catch (err) {
            return ['General'];
        }
    }

    function displayThumbnail(): JSX.Element {
        if (thumbnail) {
            return <img src={thumbnail} />;
        } else {
            return <p>Selectati o coperta de album</p>;
        }
    }

    function getImage(event: any): void {
        const reader = new FileReader();
        const file = event.target.files[0];
        let res = null;

        if (event.target.files && file) {
            //Read image data
            reader.readAsDataURL(file);
            //Save file for firebase storage
            thumbnailFile.current = file;
            reader.onloadend = (): void => {
                res = reader.result;
                setThumbnail(res);
                setThumbnailInvalid('');
            };
        }
    }

    function onPlusClick(): void {
        //Trigger choose file dialog
        inputImg.current.click();
    }

    function onCategoryChange(value: string): void {
        category.current = value;
    }

    function parseTags(): Array<string> {
        const parsedTags = new Array<string>();
        const hashIndexes = new Array<number>();

        //Get indexes of all hash characters
        for (let i = 0; i < tags.length; i++) {
            if (tags[i] === '#') {
                hashIndexes.push(i);
            }
        }

        //Extract hash tags
        for (let i = 0; i < hashIndexes.length - 1; i++) {
            for (let j = hashIndexes[i] + 1; j < tags.length; j++) {
                if (tags[j] === '#') {
                    parsedTags.push(tags.slice(hashIndexes[i], j).trim());
                    break;
                }
            }
        }

        //Last hash tag goes until the eng of string
        parsedTags.push(tags.slice(hashIndexes[hashIndexes.length - 1]).trim());

        return parsedTags;
    }

    function calculateTotalLength(songs: Array<string>): number {
        let seconds = 0;
        let minutes = 0;
        let hours = 0;
        //Extract hours, minutes and seconds
        for (let i = 0; i < songs.length; i++) {
            hours += parseInt(songs[i].slice(0, 2));
            minutes += parseInt(songs[i].slice(3, 5));
            seconds += parseInt(songs[i].slice(6));
        }
        //Calculate total length in seconds
        return hours * 3600 + minutes * 60 + seconds;
    }

    function verifyInputs(): number {
        let retVal = 0;

        if (name === '') {
            setNameInvalid('Acest camp este obligatoriu');
            retVal++;
        } else {
            setNameInvalid('');
        }

        if (description === '') {
            setDescInvalid('Acest camp este obligatoriu');
            retVal++;
        } else {
            setDescInvalid('');
        }

        if (thumbnail === null) {
            setThumbnailInvalid('Coperta de album este obligatorie');
            retVal++;
        } else {
            setThumbnailInvalid('');
        }

        const tableData = tableObj.function();
        if (tableData.length === 0) {
            setTableInvalid('Introduceti cel putin un audio');
        } else {
            for (const entry of tableData) {
                if (entry.name === '' || entry.category === '') {
                    setTableInvalid('Toate campurile din tabel sunt obligatorii');
                    retVal++;
                    break;
                } else {
                    setTableInvalid('');
                }
            }
        }

        return retVal;
    }

    async function deleteAlbum(id: string): Promise<void> {
        try {
            const path = `albums/${id}/songs`;
            //Delete everyting related to this album
            await axios.post(
                'https://us-central1-tinnitus-50627.cloudfunctions.net/deleteCollection',
                {},
                {
                    params: {
                        path,
                    },
                },
            );
            await deleteDoc(doc(db, 'albums', id));
            await axios.post(
                'https://us-central1-tinnitus-50627.cloudfunctions.net/deleteAlbumFromStorage',
                {},
                {
                    params: {
                        path: `albums/${id}`,
                    },
                },
            );
        } catch (error) {
            console.log(error);
        }
    }

    function getSongsLength(songs: TableData[]): Array<string> {
        const retVal = new Array<string>();
        for (const entry of songs) {
            retVal.push(entry.length);
        }
        return retVal;
    }

    function getTotalLength(songs: TableData[]): string {
        const totalLength = calculateTotalLength(getSongsLength(songs));
        return getDurationFormat(totalLength);
    }

    async function uploadSongs(albumId: string): Promise<any> {
        const entries: TableData[] = tableObj.function();
        const totalActions = 2 + entries.length;
        const percent = Math.floor(100 / totalActions);

        try {
            for (let i = 0; i < entries.length; i++) {
                const docRef = doc(collection(db, `albums/${albumId}/songs`));
                //Save each song at corresponding path in storage having firestore id as name
                const storage = getStorage();
                const storageRef = ref(storage, `albums/${albumId}/${docRef.id}`);
                await uploadBytes(storageRef, entries[i].file);
                //Get URL to store in firestore
                const songUrl = await getDownloadURL(storageRef);
                await setDoc(docRef, {
                    name: entries[i].name,
                    position: entries[i].pos,
                    length: entries[i].length,
                    file: songUrl,
                });
                //Upload song usage
                await setDoc(doc(db, `albums/${albumId}/songs`, docRef.id), {
                    likes: 0,
                    favorites: 0,
                    feedbacks: 0,
                    total_listened: 0,
                });
                //Update progressbar
                dispatch({ type: 'progress/update', payload: percent });
                dispatch({
                    type: 'progress/log',
                    payload: {
                        type: basicTxtColor.current,
                        value: `Album song ${i + 1} uploaded`,
                    },
                });
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async function uploadAlbumInfo(docRef: any, artworkUrl: string): Promise<void> {
        try {
            //Upload general information about album
            await setDoc(docRef, {
                name: name,
                category: category.current,
                description: description,
                tags: parseTags(),
                length: getTotalLength(tableObj.function()),
                artwork: artworkUrl,
            });
            return docRef.id;
        } catch (error) {
            throw error;
        }
    }

    async function uploadAlbumUsage(docRef: any): Promise<void> {
        try {
            //Upload album usage
            await setDoc(docRef, {
                likes: 0,
                favorites: 0,
                feedbacks: 0,
                total_listened: 0,
            });
        } catch (error) {
            throw error;
        }
    }
    async function uploadAlbumArtwork(id: string): Promise<string> {
        try {
            //Save album artwork at corresponding path provided by doc id
            const storage = getStorage();
            const storageRef = ref(storage, `albums/${id}/artwork.jpg`);
            await uploadBytes(storageRef, thumbnailFile.current);
            //Get URL to store in firestore
            const artworkUrl = await getDownloadURL(storageRef);
            return artworkUrl;
        } catch (error) {
            throw error;
        }
    }

    async function onUpload(): Promise<void> {
        let id;
        const totalActions = 2 + tableObj.function().length;
        const percent = Math.floor(100 / totalActions);

        if (verifyInputs() === 0) {
            try {
                // Open modal to track upload progress
                dispatch({ type: 'progress/open', payload: true });
                //Create general doc reference
                const docRef = doc(collection(db, 'albums'));
                id = docRef.id;
                //Upload album artwork
                const artworkRef = await uploadAlbumArtwork(id);
                dispatch({ type: 'progress/update', payload: percent });
                dispatch({
                    type: 'progress/log',
                    payload: {
                        type: basicTxtColor.current,
                        value: 'Album registered in db',
                    },
                });
                //Upload album info in db
                await uploadAlbumInfo(docRef, artworkRef);
                await uploadAlbumUsage(doc(collection(db, 'albums-usage'), id));
                //Update progress bar
                dispatch({ type: 'progress/update', payload: percent });
                dispatch({
                    type: 'progress/log',
                    payload: {
                        type: basicTxtColor.current,
                        value: 'Album artwork stored',
                    },
                });
                await uploadSongs(id);
                //All album data uploaded successfully
                dispatch({ type: 'progress/progress', payload: 100 });
                dispatch({
                    type: 'progress/log',
                    payload: {
                        type: 'green',
                        value: 'All album data uploaded successfully',
                    },
                });
                // deleteAlbum('C9t72F5JP2JzbYGZmWRW');
            } catch (error) {
                console.log(error);
                //Delete album from db
                deleteAlbum(id);
                //Mark upload as failed
                dispatch({
                    type: 'progress/fail',
                    payload: {
                        type: 'red',
                        value: error.message,
                    },
                });
                dispatch({
                    type: 'progress/log',
                    payload: {
                        type: 'red',
                        value: 'Upload reverted',
                    },
                });
            }
        }
    }

    return (
        <div className="page">
            <Sidebar />
            <div className="upload-section">
                {/* Album details */}
                <div className="upload-album">
                    {/* Artwork */}
                    <div>
                        <div className="upload-album-artwork">
                            <div className="plus-body" onClick={onPlusClick}>
                                <img src={Icons.Plus} className="plus" />
                                <input
                                    ref={inputImg}
                                    className="input-plus"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event): void => getImage(event)}
                                />
                            </div>
                            {displayThumbnail()}
                        </div>
                        <p className="invalid-input invalid-thumbnail">{thumbnailInvalid}</p>
                    </div>

                    {/* General info */}
                    <div className="upload-album-info">
                        <InputGroup hasValidation className="input-group">
                            <InputGroup.Text className="label">Nume</InputGroup.Text>
                            <FormControl
                                className="input"
                                required
                                value={name}
                                onChange={(event): void => {
                                    setName(event.target.value);
                                    setNameInvalid('');
                                }}
                            />
                            <p className="invalid-input invalid-name">{nameinvalid}</p>
                        </InputGroup>
                        <div className="category">
                            <p>Categorie</p>
                            <Dropdown
                                items={categories}
                                className="dropdown-margin"
                                onChange={onCategoryChange}
                                current={categories[0]}
                            />
                        </div>
                        <InputGroup hasValidation className="input-group input-group-area">
                            <InputGroup.Text className="label">Descriere</InputGroup.Text>
                            <FormControl
                                className="input-description"
                                required
                                as="textarea"
                                value={description}
                                onChange={(event): void => {
                                    setDescription(event.target.value);
                                    setDescInvalid('');
                                }}
                            />
                            <p className="invalid-input invalid-desc">{descInvalid}</p>
                        </InputGroup>
                        <InputGroup hasValidation className="input-group input-group-area">
                            <InputGroup.Text className="label">Tag-uri(optional)</InputGroup.Text>
                            <FormControl
                                className="input-tag"
                                required
                                as="textarea"
                                value={tags}
                                placeholder="#tag1 #tag2 #tag3"
                                onChange={(event): void => setTags(event.target.value)}
                            />
                        </InputGroup>
                        <InputGroup hasValidation className="input-group input-group-area">
                            <InputGroup.Text className="label">Notificare(optional)</InputGroup.Text>
                            <FormControl
                                className="input-notification"
                                required
                                as="textarea"
                                value={notification}
                                onChange={(event): void => setNotification(event.target.value)}
                            />
                        </InputGroup>
                    </div>
                </div>
                {/* Table with songs */}
                <TableEdit table={tableObj} setInvalid={setTableInvalid} categories={categories} />
                <p className="invalid-input invalid-table">{tableInvalid}</p>
                <button className="upload-btn-album" onClick={onUpload}>
                    Upload
                </button>
            </div>
            <ProgressbarUpload />
        </div>
    );
};

export default UploadView;
