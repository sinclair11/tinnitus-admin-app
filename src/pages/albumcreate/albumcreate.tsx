import React, { useRef, useEffect, createRef, useState } from 'react';
import Sidebar from '@components/sidebar/sidebar';
import { Table } from '@components/table/table';
import { useHistory } from 'react-router-dom';
import { db, app } from '@config/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import { getAuth } from 'firebase/auth';
import ProgressbarUpload from '@components/progressbar/progressbar-upload';
import AlbumForm from '@src/components/albumform/albumform';
import Artwork from '@components/artwork/artwork';
import { deleteAlbum, uploadAlbumArtwork, uploadAlbumInfo, uploadSong } from '@services/upload';
import axios from 'axios';
import { SongData } from '@src/types/album';

const AlbumCreate: React.FC = () => {
    const history = useHistory();
    const auth = useSelector<CombinedStates>((state) => state.generalReducer.auth) as any;
    const oci = useSelector<CombinedStates>((state) => state.ociReducer.config) as any;
    const filesUploaded = useRef([]);
    const tableRef = createRef<any>();
    const formRef = createRef<any>();
    const artworkRef = createRef<any>();
    const progressbarRef = createRef<any>();
    const cancelSource = useRef(axios.CancelToken.source());
    const content = useRef(null);

    useEffect(() => {
        if (auth) {
            onFetchCategories().then((data) => {
                //Pass categories to child components
                tableRef.current.setCategories(data);
                formRef.current.setCategories(data);
                //Done loading
                content.current.style.display = 'flex';
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

    function calculateDuration(songs: Array<string>): void {
        formRef.current.setTotalDuration(songs);
    }

    function onUploadCancelled(): void {
        cancelSource.current.cancel('User cancelled upload');
    }

    function clearChildrenStates(): void {
        formRef.current.clearInternalStates();
        tableRef.current.clearInternalStates();
        artworkRef.current.clearInternalStates();
    }

    function updateProgress(progress: number, type: string, message: string): void {
        progressbarRef.current.setProgress(progress);
        progressbarRef.current.logMessage(type, message);
    }

    async function onUpload(): Promise<void> {
        //Verify if all inputs are valid
        const formValidation = await formRef.current.getInputValidation();
        const artworkValidation = await artworkRef.current.getInputValidation();
        const tableValidation = await tableRef.current.getInputValidation();
        if (formValidation && artworkValidation && tableValidation) {
            //Reset list of uploaded files
            filesUploaded.current = [];
            const docRef = doc(collection(db, 'albums'));

            try {
                let progress = 10;
                //Iniitialize progress bar and start uploading
                progressbarRef.current.enable(true);
                updateProgress(progress, 'info', 'Uploading album...');
                //Upload album songs to OCI storage
                const tableData: SongData[] = tableRef.current.getData();
                const step = Math.floor(80 / tableData.length);
                for (const song of tableData) {
                    filesUploaded.current.push(`${song.name}.${song.extension}`);
                    const res = await uploadSong(docRef.id, song, cancelSource.current.token);
                    updateProgress((progress += step), 'success', res);
                }
                //Upload album artwork to OCI storage
                const artwork = artworkRef.current.getData();
                let res = await uploadAlbumArtwork(docRef.id, artwork, cancelSource.current.token);
                updateProgress(95, 'success', res);
                //Register album in database
                const albumData = formRef.current.getData();
                albumData.ext = artwork.name.split('.').pop();
                res = await uploadAlbumInfo(docRef.id, albumData, tableData);
                updateProgress(100, 'success', res);
                progressbarRef.current.logMessage('info', 'All album data uploaded successfully!');
                //Clear all states to avoid uploading the same album again
                clearChildrenStates();
            } catch (error) {
                deleteAlbum(docRef.id, oci, filesUploaded.current);
                progressbarRef.current.operationFailed(error.message);
                //Create a new cancel token
                cancelSource.current = axios.CancelToken.source();
            }
        }
    }

    return (
        <div className="page" id="page-upload-create">
            <Sidebar />
            <div className="upload-section" ref={content}>
                {/* Album details */}
                <div className="upload-album">
                    {/* Artwork */}
                    <Artwork ref={artworkRef} type="create" />
                    {/* General info */}
                    <AlbumForm type={'create'} ref={formRef} />
                </div>
                {/* Table with songs */}
                <Table
                    type="create"
                    headers={['Name', 'Position', 'Category', 'Duration']}
                    ref={tableRef}
                    calculateDuration={calculateDuration}
                />
                <button className="upload-btn-album" onClick={onUpload}>
                    Upload
                </button>
            </div>
            <ProgressbarUpload ref={progressbarRef} abort={onUploadCancelled} />
        </div>
    );
};

export default AlbumCreate;
