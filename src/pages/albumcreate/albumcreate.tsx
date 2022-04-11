import React, { useRef, useEffect, createRef } from 'react';
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
import { uploadAlbumArtwork, uploadAlbumInfo, uploadSong } from '@services/upload';

const AlbumCreate: React.FC = () => {
    const history = useHistory();
    const auth = useSelector<CombinedStates>((state) => state.generalReducer.auth) as any;
    const oci = useSelector<CombinedStates>((state) => state.ociReducer.config) as any;
    const uploadAbort = useRef(false);
    const filesUploaded = useRef([]);
    const tableRef = createRef<any>();
    const formRef = createRef<any>();
    const artworkRef = createRef<any>();
    const progressbarRef = createRef<any>();

    useEffect(() => {
        if (auth) {
            onFetchCategories().then((data) => {
                tableRef.current.setCategories(data);
                formRef.current.setCategories(data);
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
                progressbarRef.current.setVariant('success');
                progressbarRef.current.setProgress(progress);
                progressbarRef.current.logMessage('info', 'Uploading album...');
                //Upload album songs to OCI storage
                const tableData = tableRef.current.getData();
                const step = Math.floor(80 / tableData.length);
                for (const song of tableData) {
                    const res = await uploadSong(docRef.id, song);
                    progressbarRef.current.setProgress((progress += step));
                    progressbarRef.current.logMessage('success', res);
                }
                //Upload album artwork to OCI storage
                const artwork = artworkRef.current.getData();
                let res = await uploadAlbumArtwork(docRef.id, artwork);
                progressbarRef.current.setProgress(95);
                progressbarRef.current.logMessage('success', res);
                //Register album in database
                const albumData = formRef.current.getData();
                res = await uploadAlbumInfo(docRef.id, albumData, tableData);
                progressbarRef.current.setProgress(100);
                progressbarRef.current.logMessage('success', res);
                progressbarRef.current.logMessage('info', 'All album data uploaded successfully!');
                //Clear all states to avoid uploading the same album again
                formRef.current.clearInternalStates();
                tableRef.current.clearInternalStates();
                artworkRef.current.clearInternalStates();
            } catch (error) {
                progressbarRef.current.operationFailed(error);
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
                    <Artwork ref={artworkRef} />
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
            <ProgressbarUpload ref={progressbarRef} abort={undefined} />
        </div>
    );
};

export default AlbumCreate;
