/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import './modalupload.css';
import Modal from 'react-modal';
import { InputGroup, FormControl, Button, Row, Col, Form } from 'react-bootstrap';
import { Icons } from '../../utils/icons'
import electron from 'electron'
import { modalStyles } from '../../utils/styles'
import { ResponseCodes, storeThumbnail, Err } from '../../utils/utils'
import axios, { AxiosResponse } from 'axios'
import fs from 'fs';


type UploadModalProps = {
    modalIsOpen: boolean,
    setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setDone?: React.Dispatch<React.SetStateAction<boolean>>,
}

export const ModalUpload: React.FC<UploadModalProps> = (props: UploadModalProps) => {

    function closeModal() {
        props.setModalIsOpen(false)
    }

    return (
        <Modal
            isOpen={props.modalIsOpen}
            style={modalStyles}
            contentLabel="Upload"
        >
            <div className="UploadForm">
                <FileInfo />
            </div>

            <p className="ModalTitle">Upload</p>
            <img src={Icons['CancelIcon']} className="CancelIcon" onClick={() => closeModal()} />

        </Modal>
    )
}

type InfoFieldProps = {

}

const FileInfo: React.FC<InfoFieldProps> = (props?: InfoFieldProps) => {

    const [filePath, setFilePath] = useState('')
    const [thmbPath, setThmbPath] = useState('')
    const [length, setLength] = useState('')

    const [filePathInvalid, setFilePathInvalid] = useState('')
    const [thmbPathInvalid, setThmbPathInvalid] = useState('')
    const [nameInvalid, setNameInvalid] = useState('')
    const [lengthInvalid, setLengthInvalid] = useState('')
    const [crDateInvalid, setCrDateInvalid] = useState('')
    const [upDateInvalid, setUpDateInvalid] = useState('')
    const [descInvalid, setDescInvalid] = useState('')

    const fieldEmpty = 'Acest camp este obligatoriu'
    const formatInvalid = 'Formatul acestui camp este invalid'
    const pathInvalid = 'Calea catre fisier este invalida'

    function verifyEmptyInput(value: string, setState: React.Dispatch<React.SetStateAction<unknown>>, result: number) {
        if (value === '') {
            setState(fieldEmpty)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            result++
        }
        else {
            setState('')
        }
    }

    function verifyDateInput(value: string, setState: React.Dispatch<React.SetStateAction<unknown>>, result: number) {
        if (value === '') {
            setState(fieldEmpty)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            result++
        }
        else if (!value.match(/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/g)) {
            setState(formatInvalid)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            result++
        }
        else {
            setState('')
        }
    }

    function verifyPathInput(value: string, setState: React.Dispatch<React.SetStateAction<unknown>>, result: number) {
        if (value === '') {
            setState(fieldEmpty)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            result++
        }
        else if (!fs.existsSync(value)) {
            setState(pathInvalid)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            result++
        }
        else {
            setState('')
        }
    }

    async function handleSubmit(event: any) {
        // eslint-disable-next-line prefer-const
        let failedCounter = 0;
        event.preventDefault();

        verifyPathInput(event.target[0].value, setFilePathInvalid, failedCounter)
        verifyPathInput(event.target[2].value, setThmbPathInvalid, failedCounter)
        verifyEmptyInput(event.target[4].value, setNameInvalid, failedCounter)
        verifyEmptyInput(event.target[6].value, setLengthInvalid, failedCounter)
        verifyDateInput(event.target[5].value, setCrDateInvalid, failedCounter)
        verifyDateInput(event.target[7].value, setUpDateInvalid, failedCounter)
        verifyEmptyInput(event.target[9].value, setDescInvalid, failedCounter)

        //Check if all inputs are valid
        if (failedCounter == 0) {
            try {
                //Request authorization from server
                const authorizationResonse = await axios({
                    method: 'get',
                    url: '/api/admin/videos/auth',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                });
                const status = authorizationResonse.status

                if (status === 200) {
                    //First step completed
                    console.log('Procesul de autorizare a reusit')
                    //Try sending the video
                    storeVideo(event.target[4].value, event.target[0].value, event.target[2].value)
                        .then((status) => {
                            //Update step status
                            console.log(status)
                        })
                        .catch((err: any) => {
                            //Report error for in progress step
                            console.log(err.message)
                        })
                }
                else {
                    //Notify user why authorization failed
                    console.log(ResponseCodes.get(status))
                }
            }
            catch (error) {
                //Problem sending authorization request or received response
                console.log('A intervenit o eroare')
            }
        }
        else {
            //At least one input is invalid
        }
    }

    async function storeVideo(name: string, pathToVideo: string, pathToThumbnail: string): Promise<any> {
        //Provided path is valid -> try sending video
        const resourceStream = fs.createReadStream(pathToVideo);
        const bytesToRead = 1024 * 1000;
        const internalErr = 'A intervenit o eroare in procesul de trimitere al fisierului video'

        resourceStream.setEncoding('binary');
        //Register event listeners
        resourceStream.on('end', () => {
            //
        })
        resourceStream.on('error', () => {
            console.log(internalErr)
        })
        resourceStream.on('data', (chunk) => {
            axios({
                method: 'put',
                url: `api/admin/videos/${name}`,
                headers: {
                    'Content-Type': 'video/mp4',
                    'Expect': '100-continue'
                },
                data: {
                    packet: chunk
                }
            }).then((response: AxiosResponse) => {
                if (response.status === 100) {
                    resourceStream.read(bytesToRead)
                }
                else if (response.status === 201) {
                    //Video uploaded successfully -> upload thumbnail
                    storeThumbnail(pathToThumbnail)
                }
                else {
                    console.log(ResponseCodes.get(response.status))
                }
            })
                .catch(() => {
                    console.log(internalErr)
                })
        })
        //Send the first chunk and continue until the end in the event listener
        resourceStream.read(bytesToRead)
        return 'Fisierul video se trimite'
    }

    function browseFile() {
        // let dialog: Dialog
        electron.remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Movies', extensions: ['mov', 'mkv', 'avi', 'mp4'] },]
        }).then((path) => {
            if (path.canceled === true) {
                setFilePath('')
            }
            else {
                setFilePath(String(path.filePaths))
            }
        })
            .catch(() => {
                setFilePath('')
            })
    }

    function browseThumbnail() {
        // let dialog: Dialog
        electron.remote.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'png'] },]
        }).then((path) => {
            if (path.canceled === true) {
                setThmbPath('')
            }
            else {
                setThmbPath(String(path.filePaths))
            }
        })
            .catch(() => {
                setThmbPath('')
            })
    }

    function verifyInputLength(value: string) {

        const expr = new RegExp('^$|^[1-9][0-9]*$')
        if (expr.test(value)) {
            setLength(value)
        }
    }

    return (
        <Form noValidate className="UploadForm" onSubmit={handleSubmit}>
            <div className="InputSection" style={{ marginTop: '15px' }}>
                <InputGroup
                    className="InputGroupPath"
                    hasValidation
                >
                    <InputGroup.Text className="InputLabel">Fisier</InputGroup.Text>
                    <FormControl
                        required
                        className="InputText"
                        style={{ width: '75%' }}
                        value={filePath}
                        onChange={(e: any) => setFilePath(e.target.value)}
                    />
                    <Button
                        variant="outline-secondary"
                        className="BrowseBtn"
                        onClick={browseFile}
                    >
                        Browse
                    </Button>
                </InputGroup>
                <p className="InvalidField">{filePathInvalid}</p>
            </div>

            <div className="InputSection">
                <InputGroup
                    className="InputGroupPath"
                    hasValidation
                >
                    <InputGroup.Text className="InputLabel">Coperta</InputGroup.Text>
                    <FormControl
                        className="InputText"
                        style={{ width: '72%' }}
                        value={thmbPath}
                        onChange={(e: any) => setThmbPath(e.target.value)}
                        required
                    />
                    <Button
                        variant="outline-secondary"
                        className="BrowseBtn"
                        onClick={browseThumbnail}
                    >
                        Browse
                    </Button>
                </InputGroup>
                <p className="InvalidField">{thmbPathInvalid}</p>
            </div>

            <div className="InputInfo">
                <Row className="InfoRow" style={{ height: '40%' }}>
                    <Col className="InfoCol">

                        <div className="InputSection" style={{ height: '50%' }}>
                            <InputGroup
                                className="InputInfoGroup"
                                hasValidation
                            >
                                <InputGroup.Text className="InputLabel">Nume</InputGroup.Text>
                                <FormControl
                                    className="InputText"
                                    required
                                />
                            </InputGroup>
                            <p className="InvalidField">{nameInvalid}</p>
                        </div>

                        <div className="InputSection" style={{ height: '45%' }}>
                            <InputGroup
                                className="InputInfoGroup"
                                hasValidation
                            >
                                <InputGroup.Text className="InputLabel" style={{ width: '80px' }}>Data creare</InputGroup.Text>
                                <FormControl
                                    className="InputText"
                                    style={{ width: '68%' }}
                                    placeholder="dd/mm/yyyy"
                                    required
                                />
                            </InputGroup>
                            <p className="InvalidField">{crDateInvalid}</p>
                        </div>

                    </Col>
                    <Col className="InfoCol">

                        <div className="InputSection" style={{ height: '45%' }}>
                            <InputGroup
                                className="InputInfoGroup"
                                hasValidation
                            >
                                <InputGroup.Text className="InputLabel">Lungime</InputGroup.Text>
                                <FormControl
                                    className="InputText"
                                    style={{ width: '70%' }}
                                    placeholder="secunde"
                                    value={length}
                                    onChange={(e: any) => verifyInputLength(e.target.value)}
                                    required
                                />
                            </InputGroup>
                            <p className="InvalidField">{lengthInvalid}</p>
                        </div>

                        <div className="InputSection" style={{ height: '45%' }}>
                            <InputGroup
                                className="InputInfoGroup"
                                hasValidation
                            >
                                <InputGroup.Text className="InputLabel" style={{ width: '95px' }}>Data incarcare</InputGroup.Text>
                                <FormControl
                                    className="InputText"
                                    style={{ width: '55%' }}
                                    placeholder="dd/mm/yyyy"
                                    required
                                />
                            </InputGroup>
                            <p className="InvalidField">{upDateInvalid}</p>
                        </div>

                    </Col>
                </Row>

                <Row className="InfoRow" style={{ borderBottom: '0px' }}>
                    <Col className="InfoCol" style={{ padding: '0px' }}>
                        <InputGroup className="InputTagDescGroup">
                            <InputGroup.Text className="InputLabel" style={{ width: '99%', marginLeft: '-1px' }}>Tags</InputGroup.Text>
                            <FormControl
                                className="InputArea"
                                as="textarea"
                                placeholder="#tag1 #tag2 #tag3"
                            />
                        </InputGroup>
                    </Col>
                    <Col className="InfoCol" style={{ padding: '0px' }}>
                        <InputGroup hasValidation className="InputTagDescGroup" style={{ width: '90%' }}>
                            <InputGroup.Text className="InputLabel" style={{ width: '99%', marginLeft: '-1px' }}>Descriere</InputGroup.Text>
                            <FormControl
                                className="InputArea"
                                as="textarea"
                                required
                            />
                        </InputGroup>
                        <p className="InvalidField" style={{ marginLeft: '10px', marginTop: '-10px' }}>{descInvalid}</p>
                    </Col>
                </Row>
            </div>
            <Button type="submit" className="UploadBtn">Upload</Button>
        </Form>
    )
}