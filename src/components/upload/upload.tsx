import { Icons } from '@src/utils/icons';
import React, { useState, useRef, useEffect } from 'react';
import { FormControl } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Sidebar from '../sidebar/sidebar';
import { TableData, TableEdit } from '@components/table/table';
import Dropdown from '@components/dropdown/dropdown';
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

type UploadSmData = {
    action: string;
    id: string;
    artworkUrl: string;
    song: TableData;
    it: number;
};

const UploadView: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const auth = useSelector<CombinedStates>((state) => state.generalReducer.auth) as any;
    const aborted = useSelector<CombinedStates>((state) => state.progressReducer.abort) as boolean;
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
    const [categories, setCategories] = useState(['General']);
    const category = useRef('');
    const basicTxtColor = useRef('#00FFFF');
    const [tableData, setTableData] = useState([]);
    const [totalDuration, setTotalDuration] = useState('');
    const uploadAbort = useRef(false);

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

    useEffect(() => {
        setTotalDuration(getTotalLength(tableData));
    }, [tableData]);

    useEffect(() => {
        uploadAbort.current = aborted;
    }, [aborted]);

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

    function cleanInternalStates(): void {
        setName('');
        setDescription('');
        setTags('');
        setThumbnail(null);
        setTableData([]);
        setTotalDuration('');
    }

    async function uploadSong(albumId: string, song: TableData, it: number): Promise<any> {
        try {
            if (it < tableData.length) {
                const docRef = doc(collection(db, `albums/${albumId}/songs`));
                //Save each song at corresponding path in storage having firestore id as name
                const storage = getStorage();
                const storageRef = ref(storage, `albums/${albumId}/${docRef.id}`);
                await uploadBytes(storageRef, song.file);
                //Get URL to store in firestore
                const songUrl = await getDownloadURL(storageRef);
                //Upload song general info
                await setDoc(docRef, {
                    name: song.name,
                    position: song.pos,
                    length: song.length,
                    category: song.category,
                    file: songUrl,
                });
                if (uploadAbort.current === false) {
                    //Update progressbar
                    uploadProgress(
                        Math.floor(100 / (2 + tableData.length)),
                        `Album song ${it + 1} uploaded`,
                        basicTxtColor.current,
                    );
                }
                it++;
                uploadStateMachine({
                    action: 'upload-song',
                    id: albumId,
                    artworkUrl: null,
                    song: tableData[it],
                    it: it,
                });
            } else {
                uploadStateMachine({
                    action: 'upload-finish',
                    id: albumId,
                    artworkUrl: null,
                    song: null,
                    it: 0,
                });
            }
        } catch (error) {
            deleteAlbum(albumId);
            dispatch({ type: 'progress/fail', payload: { type: 'red', value: error.message } });
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
                length: getTotalLength(tableData),
                artwork: artworkUrl,
            });
            uploadProgress(
                Math.floor(100 / (2 + tableData.length)),
                'Album information registered in database',
                basicTxtColor.current,
            );
            uploadStateMachine({
                action: 'upload-song',
                id: docRef.id,
                artworkUrl: null,
                song: tableData[0],
                it: 0,
            });
        } catch (error) {
            deleteAlbum(docRef.id);
            dispatch({ type: 'progress/fail', payload: { type: 'red', value: error.message } });
        }
    }

    async function uploadAlbumArtwork(id: string): Promise<void> {
        try {
            //Save album artwork at corresponding path provided by doc id
            const storage = getStorage();
            const storageRef = ref(storage, `albums/${id}/artwork.jpg`);
            await uploadBytes(storageRef, thumbnailFile.current);
            //Get URL to store in firestore
            const artworkUrl = await getDownloadURL(storageRef);
            uploadProgress(Math.floor(100 / (2 + tableData.length)), 'Album artwork uploaded', basicTxtColor.current);
            uploadStateMachine({
                action: 'upload-info',
                id: id,
                artworkUrl: artworkUrl,
                song: null,
                it: 0,
            });
        } catch (error) {
            deleteAlbum(id);
            dispatch({ type: 'progress/fail', payload: { type: 'red', value: error.message } });
        }
    }

    function uploadProgress(percent: number, log: string, type: string): void {
        dispatch({ type: 'progress/update', payload: percent });
        dispatch({
            type: 'progress/log',
            payload: {
                type,
                value: log,
            },
        });
    }

    async function onUpload(): Promise<void> {
        console.log(tableData);
        if (verifyInputs() === 0) {
            const docRef = doc(collection(db, 'albums'));
            dispatch({ type: 'progress/open', payload: true });
            uploadStateMachine({
                action: 'upload-artwork',
                id: docRef.id,
                artworkUrl: null,
                song: null,
                it: 0,
            });
        }
    }

    async function uploadStateMachine(smData: UploadSmData): Promise<void> {
        if (!uploadAbort.current) {
            switch (smData.action) {
                case 'upload-artwork': {
                    uploadAlbumArtwork(smData.id);
                    break;
                }
                case 'upload-info': {
                    uploadAlbumInfo(doc(db, `albums/${smData.id}`), smData.artworkUrl);
                    break;
                }
                case 'upload-song': {
                    uploadSong(smData.id, smData.song, smData.it);
                    break;
                }
                case 'upload-finish': {
                    dispatch({ type: 'progress/progress', payload: 100 });
                    dispatch({
                        type: 'progress/log',
                        payload: {
                            type: 'green',
                            value: 'All album data uploaded successfully',
                        },
                    });
                    //Clean states to avoid uploading same album again
                    cleanInternalStates();
                    break;
                }
                default: {
                    throw new Error('Invalid action');
                }
            }
        } else {
            deleteAlbum(smData.id);
            dispatch({ type: 'progress/abort', payload: false });
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
                        <p className="album-total-duration">Duration: {totalDuration}</p>
                    </div>
                </div>
                {/* Table with songs */}
                <TableEdit
                    tableData={tableData}
                    setInvalid={setTableInvalid}
                    categories={categories}
                    setTableData={setTableData}
                />
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
