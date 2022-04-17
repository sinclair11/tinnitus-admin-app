import { db } from '@src/config/firebase';
import { AlbumFormData, SongData } from '@src/types/album';
import axios, { CancelToken } from 'axios';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';

export async function uploadSong(albumId: string, song: SongData, cancel?: CancelToken): Promise<string> {
    try {
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
            cancelToken: cancel,
        });
        return res.data.message;
    } catch (error) {
        throw error;
    }
}

export async function uploadAlbumInfo(id: string, info: AlbumFormData, tableData: SongData[]): Promise<string> {
    try {
        const albumDocRef = doc(db, 'albums', id);
        const temp = Object.assign([], tableData);
        //Copy songs URL
        for (let i = 0; i < temp.length; i++) {
            delete temp[i].file;
        }
        //Upload general information about album
        await setDoc(albumDocRef, {
            name: info.name,
            upload_date: new Date(),
            ext: info.ext,
            category: info.category,
            description: info.description,
            tags: info.tags,
            length: info.length,
            songs: temp,
            total_songs: temp.length,
            likes: 0,
            favorites: 0,
            reviews: 0,
        });
        return 'Album registered in database';
    } catch (error) {
        throw error;
    }
}

export async function uploadAlbumArtwork(id: string, artwork: File, cancel?: CancelToken): Promise<string> {
    try {
        //Save album artwork at corresponding path provided by doc id
        const formData = new FormData();
        //Prepare form data
        formData.append('album', id);
        formData.append('namespace', 'lra4ojegcvqn');
        formData.append('bucket', 'albums');
        formData.append('size', artwork.size.toString());
        formData.append('artwork', artwork);

        const res = await axios({
            method: 'post',
            url: 'http://127.0.0.1:5001/albums/upload/artwork',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            cancelToken: cancel,
        });
        return res.data.message;
    } catch (error) {
        throw error;
    }
}

export async function editAlbumData(id: string, info: AlbumFormData, tableData: SongData[]): Promise<string> {
    try {
        const albumDocRef = doc(db, 'albums', id);
        await setDoc(
            albumDocRef,
            {
                name: info.name,
                description: info.description,
                tags: info.tags,
                category: info.category,
                length: info.length,
                songs: tableData,
            },
            { merge: true },
        );
        return 'Album updated in database';
    } catch (error) {
        return error.message;
    }
}

export async function uploadNotification(id: string, notification: string): Promise<void> {
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
    } catch (error) {
        throw error;
    }
}

export async function deleteAlbum(id: string, oci: any, fileNames: string[]): Promise<void> {
    try {
        //Delete everyting related to this album
        await deleteDoc(doc(db, 'albums', id));
        await axios.post('http://127.0.0.1:5001/albums/delete', {
            namespace: oci.namespace,
            bucket: 'albums',
            album: id,
            songs: fileNames,
        });
    } catch (error) {
        throw error;
    }
}
