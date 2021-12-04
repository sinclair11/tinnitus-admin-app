import React, { useState, useEffect } from 'react';
import {
	InputGroup,
	FormControl,
	Button,
	Row,
	Col,
	Form,
} from 'react-bootstrap';
import electron from 'electron';
import { ResponseCodes } from '@utils/utils';
import axios, { CancelTokenSource } from 'axios';
import fs from 'fs';
import { readChunk } from 'read-chunk';
import { useDispatch } from 'react-redux';
import { store } from '@store/store';
import { getAuth } from '@src/utils/utils';

let isAborted = false;

export function setAbort(value: boolean): void {
	isAborted = value;
}

type TransactionData = {
	id: string;
	pathVideo: string;
	pathThumbnail: string;
	name: string;
	length: number;
	creation: string;
	upload: string;
	description: string;
	tags: string;
};

type UploadProps = {
	formModal: React.Dispatch<React.SetStateAction<boolean>>;
	type: string;
	data?: { name: string; tags: string; description: string };
	cancelation: CancelTokenSource;
};

export const UploadForm: React.FC<UploadProps> = (props?: UploadProps) => {
	const dispatch = useDispatch();
	//States for inputs validation
	const [filePath, setFilePath] = useState('');
	const [thmbPath, setThmbPath] = useState('');
	const [filePathInvalid, setFilePathInvalid] = useState('');
	const [thmbPathInvalid, setThmbPathInvalid] = useState('');
	const [nameInvalid, setNameInvalid] = useState('');
	const [lengthInvalid, setLengthInvalid] = useState('');
	const [crDateInvalid, setCrDateInvalid] = useState('');
	const [upDateInvalid, setUpDateInvalid] = useState('');
	const [descInvalid, setDescInvalid] = useState('');
	//States for editable data
	const [name, setName] = useState('');
	const [tags, setTags] = useState('');
	const [desc, setDesc] = useState('');
	//Error messages
	const fieldEmpty = 'Acest camp este obligatoriu';
	const formatInvalid = 'Formatul acestui camp este invalid';
	const pathInvalid =
		'Calea catre fisier este invalida sau fisierul nu exista';
	let transactionToken = '';
	//Progress of transaction
	let progress = 0;
	//How many responses
	let responsesProgress = 0;
	let sentRequests = 0;

	useEffect(() => {
		setName(props.data.name);
		setTags(props.data.tags);
		setDesc(props.data.description);
	}, [props.data]);

	/**
	 *
	 * @returns
	 */
	function createPathElements(): JSX.Element {
		if (props.type === 'upload') {
			return (
				<Row className="IRow">
					<Col className="ColPath">
						<div className="Section SectionPath">
							<InputGroup
								className="InputGroupPath"
								hasValidation
							>
								<InputGroup.Text className="Label">
									Fisier
								</InputGroup.Text>
								<FormControl
									required
									className="InputText"
									value={filePath}
									// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
									onChange={(e: any) =>
										setFilePath(e.target.value)
									}
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
						<div className="Section SectionPath">
							<InputGroup
								className="InputGroupPath"
								hasValidation
							>
								<InputGroup.Text className="Label">
									Coperta
								</InputGroup.Text>
								<FormControl
									className="InputThmb"
									value={thmbPath}
									// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
									onChange={(e: any) =>
										setThmbPath(e.target.value)
									}
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
					</Col>
				</Row>
			);
		} else {
			return <></>;
		}
	}

	/**
	 *
	 * @param value
	 * @param setState
	 * @param result
	 */
	function verifyEmptyInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result.value++;
		} else {
			setState('');
		}
	}

	/**
	 *
	 * @param value
	 * @param setState
	 * @param result
	 */
	function verifyDateInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty);
			result.value++;
		} else if (
			!value.match(
				/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/g,
			)
		) {
			setState(formatInvalid);
			result.value++;
		} else {
			setState('');
		}
	}

	/**
	 *
	 * @param value
	 * @param setState
	 * @param result
	 */
	function verifyLengthInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty);
			result++;
		} else if (
			!value.match(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/)
		) {
			setState(formatInvalid);
			result.value++;
		} else {
			setState('');
		}
	}

	/**
	 *
	 * @param value
	 * @param setState
	 * @param result
	 */
	function verifyPathInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result++;
		} else if (!fs.existsSync(value)) {
			setState(pathInvalid);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result.value++;
		} else {
			setState('');
		}
	}

	/**
	 *
	 * @param event
	 */
	function uploadResData(event: any): void {
		//Create an instance with transaction data
		const transactionData = {
			id: '',
			pathVideo: event.target[0].value,
			pathThumbnail: event.target[2].value,
			name: event.target[4].value,
			length: event.target[6].value,
			creation: event.target[5].value,
			upload: event.target[7].value,
			description: event.target[9].value,
			tags: event.target[8].value,
		};
		//First store resource data in firestore
		storeInfoInDb(transactionData);
	}

	/**
	 * @function editResData
	 * @param event
	 */
	function editResData(event: any): void {
		const data = {
			action: 'edit',
			oldname: store.getState().resdataReducer.selected,
			name: event.target[0].value,
			description: event.target[2].value,
			tags: event.target[1].value,
		};

		// Try editing info
		axios({
			method: 'post',
			url: 'http://127.0.0.1:3000/api/admin/videos/infodb',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${transactionToken}`,
			},
			data: data,
		})
			.then((response) => {
				//Check response
				if (response.status === 200) {
					//Edit action completed successfully
					dispatch({ type: 'progress/update', payload: 100 });
					dispatch({
						type: 'progress/log',
						payload: {
							type: 'green',
							value: 'Informatiile au fost editate cu succes',
						},
					});
					//Update info in panels
					updatePanelsOnEdit(data);
				}
			})
			.catch((error) => {
				// TODO: Log error in db specific document
				//Notify user that edit action failed
				dispatch({
					type: 'progress/fail',
					payload: {
						type: 'red',
						value: 'Operatiunea de editare a esuat',
					},
				});
			});
	}

	/**
	 *
	 *
	 * @param data
	 */
	async function updatePanelsOnEdit(data: any): Promise<void> {
		//Get already displayed data
		const generalInfo = store.getState().resdataReducer.info;
		//Update edited data on corresponding panel
		dispatch({
			type: 'resdata/info',
			payload: [
				{ name: 'Nume', value: data.name },
				generalInfo[1],
				generalInfo[2],
				generalInfo[3],
				{ name: 'Tags', value: data.tags },
				{ name: 'Descriere', value: data.description },
			],
		});
		//Update selected value
		dispatch({
			type: 'resdata/selected',
			payload: data.name,
		});
	}

	/**
	 * @function handleOnEdit
	 * @param event
	 */
	async function handleOnEdit(event: any): Promise<void> {
		// eslint-disable-next-line prefer-const
		let failedCounter = {
			value: 0,
		};
		event.preventDefault();
		isAborted = false;

		//Verify name and description (always mandatory)
		verifyEmptyInput(event.target[0].value, setNameInvalid, failedCounter);
		verifyEmptyInput(event.target[2].value, setDescInvalid, failedCounter);

		if (failedCounter.value == 0) {
			//Hide form and show progress bar
			props.formModal(false);
			// props.progressModal(true);
			dispatch({ type: 'progress/open', payload: true });
			//First get authorization permission
			try {
				//JWT
				const secret = await getAuth();
				//First step completed
				dispatch({ type: 'progress/update', payload: 10 });
				dispatch({
					type: 'progress/log',
					payload: {
						type: 'blue',
						value: 'Tranzactia a fost autorizata',
					},
				});
				transactionToken = secret;
				//Upload edited data
				editResData(event);
			} catch (error) {
				//Problem sending authorization request or receiving response
				/**
				 * @todo log error in db specific document
				 */
				console.log(error);
			}
		} else {
			//Exit -> user already notified via input mandatory fields
		}
	}

	/**
	 * @function handleOnUpload
	 * @param event
	 */
	async function handleOnUpload(event: any): Promise<void> {
		// eslint-disable-next-line prefer-const
		let failedCounter = {
			value: 0,
		};
		event.preventDefault();
		isAborted = false;

		verifyPathInput(
			event.target[0].value,
			setFilePathInvalid,
			failedCounter,
		);
		verifyPathInput(
			event.target[2].value,
			setThmbPathInvalid,
			failedCounter,
		);
		verifyEmptyInput(event.target[4].value, setNameInvalid, failedCounter);
		verifyLengthInput(
			event.target[6].value,
			setLengthInvalid,
			failedCounter,
		);
		verifyDateInput(event.target[5].value, setCrDateInvalid, failedCounter);
		verifyDateInput(event.target[7].value, setUpDateInvalid, failedCounter);
		verifyEmptyInput(event.target[9].value, setDescInvalid, failedCounter);

		if (failedCounter.value == 0) {
			//Hide form and show progress bar
			props.formModal(false);
			// props.progressModal(true);
			dispatch({ type: 'progress/open', payload: true });
			//First get authorization permission
			try {
				//JWT
				const secret = await getAuth();
				//First step completed
				progress += 5;
				// props.updateProgress(progress);
				dispatch({ type: 'progress/update', payload: progress });
				dispatch({
					type: 'progress/log',
					payload: {
						type: 'blue',
						value: 'Tranzactia a fost autorizata',
					},
				});
				transactionToken = secret;
				//Upload resource with data
				uploadResData(event);
			} catch (error) {
				//Problem sending authorization request or received response
				/**
				 * @todo log error in db specific document
				 */
				console.error(error);
				const status = error.response.status;
				if (status === 401) {
					dispatch({
						type: 'progress/fail',
						payload: {
							type: 'red',
							value: 'Tranzactia nu a fost autorizata',
						},
					});
				} else {
					setErrorLog(error.response.status);
				}
			}
		} else {
			//Exit -> user already notified via input mandatory fields
		}
	}

	/**
	 * @function handleSubmit
	 * @param event
	 */
	async function handleSubmit(event: any): Promise<void> {
		//* First clear progressbar if needed
		dispatch({
			type: 'progress/clean',
			payload: null,
		});
		//Verify submit type
		if (props.type === 'upload') {
			handleOnUpload(event);
		} else if (props.type === 'edit') {
			handleOnEdit(event);
		}
	}

	/**
	 *
	 * @param status
	 */
	function setErrorLog(status: number): void {
		dispatch({
			type: 'progress/fail',
			payload: {
				type: 'red',
				value: ResponseCodes.get(status),
			},
		});
	}

	/**
	 * @function storeVideo
	 * @param transactionData
	 */
	function storeVideo(transactionData: TransactionData): void {
		//First register asset and create path
		axios({
			method: 'post',
			timeout: 30000,
			timeoutErrorMessage: 'timeout',
			cancelToken: props.cancelation.token,
			url: 'http://127.0.0.1:3000/api/admin/videos',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${transactionToken}`,
			},
			data: {
				action: 'create',
				id: transactionData.id,
				packet: '',
				finished: false,
			},
		})
			.then((response) => {
				//Open file and get size
				const fd = fs.openSync(transactionData.pathVideo, 'r');
				//Round number of requests per size
				const totalRequests = Math.round(
					fs.statSync(transactionData.pathVideo).size / (1000 * 100),
				);
				responsesProgress = Math.round((totalRequests * 2) / 100);
				//Close file after operation
				fs.closeSync(fd);
				//Update progress and log
				progress += 5;
				dispatch({ type: 'progress/update', payload: progress });
				dispatch({
					type: 'progress/log',
					payload: { type: 'black', value: response.data },
				});
				dispatch({
					type: 'progress/log',
					payload: {
						type: 'black',
						value: 'Se incarca fisierul video...',
					},
				});
				sendVideoInChunks(transactionData, 0);
			})
			.catch((error) => {
				let errorMessage = '';
				if (error.message === 'timeout') {
					//! Timeout reached
					errorMessage =
						'Serverul intarzie sa raspunda, cerere anulata';
				} else if (axios.isCancel(error)) {
					//! User aborted the operation
					errorMessage = 'Tranzactia a fost intrerupta';
				} else {
					//! Internal server error
					errorMessage = error.response.data;
				}
				//Request deletion
				requestDeleteOnFail(transactionData.name);
				//Could not upload video
				dispatch({
					type: 'progress/fail',
					payload: {
						type: 'red',
						value: errorMessage,
					},
				});
			});
	}

	/**
	 *
	 * @param transactionData
	 */
	async function storeThumbnail(
		transactionData: TransactionData,
	): Promise<void> {
		const bytesToRead = 1000 * 100;
		let done = false;
		let startPosition = 0;
		let finished = false;

		while (done === false) {
			let packet = '';
			//Read chunk
			const chunk = await readChunk(transactionData.pathThumbnail, {
				length: bytesToRead,
				startPosition: startPosition,
			});
			//Iterate through all bytes of data
			for (let i = 0; i < chunk.length; i++) {
				packet += String.fromCharCode(chunk[i]);
			}
			//Increment to next position
			startPosition += bytesToRead;
			try {
				//Check if we sent all chunks
				if (packet.length === 0) {
					finished = true;
				}
				//Send thumbnail in chunks
				const response = await axios({
					method: 'post',
					timeout: 30000,
					timeoutErrorMessage: 'timeout',
					url: 'http://127.0.0.1:3000/api/admin/videos/thumbnail',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${transactionToken}`,
					},
					data: {
						action: 'upload',
						id: transactionData.id,
						packet: packet,
						finished: finished,
					},
				});
				if (response.status == 201) {
					//Thumbnail was stored
					//Update progress
					dispatch({ type: 'progress/update', payload: 100 });
					//Update console log
					dispatch({
						type: 'progress/log',
						payload: {
							type: 'green',
							value: 'Coperta a fost incarcata cu succes',
						},
					});
					done = true;
				}
			} catch (error) {
				//If operation failed then request resource deletion
				requestDeleteOnFail(transactionData.name);
				//Update console log
				dispatch({
					type: 'progress/fail',
					payload: {
						type: 'green',
						value: 'Coperta nu a putut fi incarcata',
					},
				});
				//Update progress to failed
				dispatch({
					type: 'progress/log',
					payload: { type: 'red', value: 'Tranzactie incheiata' },
				});
				break;
			}
		}
	}

	/**
	 *
	 * @param name
	 */
	function requestDeleteOnFail(name: string): void {
		//If somehow fails then request deletion
		axios({
			method: 'delete',
			url: `http://127.0.0.1:3000/api/admin/videos/thumbnail?id=${name}`,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${transactionToken}`,
			},
		});
	}

	/**
	 *
	 * @param transactionData
	 */
	async function storeInfoInDb(
		transactionData: TransactionData,
	): Promise<void> {
		try {
			const response = await axios({
				method: 'post',
				url: 'http://127.0.0.1:3000/api/admin/videos/infodb',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${transactionToken}`,
				},
				data: {
					action: 'create',
					id: transactionData.id,
					name: transactionData.name,
					length: transactionData.length,
					creation: transactionData.creation,
					upload: transactionData.upload,
					description: transactionData.description,
					tags: transactionData.tags,
				},
			});
			//Update progress
			dispatch({ type: 'progress/update', payload: 10 });
			dispatch({
				type: 'progress/log',
				payload: {
					type: 'green',
					value: 'Informatiile au fost ingresitrate in baza de date',
				},
			});
			//Start sending video file
			transactionData.id = response.data.id;
			storeVideo(transactionData);
		} catch (err) {
			//Update progress
			dispatch({
				type: 'progress/fail',
				payload: {
					type: 'red',
					value: 'Informatiile nu au putut fi inregistrate',
				},
			});
			dispatch({
				type: 'progress/log',
				payload: { type: 'red', value: 'Tranzactia a esuat' },
			});
		}
	}

	/**
	 *
	 * @param transactionData
	 * @param startPosition
	 */
	async function sendVideoInChunks(
		transactionData: TransactionData,
		startPosition: number,
	): Promise<void> {
		let finished = false;
		const bytesToRead = 1000 * 100;
		const chunk = await readChunk(transactionData.pathVideo, {
			length: bytesToRead,
			startPosition: startPosition,
		});
		let packet = '';
		//Copy data from buffer to string latin1 encoded
		for (let i = 0; i < chunk.length; i++) {
			packet += String.fromCharCode(chunk[i]);
		}
		//Increment to next position
		startPosition += bytesToRead;
		//Check if we sent all chunks
		if (packet.length === 0) {
			finished = true;
		} else {
			/*Do nothing*/
		}
		if (isAborted == false) {
			//Send video file in chunks
			axios({
				method: 'post',
				url: 'http://127.0.0.1:3000/api/admin/videos',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${transactionToken}`,
				},
				data: {
					action: 'upload',
					id: transactionData.id,
					packet: packet,
					finished: finished,
				},
			})
				.then(async (response) => {
					//Continue to send next chunk
					if (response.status === 200) {
						//Exit if user aborted transaction
						sentRequests++;
						// console.log(`sent requests counter: ${sentRequests}`)
						//Verify progress
						if (sentRequests >= responsesProgress) {
							sentRequests = 0;
							progress += 1;
							// props.updateProgress(progress);
							dispatch({
								type: 'progress/update',
								payload: progress,
							});
						}
						//Send next chunk
						sendVideoInChunks(transactionData, startPosition);
					}
					//Resource created -> send thumbnail
					else if (response.status === 201) {
						//Update progress and prepare to send thumbnail
						dispatch({
							type: 'progress/log',
							payload: {
								type: 'green',
								value: 'Fisierul video a fost incarcat cu succes',
							},
						});
						storeThumbnail(transactionData);
					}
					//Something went wrong
					else {
						setErrorLog(response.status);
					}
				})
				.catch((err) => {
					setErrorLog(err.response.status);
				});
		} else if (isAborted == true) {
			//Abort transaction
			axios({
				method: 'delete',
				url: 'http://127.0.0.1:3000/api/admin/videos',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${transactionToken}`,
				},
				data: {
					action: 'delete',
					id: transactionData.id,
					packet: '',
					finished: finished,
				},
			});
		}
	}

	/**
	 *	@function browseFile
	 */
	function browseFile(): void {
		// let dialog: Dialog
		electron.remote.dialog
			.showOpenDialog({
				properties: ['openFile'],
				filters: [
					{
						name: 'Movies',
						extensions: ['mov', 'mkv', 'avi', 'mp4'],
					},
				],
			})
			.then((path) => {
				if (path.canceled === true) {
					setFilePath('');
				} else {
					setFilePath(String(path.filePaths));
				}
			})
			.catch(() => {
				setFilePath('');
			});
	}

	/**
	 * @function
	 */
	function browseThumbnail(): void {
		// let dialog: Dialog
		electron.remote.dialog
			.showOpenDialog({
				properties: ['openFile'],
				filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
			})
			.then((path) => {
				if (path.canceled === true) {
					setThmbPath('');
				} else {
					setThmbPath(String(path.filePaths));
				}
			})
			.catch(() => {
				setThmbPath('');
			});
	}

	return (
		<Form
			noValidate
			className="UploadFormContainerr"
			onSubmit={handleSubmit}
		>
			<div className="Form">
				{createPathElements()}
				<Row className={'IRow'}>
					<Col className="ColInfo">
						<div className="Section SectionInput">
							<InputGroup
								className="InputInfoGroup"
								hasValidation
							>
								<InputGroup.Text className="Label">
									Nume
								</InputGroup.Text>
								<FormControl
									className="InputText"
									required
									value={name}
									// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
									onChange={(event) =>
										setName(event.target.value)
									}
								/>
							</InputGroup>
							<p className="InvalidField">{nameInvalid}</p>
						</div>
						{props.type === 'upload' && (
							<div className="Section SectionInput">
								<InputGroup
									className="InputInfoGroup"
									hasValidation
								>
									<InputGroup.Text className="LabelDate">
										Data creare
									</InputGroup.Text>
									<FormControl
										className="InputText"
										placeholder="dd/mm/yyyy"
										required
									/>
								</InputGroup>
								<p className="InvalidField">{crDateInvalid}</p>
							</div>
						)}
					</Col>
					{props.type === 'upload' && (
						<Col className="ColInfo">
							<div className="Section SectionInput">
								<InputGroup
									className="InputInfoGroup"
									hasValidation
								>
									<InputGroup.Text className="Label">
										Lungime
									</InputGroup.Text>
									<FormControl
										className="InputText"
										placeholder="hh:mm:ss"
										required
									/>
								</InputGroup>
								<p className="InvalidField">{lengthInvalid}</p>
							</div>

							<div className="Section SectionInput">
								<InputGroup
									className="InputInfoGroup"
									hasValidation
								>
									<InputGroup.Text className="LabelDate">
										Data incarcare
									</InputGroup.Text>
									<FormControl
										className="InputText"
										placeholder="dd/mm/yyyy"
										required
									/>
								</InputGroup>
								<p className="InvalidField">{upDateInvalid}</p>
							</div>
						</Col>
					)}
				</Row>

				<Row className={'IRow'}>
					<Col className="ColPath">
						<InputGroup className="InputTagDescGroup">
							<InputGroup.Text className="LabelArea">
								Tags
							</InputGroup.Text>
							<FormControl
								className="InputArea"
								as="textarea"
								placeholder="#tag1 #tag2 #tag3"
								value={tags}
								// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
								onChange={(event) =>
									setTags(event.target.value)
								}
							/>
						</InputGroup>
					</Col>
				</Row>
				<Row className={'IRow LastRow'}>
					<Col className="ColDesc">
						<InputGroup hasValidation className="InputTagDescGroup">
							<InputGroup.Text className="LabelArea">
								Descriere
							</InputGroup.Text>
							<FormControl
								className="InputArea"
								as="textarea"
								required
								value={desc}
								// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
								onChange={(event) =>
									setDesc(event.target.value)
								}
							/>
						</InputGroup>
						<p className="InvalidField">{descInvalid}</p>
					</Col>
				</Row>
			</div>
			<div className="BtnSection">
				<Button type="submit" className="UploadBtn">
					Upload
				</Button>
			</div>
		</Form>
	);
};