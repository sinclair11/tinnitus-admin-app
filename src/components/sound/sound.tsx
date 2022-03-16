import { dialogStyles } from '@src/styles/styles';
import ErrorHandler from '@src/utils/errorhandler';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { SketchPicker } from 'react-color';
import { MessageBox } from '../messagebox/messagebox';
import { store } from '@src/store/store';

class SoundData {
    sound: string;
    img: string;
    name: string;
    description: string;
    position: string;
    color: string;
    font: string;
    opacity: string;
    blur: string;
}

class SoundInvalid {
    sound: string;
    img: string;
    name: string;
    description: string;
}

const screenId = 'preview-screen';
const imgId = 'preview-img';
const nameId = 'preview-name';
const descId = 'preview-desc';

const SoundView: React.FC = () => {
    const [render, setRender] = useState(false);
    const soundData = useRef(initialStyle());
    const [audioPath, setAudioPath] = useState('');
    const [imgPath, setImgPath] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [visible, setVisible] = useState(false);
    const message = useRef('');
    const invalid = useRef(new SoundInvalid());
    const inputColor = useRef(null);

    function initialStyle(): SoundData {
        return {
            sound: '',
            img: '',
            name: '',
            description: '',
            position: 'top',
            color: 'white',
            font: '14 sans-serif',
            opacity: '1',
            blur: '0',
        };
    }

    function browseFile(type: string, setState: any): void {
        //Check resource type to provide correct extension for open file dialog
        // let extensions: string[] = [];
        // if (type === 'sound') {
        //     extensions = ['mp3'];
        // } else if (type === 'image') {
        //     extensions = ['jpg', 'jpeg', 'png'];
        // }
        // electron.remote.dialog
        //     .showOpenDialog({
        //         properties: ['openFile'],
        //         filters: [
        //             {
        //                 name: 'Movies',
        //                 extensions: extensions,
        //             },
        //         ],
        //     })
        //     .then((path) => {
        //         //User canceled
        //         if (path.canceled === true) {
        //             setState('');
        //         } else {
        //             //Update path in component
        //             setState(String(path.filePaths));
        //             //Read buffer bytes
        //             const item = readFileSync(String(path.filePaths));
        //             //Store item in string format
        //             if (type === 'sound') {
        //                 soundData.current.sound = item.toString('base64');
        //             } else if (type === 'image') {
        //                 soundData.current.img = item.toString('base64');
        //             }
        //         }
        //     })
        //     .catch(() => {
        //         setState('');
        //     });
    }

    useEffect(() => {
        setAudioPath('');
        setImgPath('');
    }, []);

    function noChange(): void {
        //! Don't let user manually modify path
    }

    function onColorChange(clr: any): void {
        inputColor.current.style.background = clr.hex;
        soundData.current.color = clr.hex;
        setRender(!render);
    }

    async function onUploadClick(): Promise<void> {
        if (checkInputs()) {
            const secret = store.getState().generalReducer.token;
            const data = {
                name: soundData.current.name,
                description: soundData.current.description,
                sound: soundData.current.sound,
                img: soundData.current.img,
                style: parseStyle(),
            };
            try {
                const res = await axios({
                    method: 'post',
                    timeout: 30000,
                    timeoutErrorMessage: 'timeout',
                    url: 'http://127.0.0.1:3000/api/admin/generator/sound',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${secret}`,
                    },
                    data: data,
                });
                //Let user know that resource has been uploaded
                message.current = res.data.message;
                setVisible(true);
                //Clean states if upload is successful
                cleanAfterUpload();
            } catch (err) {
                //Handle error and display message
                message.current = ErrorHandler.getErrorType(err);
                setVisible(true);
                // console.log(error.current);
            }
        }
    }

    function cleanAfterUpload(): void {
        inputColor.current.style.background = 'white';
        setAudioPath('');
        setImgPath('');
    }

    function checkInputs(): boolean {
        let counter = 0;

        if (soundData.current.sound === '') {
            invalid.current.sound = 'Nu ai incarcat niciun sunet';
            counter++;
        } else {
            invalid.current.sound = '';
        }

        if (soundData.current.img === '') {
            invalid.current.img = 'Nu ai incarcat nicio coperta';
            counter++;
        } else {
            invalid.current.img = '';
        }

        if (soundData.current.name === '') {
            invalid.current.name = 'Acest camp este obligatoriu';
            counter++;
        } else {
            invalid.current.name = '';
        }

        if (soundData.current.description === '') {
            invalid.current.description = 'Acest camp este obligatoriu';
            counter++;
        } else {
            invalid.current.description = '';
        }

        setRender(!render);

        if (counter > 0) {
            return false;
        } else {
            return true;
        }
    }

    function parseStyle(): string {
        let fontTemp: string;
        let opacTemp: string;
        let blurTemp: string;

        //Set default values in case fields are empty
        if (soundData.current.font === '') {
            fontTemp = '14 sans-serif';
        } else {
            fontTemp = soundData.current.font;
        }
        if (soundData.current.opacity === '') {
            opacTemp = '1';
        } else {
            opacTemp = soundData.current.opacity;
        }
        if (soundData.current.blur === '') {
            blurTemp = '0';
        } else {
            blurTemp = soundData.current.blur;
        }
        setRender(!render);
        return `position:${soundData.current.position} color:${soundData.current.color} font:${fontTemp} opacity:${opacTemp} blur:${blurTemp}`;
    }

    async function modifyPreviewStyle(
        id: string,
        key: any,
        value: string,
    ): Promise<void> {
        const el = document.getElementById(id);
        if (key === 'position') {
            //Because of absolute position we need Y coord of the screen preview
            let height = document
                .getElementById(screenId)
                .getBoundingClientRect().top;
            //Add half to center
            if (value === 'center') {
                height += 300;
            }
            //Add 2 halfes to bottom
            else if (value === 'bottom') {
                height += 600;
            }
            //Set custom style
            el.style.top = `${height}px`;
        } else {
            el.style[key] = value;
        }
    }

    async function modifyPreviewChild(
        id: string,
        value: string,
    ): Promise<void> {
        // document.getElementById(id).childNodes[0] = value;
    }

    return (
        <div className="UploadView">
            {/* Sound path */}
            <InputGroup className="InputGroupDiv" hasValidation>
                <div className="BrowseGroup">
                    <InputGroup.Text className="Label">Sunet</InputGroup.Text>
                    <FormControl
                        required
                        className="BrowseInput"
                        value={audioPath}
                        onChange={noChange}
                    />
                    <Button
                        variant="outline-secondary"
                        className="BrowseBtn"
                        onClick={(): void => browseFile('sound', setAudioPath)}
                    >
                        Browse
                    </Button>
                </div>
                <p>{invalid.current.sound}</p>
            </InputGroup>

            {/* Image path */}
            <InputGroup className="InputGroupDiv" hasValidation>
                <div className="BrowseGroup">
                    <InputGroup.Text className="Label">Imagine</InputGroup.Text>
                    <FormControl
                        required
                        className="BrowseInput"
                        value={imgPath}
                        onChange={noChange}
                    />
                    <Button
                        variant="outline-secondary"
                        className="BrowseBtn"
                        onClick={(): void => browseFile('image', setImgPath)}
                    >
                        Browse
                    </Button>
                </div>
                <p>{invalid.current.img}</p>
            </InputGroup>
            {/* Name */}
            <InputGroup className="InputGroupDiv" hasValidation>
                <div className="BrowseGroup">
                    <InputGroup.Text className="LabelName Label">
                        Nume
                    </InputGroup.Text>
                    <FormControl
                        required
                        className="NameInput"
                        value={soundData.current.name}
                        onChange={(e: any): void => {
                            soundData.current.name = e.target.value;
                            modifyPreviewChild(nameId, e.target.value);
                        }}
                    />
                </div>
                <p>{invalid.current.name}</p>
            </InputGroup>
            {/* Description */}
            <InputGroup
                className="InputGroupDiv"
                hasValidation
                style={{ marginBottom: '5px' }}
            >
                <InputGroup.Text className="LabelDesc">
                    Descriere
                </InputGroup.Text>
                <div className="BrowseGroup">
                    <FormControl
                        required
                        as="textarea"
                        className="DescInput"
                        value={soundData.current.description}
                        onChange={(e: any): void => {
                            soundData.current.description = e.target.value;
                            modifyPreviewChild(descId, e.target.value);
                        }}
                    />
                </div>
                <p>{invalid.current.description}</p>
            </InputGroup>
            <div className="CustomStyle">
                {/* Style for phone screen */}
                {/* Text position */}
                <InputGroup className="StyleGroup" hasValidation>
                    <InputGroup.Text className="Label LabelPosition">
                        Pozitie text
                    </InputGroup.Text>
                    <FormControl
                        required
                        as="select"
                        className="SelectInput"
                        value={soundData.current.position}
                        onChange={(e: any): void => {
                            soundData.current.position = e.target.value;
                            modifyPreviewStyle(
                                descId,
                                'position',
                                e.target.value,
                            );
                        }}
                    >
                        <option value="top">Sus</option>
                        <option value="center">Centru</option>
                        <option value="bottom">Jos</option>
                    </FormControl>
                    <p>Selecteaza pozitia textului</p>
                </InputGroup>
                {/* Text color */}
                <InputGroup className="StyleGroup" hasValidation>
                    <InputGroup.Text className="Label LabelColor">
                        Culoare text
                    </InputGroup.Text>
                    <div
                        ref={inputColor}
                        className="SimpleInput InputColor"
                        onClick={(): void => {
                            setShowPicker(!showPicker);
                        }}
                    ></div>
                    <div className="PickerDiv">
                        {showPicker && (
                            <SketchPicker
                                onChangeComplete={onColorChange}
                                color={soundData.current.color}
                            />
                        )}
                    </div>
                    <p>Selecteaza culoarea textului</p>
                </InputGroup>
                {/* Text font */}
                <InputGroup className="StyleGroup" hasValidation>
                    <InputGroup.Text className="Label">
                        Font text
                    </InputGroup.Text>
                    <FormControl
                        required
                        className="SimpleInput InputFont"
                        value={soundData.current.font}
                        onChange={(e: any): void => {
                            soundData.current.font = e.target.value;
                            modifyPreviewStyle(descId, 'font', e.target.value);
                        }}
                    />
                    <p>Selecteaza fontul textului</p>
                </InputGroup>
                {/* Image opacity */}
                <InputGroup className="StyleGroup" hasValidation>
                    <InputGroup.Text className="Label LabelOpac">
                        Opacitate imagine
                    </InputGroup.Text>
                    <FormControl
                        required
                        className="SimpleInput InputOpac"
                        value={soundData.current.opacity}
                        onChange={(e: any): void => {
                            soundData.current.opacity = e.target.value;
                            modifyPreviewStyle(
                                imgId,
                                'opacity',
                                e.target.value,
                            );
                        }}
                    />
                    <p>Seteaza opacitatea imaginii</p>
                </InputGroup>
                {/* Image blur */}
                <InputGroup className="StyleGroup" hasValidation>
                    <InputGroup.Text className="Label">
                        Blur imagine
                    </InputGroup.Text>
                    <FormControl
                        required
                        className="SimpleInput InputBlur"
                        value={soundData.current.blur}
                        onChange={(e: any): void => {
                            soundData.current.blur = e.target.value;
                            modifyPreviewStyle(
                                imgId,
                                'filter',
                                `blur(${e.target.value})`,
                            );
                        }}
                    />
                    <p>Seteaza blur imagine</p>
                </InputGroup>
                {/* Upload button */}
            </div>
            <button className="UploadBtn" onClick={onUploadClick}>
                Upload
            </button>
            <Modal isOpen={visible} style={dialogStyles} ariaHideApp={false}>
                <MessageBox setIsOpen={setVisible} message={message.current} />
            </Modal>
        </div>
    );
};

export default SoundView;
