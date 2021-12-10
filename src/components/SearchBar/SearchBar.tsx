import React, { useEffect, useState } from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import axios from 'axios';
import { ResponseCodes } from '@utils/utils';
import { Icons } from '@utils/icons';
import { ipcRenderer } from 'electron';
import { dialogStyles, hourglassStyle, tableStyles } from '@src/styles/styles';
import Modal from 'react-modal';
import { MessageBox } from '@src/components/messagebox/messagebox';
import { Reslist } from '@components/reslist/reslist';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';

type SearchProps = {
	type: string;
};

export const SearchBar: React.FC<SearchProps> = (props: SearchProps) => {
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
	//Selected resource
	const [selected, setSelected] = useState('');
	//Redux
	const dispatch = useDispatch();
	const selectedRes = useSelector<CombinedStates>(
		(state) => state.resdataReducer.selected,
	) as string;

	//* Use effect to change or reset searchbar value
	useEffect(() => {
		//Reset searchbar value if no resourse is selected
		if (selectedRes === '') {
			setSearchVal('');
		} else {
			setSearchVal(selectedRes);
		}
	}, [selectedRes]);

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
			{ name: 'Data upload', value: dataInfo['upload'] },
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
		//* Store resource general information in redux
		dispatch({ type: 'resdata/info', payload: arrInfo });
		//* Store resource usage ingormation in redux
		dispatch({ type: 'resdata/usage', payload: arrUsage });
		//* Store general information as raw data in redux
		dispatch({ type: 'resdata/infodata', payload: dataInfo });
		//* Store name of selected resource
		dispatch({
			type: 'resdata/selected',
			payload: searchVal,
		});
	}

	/**
	 * @callback    getResourceData
	 * @description Callback function which aquires resource general and usage information
	 */
	async function getResourceData(): Promise<void> {
		//Token
		const secret = ipcRenderer.sendSync('eventReadJwt');
		let dataInfo = [];
		let dataUsage = [];

		//Show loading modal
		setIsOpen(true);
		//Get general information about resource
		try {
			const response = await axios({
				method: 'get',
				url: `http://127.0.0.1:3000/api/admin/${props.type}/infodb/general?id=${searchVal}`,
				headers: {
					Authorization: `Bearer ${secret}`,
				},
			});
			if (response.status === 200) {
				//Update information about resource
				dataInfo = response.data;
				//Store in redux selected resource
				//Get usage information about resource
				try {
					let response = await axios({
						method: 'get',
						url: `http://127.0.0.1:3000/api/admin/${props.type}/infodb/usage?id=${searchVal}`,
						headers: {
							Authorization: `Bearer ${secret}`,
						},
					});
					if (response.status === 200) {
						//Update usage about resource
						dataUsage = response.data;
						//Update view with info from firestore
						updateInfoData(dataInfo, dataUsage);
						//Get image thumbnail
						response = await axios({
							method: 'get',
							url: `http://127.0.0.1:3000/api/admin/${props.type}/thumbnail?id=${searchVal}`,
						});
						console.log(response);
						//Update thumbnail image
						dispatch({
							type: 'resdata/thumbnail',
							payload: response.data,
						});
						setIsOpen(false);
					}
				} catch (err) {
					let message: string;
					if (err.response === undefined) {
						message = err.message;
					} else {
						message = ResponseCodes.get(err.response.status);
					}
					//Notify user about error
					setMessage(message);
					//Hide loading screen
					setIsOpen(false);
					//Show dialog with error message
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

	/**
	 * @callback
	 * @description
	 */
	async function getListOfResources(): Promise<void> {
		const secret = ipcRenderer.sendSync('eventReadJwt');
		//Show loading modal
		setIsOpen(true);
		//Get a list with all uploaded videos
		try {
			const response = await axios({
				method: 'get',
				url: `http://127.0.0.1:3000/api/admin/${props.type}/infodb/list`,
				headers: {
					Authorization: `Bearer ${secret}`,
				},
			});
			//Get all required data [name, thumbnail, creation date, upload date]
			const files = response.data.files;
			//Total number of entries
			const length = files.length;
			//Data containing the records name and upload date
			for (let i = 0; i < length; i++) {
				setTableElements((arr) => [
					...arr,
					{
						name: files[i].name,
						data: {
							thumb: files[i].thumbnail,
							creation: files[i].creation,
							upload: files[i].upload,
						},
					},
				]);
			}
			//Hide loading screen
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
			//Notify user about error
			setMessage(message);
			//Hide loading screen
			setIsOpen(false);
			//Show dialog message with error
			setDialogOpen(true);
		}
	}

	/**
	 *
	 */
	function clearListModal(): void {
		setTableOpen(false);
		setTableElements([]);
	}

	/**
	 *
	 */
	function closeListView(): void {
		clearListModal();
	}

	/**
	 *
	 */
	function cancelList(): void {
		clearListModal();
	}

	/**
	 *
	 */
	function okList(): void {
		clearListModal();
		setSearchVal(selected);
	}

	return (
		<InputGroup className="SearchGroup">
			<FormControl
				placeholder={`Nume ${props.type}...`}
				aria-label={`Nume ${props.type}`}
				aria-describedby="basic-addon2"
				className="SearchBar"
				value={searchVal}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onChange={(e: any): void => setSearchVal(e.target.value)}
			/>
			<Button
				// data-tip="Cauta"
				className="SearchButton"
				onClick={getResourceData}
			>
				<img src={Icons['MagnifierIcon']} className="SearchIcon"></img>
			</Button>
			<Button
				// data-tip="Lista video"
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
				<MessageBox setIsOpen={setDialogOpen} message={message} />
			</Modal>
			<Modal style={tableStyles} isOpen={tableOpen} ariaHideApp={false}>
				<Reslist entries={tableElements} selectFromList={setSelected} />
				<p className="ModalTitle">Lista {props.type}</p>
				<img
					src={Icons['CancelIcon']}
					className="CancelIcon"
					onClick={closeListView}
				/>
				<Button className="ListOk" onClick={okList}>
					OK
				</Button>
				<Button className="ListCancel" onClick={cancelList}>
					Cancel
				</Button>
			</Modal>
		</InputGroup>
	);
};
