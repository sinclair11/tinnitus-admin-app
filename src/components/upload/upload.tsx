import { Icons } from '@src/utils/icons';
import React, { useState, useRef } from 'react';
import { FormControl } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Sidebar from '../sidebar/sidebar';
import Table from '@components/table/table';
import Dropdown from '@components/dropdown/dropdown';

const UploadView: React.FC = () => {
    const [name, setName] = useState('');
    const [nameinvalid, setNameInvalid] = useState('');
    const [description, setDescription] = useState('');
    const [descInvalid, setDescInvalid] = useState('');
    const [notification, setNotification] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailInvalid, setThumbnailInvalid] = useState('');
    const [tags, setTags] = useState('');
    const [tableInvalid, setTableInvalid] = useState('');
    const inputImg = useRef(null);
    const tableObj: { function: any } = { function: null };

    function displayThumbnail(): JSX.Element {
        if (thumbnail) {
            return <img src={thumbnail} />;
        } else {
            return <p>Selectati o coperta de album</p>;
        }
    }

    function getImage(event: any): void {
        const reader = new FileReader();
        let res = null;
        //Read image data
        reader.readAsDataURL(event.target.files[0]);
        reader.onloadend = (): void => {
            res = reader.result;
            setThumbnail(res);
            setThumbnailInvalid('');
        };
    }

    function onPlusClick(): void {
        //Trigger choose file dialog
        inputImg.current.click();
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
                    setTableInvalid(
                        'Toate campurile din tabel sunt obligatorii',
                    );
                    retVal++;
                    break;
                } else {
                    setTableInvalid('');
                }
            }
        }

        return retVal;
    }

    function uploadAlbum(): boolean {
        throw new Error('Method not implemented.');
    }

    function uploadAlbumArtwork(): boolean {
        throw new Error('Function not implemented.');
    }

    function uploadInfoToDb(): void {
        throw new Error('Method not implemented.');
    }

    function onUpload(): void {
        let retVal;

        if (verifyInputs() === 0) {
            //First upload info in db
            //Upload entire album
            //Upload album artwork
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
                        <p className="invalid-input invalid-thumbnail">
                            {thumbnailInvalid}
                        </p>
                    </div>

                    {/* General info */}
                    <div className="upload-album-info">
                        <InputGroup hasValidation className="input-group">
                            <InputGroup.Text className="label">
                                Nume
                            </InputGroup.Text>
                            <FormControl
                                className="input"
                                required
                                value={name}
                                onChange={(event): void => {
                                    setName(event.target.value);
                                    setNameInvalid('');
                                }}
                            />
                            <p className="invalid-input invalid-name">
                                {nameinvalid}
                            </p>
                        </InputGroup>
                        <div className="category">
                            <p>Categorie</p>
                            <Dropdown
                                items={['General', 'Plm', 'Plt']}
                                className="dropdown-margin"
                            />
                        </div>
                        <InputGroup
                            hasValidation
                            className="input-group input-group-area"
                        >
                            <InputGroup.Text className="label">
                                Descriere
                            </InputGroup.Text>
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
                            <p className="invalid-input invalid-desc">
                                {descInvalid}
                            </p>
                        </InputGroup>
                        <InputGroup
                            hasValidation
                            className="input-group input-group-area"
                        >
                            <InputGroup.Text className="label">
                                Tag-uri(optional)
                            </InputGroup.Text>
                            <FormControl
                                className="input-tag"
                                required
                                as="textarea"
                                value={tags}
                                placeholder="#tag1 #tag2 #tag3"
                                onChange={(event): void =>
                                    setTags(event.target.value)
                                }
                            />
                        </InputGroup>
                        <InputGroup
                            hasValidation
                            className="input-group input-group-area"
                        >
                            <InputGroup.Text className="label">
                                Notificare(optional)
                            </InputGroup.Text>
                            <FormControl
                                className="input-notification"
                                required
                                as="textarea"
                                value={notification}
                                onChange={(event): void =>
                                    setNotification(event.target.value)
                                }
                            />
                        </InputGroup>
                    </div>
                </div>
                {/* Table with songs */}
                <Table table={tableObj} setInvalid={setTableInvalid} />
                <p className="invalid-input invalid-table">{tableInvalid}</p>
                <button className="upload-btn-album" onClick={onUpload}>
                    Upload
                </button>
            </div>
        </div>
    );
};

export default UploadView;
