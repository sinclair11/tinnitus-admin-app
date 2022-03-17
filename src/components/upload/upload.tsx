import React, { useState } from 'react';
import { FormControl } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import Sidebar from '../sidebar/sidebar';

const UploadView: React.FC = () => {
    const [name, setName] = useState('');
    const [nameinvalid, setNameInvalid] = useState('');
    const [description, setDescription] = useState('');
    const [descinvalid, setDescInvalid] = useState('');
    const [tags, setTags] = useState('');
    const [thumbnail, setThumbnail] = useState(null);

    return (
        <div className="page">
            <Sidebar />
            <div className="upload-section">
                {/* Album details */}
                <div className="upload-album">
                    {/* Artwork */}
                    <div className="upload-album-artwork">
                        <img />
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
                                // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                                onChange={(event) =>
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
                                // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                                onChange={(event) =>
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
                                className="input-description"
                                required
                                as="textarea"
                                value={tags}
                                // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                                onChange={(event) =>
                                    setTags(event.target.value)
                                }
                            />
                        </InputGroup>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadView;
