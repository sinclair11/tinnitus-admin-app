import { Icons } from '@src/utils/icons';
import React, { useState, useRef } from 'react';
import { FormControl } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Sidebar from '../sidebar/sidebar';
import Table from '@components/table/table';

const UploadView: React.FC = () => {
    const [name, setName] = useState('');
    const [nameinvalid, setNameInvalid] = useState('');
    const [description, setDescription] = useState('');
    const [descinvalid, setDescInvalid] = useState('');
    const [notification, setNotification] = useState('');
    const [tags, setTags] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
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
        reader.readAsDataURL(event.target.files[0]);
        reader.onloadend = (): void => {
            res = reader.result;
            console.log(res);
            setThumbnail(res);
        };
    }

    function onPlusClick(): void {
        inputImg.current.click();
    }

    function onUpload(): void {
        console.log(tableObj.function());
    }

    return (
        <div className="page">
            <Sidebar />
            <div className="upload-section">
                {/* Album details */}
                <div className="upload-album">
                    {/* Artwork */}
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
                                onChange={(event): void =>
                                    setName(event.target.value)
                                }
                            />
                            <p className="invalid-input">{nameinvalid}</p>
                        </InputGroup>
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
                                onChange={(event): void =>
                                    setDescription(event.target.value)
                                }
                            />
                            <p className="invalid-input">{descinvalid}</p>
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
                            <p className="invalid-input">{descinvalid}</p>
                        </InputGroup>
                    </div>
                </div>
                {/* Table with songs */}
                <Table table={tableObj} />
                <button className="upload-btn-album" onClick={onUpload}>
                    Upload
                </button>
            </div>
        </div>
    );
};

export default UploadView;
