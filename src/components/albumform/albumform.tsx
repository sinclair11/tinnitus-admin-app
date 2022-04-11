import { db } from '@src/config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { forwardRef, useState, useImperativeHandle, useRef } from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import Dropdown from '@components/dropdown/dropdown';
import { getDurationFormat } from '@src/utils/helpers';
import { AlbumFormData } from '@src/types/album';

type FormProps = {
    type: string;
    name?: string;
    description?: string;
    tags?: string;
    length?: string;
    category?: string;
};

const AlbumForm = forwardRef((props: FormProps, ref?: any) => {
    const [name, setName] = useState('');
    const [nameinvalid, setNameInvalid] = useState('');
    const [description, setDescription] = useState('');
    const [descInvalid, setDescInvalid] = useState('');
    const [notification, setNotification] = useState('');
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState('');
    const [length, setLength] = useState('');
    const category = useRef('');

    useImperativeHandle(ref, () => ({
        getData: (): AlbumFormData => {
            return {
                name: name,
                description: description,
                tags: parseTags(),
                length: length,
                notification: notification,
                category: category.current,
            };
        },

        setCategories: (categories: Array<string>): void => {
            setCategories(categories);
            category.current = categories[0];
        },

        setTotalDuration: (value: Array<string>): void => {
            setLength(getDurationFormat(calculateTotalLength(value)));
        },

        clearInternalStates: (): void => {
            setName('');
            setDescription('');
            setTags('');
            setLength('');
            setNotification('');
            category.current = categories[0];
        },

        getInputValidation: async (): Promise<boolean> => {
            let retVal = 0;

            if (name === '') {
                setNameInvalid('This field is mandatory');
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
                setDescInvalid('This field is mandatory');
                retVal++;
            } else {
                setDescInvalid('');
            }
            if (retVal === 0) {
                return true;
            } else {
                return false;
            }
        },
    }));

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

    return (
        <div className="upload-album-info">
            <InputGroup hasValidation className="input-group">
                <InputGroup.Text className="label">Name</InputGroup.Text>
                <FormControl
                    className="input"
                    required
                    value={name}
                    onChange={(event): void => {
                        setName(event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1));
                        setNameInvalid('');
                    }}
                />
                <p className="invalid-input invalid-name">{nameinvalid}</p>
            </InputGroup>
            <div className="category">
                <p>Category</p>
                <Dropdown
                    items={categories}
                    className="dropdown-margin"
                    onChange={onCategoryChange}
                    current={props.category != undefined ? props.category : categories[0]}
                />
            </div>
            <InputGroup hasValidation className="input-group input-group-area">
                <InputGroup.Text className="label">Description</InputGroup.Text>
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
                <InputGroup.Text className="label">Tags(optional)</InputGroup.Text>
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
                <InputGroup.Text className="label">Notification(optional)</InputGroup.Text>
                <FormControl
                    className="input-notification"
                    required
                    as="textarea"
                    value={notification}
                    onChange={(event): void => setNotification(event.target.value)}
                />
            </InputGroup>
            <p className="album-total-duration">Duration: {length}</p>
        </div>
    );
});

export default AlbumForm;
