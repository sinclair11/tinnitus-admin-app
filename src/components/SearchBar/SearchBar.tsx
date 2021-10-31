import React, { useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import axios from 'axios';
import crypto from 'crypto';
import { ResponseCodes } from '@utils/utils';
import { Icons } from '@utils/icons';
import { ipcRenderer } from 'electron';
import { dialogStyles, hourglassStyle, tableStyles } from '@src/styles/styles';
import Modal from 'react-modal';
import { Dialog } from '@components/dialog/dialog';
import { ResourceTable } from '@components/table/table';
import { useDispatch } from 'react-redux';

export const SearchBar: React.FC = () => {
	const [searchVal, setSearchVal] = useState('');
	//Hourglass modal state
	const [isOpen, setIsOpen] = useState(false);
	//Dialog modal state
	const [dialogOpen, setDialogOpen] = useState(false);
	//Dialog message state
	const [message, setMessage] = useState('');
	//Table resource index
	const [tableElements, setTableElements] = useState([]);
	//Table modal state
	const [tableOpen, setTableOpen] = useState(false);

	const dispatch = useDispatch();

	/**
	 * @function updateInfoData
	 * @description Internal function to update view with resource information aquired from firestore
	 * @param dataInfo General information of resource
	 * @param dataUsage Usage information of resource
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function updateInfoData(dataInfo: any, dataUsage: any): void {
		const arrInfo = [
			{ name: 'Nume', value: dataInfo['name'] },
			{ name: 'Lungime', value: dataInfo['length'] },
			{ name: 'Data creare', value: dataInfo['creation'] },
			{ name: 'Data incarcare', value: dataInfo['upload'] },
			{ name: 'Tags', value: dataInfo['tags'] },
			{ name: 'Descriere', value: dataInfo['description'] },
		];
		const arrUsage = [
			{
				name: 'Total durata vizionari',
				value: dataUsage['views_length'],
			},
			{ name: 'Total vizionari', value: dataUsage['views'] },
			{
				name: 'Durata per utilizator',
				value: dataUsage['views_per_user'],
			},
			{ name: 'Aprecieri', value: dataUsage['likes'] },
			{ name: 'Favorizari', value: dataUsage['favs'] },
			{ name: 'Feedback-uri', value: dataUsage['nr_feedback'] },
		];
		//Store resource general information in redux
		dispatch({ type: 'resdata/info', payload: arrInfo });
		//Store resource usage ingormation in redux
		dispatch({ type: 'resdata/usage', payload: arrUsage });
	}

	/**
	 * @callback    getResourceData
	 * @description Callback function which aquires resource general and usage information
	 */
	async function getResourceData(): Promise<void> {
		const secret = ipcRenderer.sendSync('eventReadJwt');
		const id = crypto
			.createHash('sha256')
			.update(searchVal)
			.digest('hex')
			.toString();
		let dataInfo = [];
		let dataUsage = [];

		//Show loading modal
		setIsOpen(true);
		//Get general information about resource
		try {
			const response = await axios({
				method: 'get',
				url: `http://127.0.0.1:3000/api/admin/videos/infodb/general?id=${id}`,
				headers: {
					Authorization: `Bearer ${secret}`,
				},
			});
			if (response.status === 200) {
				//Update information about resource
				dataInfo = response.data;
				//Store in redux selected resource
				dispatch({
					type: 'resdata/selected',
					payload: dataInfo['name'],
				});
				//Get usage information about resource
				try {
					const response = await axios({
						method: 'get',
						url: `http://127.0.0.1:3000/api/admin/videos/infodb/usage?id=${id}`,
						headers: {
							Authorization: `Bearer ${secret}`,
						},
					});
					if (response.status === 200) {
						//Update usage about resource
						dataUsage = response.data;
						//Update view with info from firestore
						updateInfoData(dataInfo, dataUsage);
						setIsOpen(false);
					}
				} catch (err) {
					let message: string;
					if (err.response === undefined) {
						message = err.message;
					} else {
						message = ResponseCodes.get(err.response.status);
					}
					/* Notify user about error */
					setMessage(message);
					setIsOpen(false);
					setDialogOpen(true);
				}
			}
		} catch (err) {
			let message: string;
			if (err.response === undefined) {
				message = err.message;
			} else {
				message = ResponseCodes.get(err.response.status);
			}
			/* Notify user about error */
			setMessage(message);
			setIsOpen(false);
			setDialogOpen(true);
		}
	}

	async function getListOfResources(): Promise<void> {
		const secret = ipcRenderer.sendSync('eventReadJwt');
		//Show loading modal
		setIsOpen(true);
		//Get a list with all uploaded videosnm
		try {
			const response = await axios({
				method: 'get',
				url: `http://127.0.0.1:3000/api/admin/videos/infodb/listofvideos`,
				headers: {
					Authorization: `Bearer ${secret}`,
				},
			});
			const names = response.data['names'];
			const dates = response.data['dates'];
			const length = names.length;
			//Data containing the records name and upload date
			for (let i = 0; i < length; i++) {
				setTableElements((arr) => [
					...arr,
					{ name: names[i], date: dates[i] },
				]);
			}
			//Hide hourglass modal
			setIsOpen(false);
			//Display table with data
			setTableOpen(true);
		} catch (err) {
			let message: string;
			if (err.response === undefined) {
				message = err.message;
			} else {
				message = ResponseCodes.get(err.response.status);
			}
			/* Notify user about error */
			setMessage(message);
			setIsOpen(false);
			setDialogOpen(true);
		}
	}

	return (
		<InputGroup className="SearchGroup">
			<FormControl
				placeholder="Nume video..."
				aria-label="Nume video"
				aria-describedby="basic-addon2"
				className="SearchBar"
				value={searchVal}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onChange={(e: any): void => setSearchVal(e.target.value)}
			/>
			<Button
				data-tip="Cauta"
				className="SearchButton"
				onClick={getResourceData}
			>
				<img src={Icons['MagnifierIcon']} className="SearchIcon"></img>
			</Button>
			<Button
				data-tip="Lista video"
				className="SearchButton"
				style={{ marginLeft: '5px' }}
				onClick={getListOfResources}
			>
				<img src={Icons['ListIcon']} className="SearchIcon"></img>
			</Button>
			<Modal isOpen={isOpen} style={hourglassStyle} ariaHideApp={false}>
				<div className="hourglass"></div>
			</Modal>
			<Modal style={dialogStyles} isOpen={dialogOpen} ariaHideApp={false}>
				<Dialog setIsOpen={setDialogOpen} message={message} />
			</Modal>
			<Modal style={tableStyles} isOpen={tableOpen} ariaHideApp={false}>
				<ResourceTable
					setIsOpen={setTableOpen}
					elements={tableElements}
					setElements={setTableElements}
				/>
			</Modal>
		</InputGroup>
	);
};
