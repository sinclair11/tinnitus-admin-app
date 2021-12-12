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
import ErrorHandler from '@src/utils/errorhandler';

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
	description: string;
	tags: string;
};

type UploadProps = {
	formModal: React.Dispatch<React.SetStateAction<boolean>>;
	type: string;
	action: string;
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

	/**
	 * @description Only for edit modal type
	 */
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
		if (props.action === 'upload') {
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
			length: event.target[5].value,
			description: event.target[7].value,
			tags: event.target[6].value,
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
			url: `http://127.0.0.1:3000/api/admin/${props.type}/infodb`,
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
				//Handle error and display message
				const result = ErrorHandler.getErrorType(error);
				dispatch({
					type: 'progress/fail',
					payload: {
						type: 'red',
						value: result,
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
			event.target[5].value,
			setLengthInvalid,
			failedCounter,
		);
		verifyEmptyInput(event.target[7].value, setDescInvalid, failedCounter);

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
		if (props.action === 'upload') {
			handleOnUpload(event);
		} else if (props.action === 'edit') {
			handleOnEdit(event);
		}
	}

	/**
	 *
	 * @param status
	 */
	function setErrorLog(message: string): void {
		dispatch({
			type: 'progress/fail',
			payload: {
				type: 'red',
				value: message,
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
			url: `http://127.0.0.1:3000/api/admin/${props.type}`,
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
					payload: {
						type: 'black',
						value: 'Se incarca fisierul video...',
					},
				});
				sendVideoInChunks(transactionData, 0);
			})
			.catch((error) => {
				//Handle error and display message
				const result = ErrorHandler.getErrorType(error);
				//Request deletion
				requestDeleteOnFail(transactionData.name);
				//Could not upload video
				dispatch({
					type: 'progress/fail',
					payload: {
						type: 'red',
						value: result,
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
					url: `http://127.0.0.1:3000/api/admin/${props.type}/thumbnail`,
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
				//Handle error and display message
				const result = ErrorHandler.getErrorType(error);
				//If operation failed then request resource deletion
				requestDeleteOnFail(transactionData.name);
				//Update console log
				dispatch({
					type: 'progress/fail',
					payload: {
						type: 'red',
						value: result,
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
		try {
			//If somehow fails then request deletion
			axios({
				method: 'delete',
				url: `http://127.0.0.1:3000/api/admin/${props.type}/thumbnail?id=${name}`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${transactionToken}`,
				},
			});
		} catch (error) {
			//Handle error and display message
			const result = ErrorHandler.getErrorType(error);
			dispatch({
				type: 'progress/log',
				payload: { type: 'red', value: result },
			});
		}
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
				url: `http://127.0.0.1:3000/api/admin/${props.type}/infodb`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${transactionToken}`,
				},
				data: {
					action: 'create',
					id: transactionData.id,
					name: transactionData.name,
					length: transactionData.length,
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
		} catch (error) {
			//Handle error and display message
			const result = ErrorHandler.getErrorType(error);
			//Update progress
			dispatch({
				type: 'progress/fail',
				payload: {
					type: 'red',
					value: result,
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
				url: `http://127.0.0.1:3000/api/admin/${props.type}`,
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
								value: `Fisierul ${props.type} a fost incarcat cu succes`,
							},
						});
						storeThumbnail(transactionData);
					}
				})
				.catch((error) => {
					//Handle error and display message
					const result = ErrorHandler.getErrorType(error);
					setErrorLog(result);
				});
		} else if (isAborted == true) {
			//Abort transaction
			axios({
				method: 'delete',
				url: `http://127.0.0.1:3000/api/admin/${props.type}`,
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
		let extensions: string[] = [];
		//Depending on resource type(audio/video) chose extensions
		if (props.type === 'video') {
			extensions = ['mov', 'mkv', 'avi', 'mp4'];
		} else if (props.type === 'audio') {
			extensions = ['mp3'];
		}
		// let dialog: Dialog
		electron.remote.dialog
			.showOpenDialog({
				properties: ['openFile'],
				filters: [
					{
						name: 'Movies',
						extensions: extensions,
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
					</Col>
					{props.action === 'upload' && (
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
