/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import './modalupload.css'
import {
	InputGroup,
	FormControl,
	Button,
	Row,
	Col,
	Form,
} from 'react-bootstrap'
import electron, { ipcRenderer } from 'electron'
import { ResponseCodes } from '../../utils/utils'
import axios from 'axios'
import fs from 'fs'
import { readChunk } from 'read-chunk'
import crypto from 'crypto'

let isAborted = false

export function setAbort(value: boolean): void {
	isAborted = value
}

type TransactionData = {
	id: string
	pathVideo: string
	pathThumbnail: string
	name: string
	length: number
	creation: string
	upload: string
	description: string
	tags: string
}

type UploadProps = {
	formModal?: React.Dispatch<React.SetStateAction<boolean>>
	progressModal?: React.Dispatch<React.SetStateAction<boolean>>
	updateConsoleLog?: React.Dispatch<
		React.SetStateAction<Array<{ type: string; value: unknown }>>
	>
	updateProgress?: React.Dispatch<React.SetStateAction<number>>
	setVariant?: React.Dispatch<React.SetStateAction<string>>
}

export const UploadForm: React.FC<UploadProps> = (props?: UploadProps) => {
	const [filePath, setFilePath] = useState('')
	const [thmbPath, setThmbPath] = useState('')
	const [filePathInvalid, setFilePathInvalid] = useState('')
	const [thmbPathInvalid, setThmbPathInvalid] = useState('')
	const [nameInvalid, setNameInvalid] = useState('')
	const [lengthInvalid, setLengthInvalid] = useState('')
	const [crDateInvalid, setCrDateInvalid] = useState('')
	const [upDateInvalid, setUpDateInvalid] = useState('')
	const [descInvalid, setDescInvalid] = useState('')

	const fieldEmpty = 'Acest camp este obligatoriu'
	const formatInvalid = 'Formatul acestui camp este invalid'
	const pathInvalid =
		'Calea catre fisier este invalida sau fisierul nu exista'
	let transactionToken = ''

	let progress = 0
	let responsesProgress = 0
	let sentRequests = 0

	function verifyEmptyInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result.value++
		} else {
			setState('')
		}
	}

	function verifyDateInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result.value++
		} else if (
			!value.match(
				/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/g,
			)
		) {
			setState(formatInvalid)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result.value++
		} else {
			setState('')
		}
	}

	function verifyLengthInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty)
			result++
		} else if (
			!value.match(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/)
		) {
			setState(formatInvalid)
			result.value++
		} else {
			setState('')
		}
	}

	function verifyPathInput(
		value: string,
		setState: React.Dispatch<React.SetStateAction<unknown>>,
		result: any,
	): void {
		if (value === '') {
			setState(fieldEmpty)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result++
		} else if (!fs.existsSync(value)) {
			setState(pathInvalid)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			result.value++
		} else {
			setState('')
		}
	}

	async function handleSubmit(event: any): Promise<void> {
		// eslint-disable-next-line prefer-const
		let failedCounter = {
			value: 0,
		}
		event.preventDefault()
		isAborted = false

		verifyPathInput(
			event.target[0].value,
			setFilePathInvalid,
			failedCounter,
		)
		verifyPathInput(
			event.target[2].value,
			setThmbPathInvalid,
			failedCounter,
		)
		verifyEmptyInput(event.target[4].value, setNameInvalid, failedCounter)
		verifyLengthInput(
			event.target[6].value,
			setLengthInvalid,
			failedCounter,
		)
		verifyDateInput(event.target[5].value, setCrDateInvalid, failedCounter)
		verifyDateInput(event.target[7].value, setUpDateInvalid, failedCounter)
		verifyEmptyInput(event.target[9].value, setDescInvalid, failedCounter)

		//Check if all inputs are valid
		if (failedCounter.value == 0) {
			//Hide form and show progress bar
			props.formModal(false)
			props.progressModal(true)
			//First get authorization permission
			try {
				const secret = fs
					.readFileSync(
						ipcRenderer.sendSync('eventFromRenderer') +
							'/.sdjkvneriuhweiubkdshbcvds',
					)
					.toString('utf-8')
				//Request authorization from server
				const authorizationResonse = await axios({
					method: 'post',
					url: 'http://127.0.0.1:3000/api/admin/auth',
					headers: {
						'Content-Type': 'application/json',
					},
					data: {
						phase: secret,
					},
				})
				const status = authorizationResonse.status
				// console.log(authorizationResonse)

				if (status === 200) {
					//First step completed
					// console.log('Procesul de autorizare a reusit')
					//Authorization completed -> update progress
					progress += 5
					props.updateProgress(progress)
					props.updateConsoleLog((arr) => [
						...arr,
						{ type: 'blue', value: 'Tranzactia a fost autorizata' },
					])
					transactionToken =
						authorizationResonse.data.toString('utf-8')
					//Generate unique id
					const resourceId = crypto
						.createHash('sha256')
						.update(event.target[4].value)
						.digest('hex')
					//Create an instance with transaction data
					const transactionData = {
						id: resourceId,
						pathVideo: event.target[0].value,
						pathThumbnail: event.target[2].value,
						name: event.target[4].value,
						length: event.target[6].value,
						creation: event.target[5].value,
						upload: event.target[7].value,
						description: event.target[9].value,
						tags: event.target[8].value,
					}
					//Try sending the video
					storeVideo(transactionData)
				} else {
					setErrorLog(status)
				}
			} catch (error) {
				//Problem sending authorization request or received response
				// console.error(error);
				const status = error.response.status
				if (status === 401) {
					props.setVariant('danger')
					props.updateProgress(100)
					props.updateConsoleLog((arr) => [
						...arr,
						{
							type: 'red',
							value: 'Tranzactia nu a fost autorizata',
						},
					])
				} else {
					setErrorLog(error.response.status)
				}
			}
		} else {
			//At least one input is invalid
		}
	}

	function setErrorLog(status: number): void {
		props.setVariant('danger')
		props.updateProgress(100)
		props.updateConsoleLog((arr) => [
			...arr,
			{ type: 'red', value: ResponseCodes.get(status) },
		])
	}

	function storeVideo(transactionData: TransactionData): void {
		//First register asset and create path
		axios({
			method: 'post',
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
				const fd = fs.openSync(transactionData.pathVideo, 'r')
				//Round number of requests per size
				const totalRequests = Math.round(
					fs.statSync(transactionData.pathVideo).size / (1000 * 100),
				)
				responsesProgress = Math.round((totalRequests * 2) / 100)
				fs.closeSync(fd)
				//Update progress
				progress += 5
				props.updateProgress(progress)
				props.updateConsoleLog((arr) => [
					...arr,
					{ type: 'black', value: response.data },
				])
				props.updateConsoleLog((arr) => [
					...arr,
					{ type: 'black', value: 'Se incarca fisierul video...' },
				])
				//Try sending the video in chunks
				sendVideoInChunks(transactionData, 0)
			})
			.catch((error) => {
				//Could not upload vide
				props.setVariant('danger')
				props.updateProgress(100)
				props.updateConsoleLog((arr) => [
					...arr,
					{ type: 'red', value: error.response.data },
				])
			})
	}

	async function storeThumbnail(
		transactionData: TransactionData,
	): Promise<void> {
		const bytesToRead = 1000 * 100
		let done = false
		let startPosition = 0
		let finished = false

		while (done === false) {
			let packet = ''
			if (isAborted == false) {
				const chunk = await readChunk(transactionData.pathThumbnail, {
					length: bytesToRead,
					startPosition: startPosition,
				})
				for (let i = 0; i < chunk.length; i++) {
					packet += String.fromCharCode(chunk[i])
				}
				//Increment to next position
				startPosition += bytesToRead
				try {
					//Check if we sent all chunks
					if (packet.length === 0) {
						finished = true
					}
					const response = await axios({
						method: 'post',
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
					})
					if (response.status == 201) {
						//Thumbnail was stored
						props.updateProgress(90)
						props.updateConsoleLog((arr) => [
							...arr,
							{
								type: 'green',
								value: 'Coperta a fost incarcata cu succes',
							},
						])
						done = true
					}
				} catch (error) {
					props.setVariant('danger')
					props.updateProgress(100)
					props.updateConsoleLog((arr) => [
						...arr,
						{
							type: 'red',
							value: 'Coperta nu a putut fi incarcata',
						},
					])
					props.updateConsoleLog((arr) => [
						...arr,
						{ type: 'red', value: 'Tranzactie incheiata' },
					])
					break
				}
			} else {
				//Update progress
				props.setVariant('danger')
				props.updateProgress(100)
				props.updateConsoleLog((arr) => [
					...arr,
					{ type: 'red', value: 'Tranzactia a fost intrerupta' },
				])
				//Abort transaction
				axios({
					method: 'post',
					url: 'http://127.0.0.1:3000/api/admin/videos/thumbnail',
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
				})
				break
			}
		}
		//Store resource info in firebase
		if (done === true) {
			storeInfoInDb(transactionData)
		}
	}

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
			})
			if (response.status === 200) {
				props.updateProgress(100)
				props.updateConsoleLog((arr) => [
					...arr,
					{
						type: 'green',
						value: 'Informatiile au fost ingresitrate in baza de date',
					},
				])
			}
		} catch (err) {
			//Update progress
			props.setVariant('danger')
			props.updateProgress(100)
			props.updateConsoleLog((arr) => [
				...arr,
				{
					type: 'red',
					value: 'Informatiile nu au putut fi inregistrare',
				},
			])
			props.updateConsoleLog((arr) => [
				...arr,
				{ type: 'red', value: 'Tranzactia a esuat' },
			])
		}
	}

	async function sendVideoInChunks(
		transactionData: TransactionData,
		startPosition: number,
	): Promise<void> {
		let finished = false
		const bytesToRead = 1000 * 100
		const chunk = await readChunk(transactionData.pathVideo, {
			length: bytesToRead,
			startPosition: startPosition,
		})
		let packet = ''
		//Copy data from buffer to string latin1 encoded
		for (let i = 0; i < chunk.length; i++) {
			packet += String.fromCharCode(chunk[i])
		}
		//Increment to next position
		startPosition += bytesToRead
		//Check if we sent all chunks
		if (packet.length === 0) {
			finished = true
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
						sentRequests++
						// console.log(`sent requests counter: ${sentRequests}`)
						//Verify progress
						if (sentRequests >= responsesProgress) {
							sentRequests = 0
							progress += 1
							props.updateProgress(progress)
						}
						//Send next chunk
						sendVideoInChunks(transactionData, startPosition)
					}
					//Resource created -> send thumbnail
					else if (response.status === 201) {
						//Update progress and prepare to send thumbnail
						props.updateProgress(60)
						props.updateConsoleLog((arr) => [
							...arr,
							{
								type: 'green',
								value: 'Fisierul video a fost incarcat cu succes',
							},
						])
						storeThumbnail(transactionData)
					}
					//Something went wrong
					else {
						setErrorLog(response.status)
					}
				})
				.catch((err) => {
					setErrorLog(err.response.status)
				})
		} else if (isAborted == true) {
			//Update progress
			props.setVariant('danger')
			props.updateProgress(100)
			props.updateConsoleLog((arr) => [
				...arr,
				{ type: 'red', value: 'Tranzactia a fost intrerupta' },
			])
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
			})
		}
	}

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
					setFilePath('')
				} else {
					setFilePath(String(path.filePaths))
				}
			})
			.catch(() => {
				setFilePath('')
			})
	}

	function browseThumbnail(): void {
		// let dialog: Dialog
		electron.remote.dialog
			.showOpenDialog({
				properties: ['openFile'],
				filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
			})
			.then((path) => {
				if (path.canceled === true) {
					setThmbPath('')
				} else {
					setThmbPath(String(path.filePaths))
				}
			})
			.catch(() => {
				setThmbPath('')
			})
	}

	return (
		<Form
			noValidate
			className="UploadFormContainerr"
			onSubmit={handleSubmit}
		>
			<div className="InputSection" style={{ marginTop: '15px' }}>
				<InputGroup className="InputGroupPath" hasValidation>
					<InputGroup.Text className="InputLabel">
						Fisier
					</InputGroup.Text>
					<FormControl
						required
						className="InputText"
						style={{ width: '75%' }}
						value={filePath}
						// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
				<InputGroup className="InputGroupPath" hasValidation>
					<InputGroup.Text className="InputLabel">
						Coperta
					</InputGroup.Text>
					<FormControl
						className="InputText"
						style={{ width: '72%' }}
						value={thmbPath}
						// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
								<InputGroup.Text className="InputLabel">
									Nume
								</InputGroup.Text>
								<FormControl className="InputText" required />
							</InputGroup>
							<p className="InvalidField">{nameInvalid}</p>
						</div>

						<div className="InputSection" style={{ height: '45%' }}>
							<InputGroup
								className="InputInfoGroup"
								hasValidation
							>
								<InputGroup.Text
									className="InputLabel"
									style={{ width: '80px' }}
								>
									Data creare
								</InputGroup.Text>
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
						<div className="InputSection" style={{ height: '50%' }}>
							<InputGroup
								className="InputInfoGroup"
								hasValidation
							>
								<InputGroup.Text className="InputLabel">
									Lungime
								</InputGroup.Text>
								<FormControl
									className="InputText"
									style={{ width: '70%' }}
									placeholder="hh:mm:ss"
									// value={length}
									// onChange={(e: any) => verifyInputLength(e.target.value)}
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
								<InputGroup.Text
									className="InputLabel"
									style={{ width: '95px' }}
								>
									Data incarcare
								</InputGroup.Text>
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
							<InputGroup.Text
								className="InputLabel"
								style={{ width: '99%', marginLeft: '-1px' }}
							>
								Tags
							</InputGroup.Text>
							<FormControl
								className="InputArea"
								as="textarea"
								placeholder="#tag1 #tag2 #tag3"
							/>
						</InputGroup>
					</Col>
					<Col className="InfoCol" style={{ padding: '0px' }}>
						<InputGroup
							hasValidation
							className="InputTagDescGroup"
							style={{ width: '90%' }}
						>
							<InputGroup.Text
								className="InputLabel"
								style={{ width: '99%', marginLeft: '-1px' }}
							>
								Descriere
							</InputGroup.Text>
							<FormControl
								className="InputArea"
								as="textarea"
								required
							/>
						</InputGroup>
						<p
							className="InvalidField"
							style={{ marginLeft: '10px', marginTop: '-10px' }}
						>
							{descInvalid}
						</p>
					</Col>
				</Row>
			</div>
			<Button type="submit" className="UploadBtn">
				Upload
			</Button>
		</Form>
	)
}
