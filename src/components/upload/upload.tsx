import { Icons } from '@src/utils/icons';
import React, { useState, useRef, useEffect } from 'react';
import { FormControl } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Sidebar from '../sidebar/sidebar';
import { TableData, TableEdit } from '@components/table/table';
import Dropdown from '@components/dropdown/dropdown';
import { useHistory } from 'react-router-dom';
import { db, app } from '@config/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import { getAuth } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { ProgressbarUpload } from '../progressbar/progressbar-upload';
import axios from 'axios';
import { getDurationFormat } from '@src/utils/helpers';

type UploadSmData = {
    action: string;
    id: string;
    song: TableData;
    it: number;
};

const UploadView: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const auth = useSelector<CombinedStates>((state) => state.generalReducer.auth) as any;
    const oci = useSelector<CombinedStates>((state) => state.ociReducer.config) as any;
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
    const [tableData, setTableData] = useState([]);
    const [totalDuration, setTotalDuration] = useState('');
    const uploadAbort = useRef(false);
    const filesUploaded = useRef([]);

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

    async function getImage(event: any): Promise<void> {
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

    async function verifyInputs(): Promise<number> {
        let retVal = 0;

        if (name === '') {
            setNameInvalid('Acest camp este obligatoriu');
            retVal++;
        } else {
            const q = query(collection(db, 'albums'), where('name', '==', name));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.docs.length > 0) {
                setNameInvalid('An album with this name already exists');
                retVal++;
            } else {
                setNameInvalid('');
            }
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
            //Delete everyting related to this album
            await deleteDoc(doc(db, 'albums', id));
            await axios.post('http://127.0.0.1:5001/albums/delete', {
                namespace: oci.namespace,
                bucket: 'albums',
                album: id,
                songs: filesUploaded.current,
            });
        } catch (error) {
            dispatch({ type: 'progress/fail', payload: { type: 'error', value: error.message } });
        }

        filesUploaded.current = [];
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
        setNotification('');
    }

    async function uploadSong(albumId: string, song: TableData, it: number): Promise<any> {
        try {
            if (it < tableData.length) {
                //Save each song at corresponding path in storage having firestore id as name
                const formData = new FormData();
                //Prepare form data
                formData.append('album', albumId);
                formData.append('namespace', 'lra4ojegcvqn');
                formData.append('bucket', 'albums');
                formData.append('name', `${song.name}.${song.extension}`);
                formData.append('size', song.file.size.toString());
                formData.append('song', song.file);
                const res = await axios({
                    method: 'post',
                    url: 'http://127.0.0.1:5001/albums/upload/song',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (uploadAbort.current === false) {
                    //Update progressbar
                    uploadProgress(Math.floor(100 / tableData.length), res.data, 'success');
                }
                filesUploaded.current.push(`${song.name}.${song.extension}`);
                it++;
                uploadStateMachine({
                    action: 'upload-song',
                    id: albumId,
                    song: tableData[it],
                    it: it,
                });
            } else {
                uploadStateMachine({
                    action: 'upload-artwork',
                    id: albumId,
                    song: null,
                    it: 0,
                });
            }
        } catch (error) {
            deleteAlbum(albumId);
            dispatch({ type: 'progress/fail', payload: { type: 'error', value: error.message } });
        }
    }

    async function uploadAlbumInfo(id: string): Promise<void> {
        try {
            const infoDocRef = doc(db, 'albums', id);
            const temp = Object.assign([], tableData);
            //Copy songs URL
            for (let i = 0; i < temp.length; i++) {
                delete temp[i].file;
            }
            //Upload general information about album
            await setDoc(infoDocRef, {
                name: name,
                upload_date: new Date(),
                category: category.current,
                description: description,
                tags: parseTags(),
                length: getTotalLength(tableData),
                songs: temp,
                total_songs: temp.length,
                likes: 0,
                favorites: 0,
                reviews: 0,
            });
            if (uploadAbort.current === false) {
                uploadProgress(
                    Math.floor(100 / tableData.length),
                    'Album information registered in database',
                    'success',
                );
            }
            uploadStateMachine({
                action: notification != '' ? 'upload-notification' : 'upload-finish',
                id: id,
                song: null,
                it: 0,
            });
        } catch (error) {
            deleteAlbum(id);
            dispatch({ type: 'progress/fail', payload: { type: 'error', value: error.message } });
        }
    }

    async function uploadAlbumArtwork(id: string): Promise<void> {
        try {
            //Save album artwork at corresponding path provided by doc id
            const formData = new FormData();
            //Prepare form data
            formData.append('album', id);
            formData.append('namespace', 'lra4ojegcvqn');
            formData.append('bucket', 'albums');
            formData.append('size', thumbnailFile.current.size);
            formData.append('artwork', thumbnailFile.current);

            await axios({
                method: 'post',
                url: 'http://127.0.0.1:5001/albums/upload/artwork',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            filesUploaded.current.push(`artwork.${thumbnailFile.current.name.split('.').pop()}`);

            if (uploadAbort.current === false) {
                uploadProgress(Math.floor(100 / tableData.length), 'Album artwork uploaded', 'success');
            }
            uploadStateMachine({
                action: 'upload-info',
                id: id,
                song: null,
                it: 0,
            });
        } catch (error) {
            deleteAlbum(id);
            dispatch({ type: 'progress/fail', payload: { type: 'error', value: error.message } });
        }
    }

    async function uploadNotification(id: string): Promise<void> {
        try {
            //Send notification to all users
            await axios.post(
                'https://us-central1-tinnitus-50627.cloudfunctions.net/sendNotification',
                {},
                {
                    params: {
                        title: 'New album added',
                        body: notification,
                        // eslint-disable-next-line max-len
                        icon: 'https://firebasestorage.googleapis.com/v0/b/tinnitus-50627.appspot.com/o/logo.png?alt=media&token=b7fe80c7-2b6f-4bd8-8c57-637a5e404591',
                    },
                },
            );
            uploadStateMachine({
                action: 'upload-finish',
                id: id,
                song: null,
                it: 0,
            });
        } catch (error) {
            deleteAlbum(id);
            dispatch({ type: 'progress/fail', payload: { type: 'error', value: error.message } });
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
        if ((await verifyInputs()) === 0) {
            //Reset list of uploaded files
            filesUploaded.current = [];
            const docRef = doc(collection(db, 'albums'));
            dispatch({ type: 'progress/abort', payload: false });
            dispatch({ type: 'progress/open', payload: true });
            uploadProgress(10, 'Uploading album ...', 'info');
            uploadStateMachine({
                action: 'upload-song',
                id: docRef.id,
                song: tableData[0],
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
                    uploadAlbumInfo(smData.id);
                    break;
                }
                case 'upload-song': {
                    uploadSong(smData.id, smData.song, smData.it);
                    break;
                }
                case 'upload-notification': {
                    uploadNotification(smData.id);
                    break;
                }
                case 'upload-finish': {
                    dispatch({ type: 'progress/progress', payload: 100 });
                    dispatch({
                        type: 'progress/log',
                        payload: {
                            type: 'info',
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
                                    onChange={(event): Promise<void> => getImage(event)}
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
