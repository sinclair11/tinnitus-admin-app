import React, { useEffect, useState } from 'react';
import { ToolbarIcons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import { UploadVideoModal } from '@components/upload/Upload';
import { store } from '@store/store';
import { getAuth, ResponseCodes } from '@src/utils/utils';
import axios from 'axios';
import Modal from 'react-modal';
import { MessageBox } from '../messagebox/messagebox';
import { DialogBox } from '../dialogbox/dialogbox';
import { dialogStyles, hourglassStyle } from '@src/styles/styles';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';

type ToolbarProps = {
	container?: string;
};

export const Toolbar: React.FC<ToolbarProps> = (props?: ToolbarProps) => {
	const [modalIsOpen, setIsOpen] = useState(false);
	const [modalType, setModalType] = useState('');
	const [editData, setEditData] = useState({
		name: '',
		tags: '',
		description: '',
	});
	const [messageOpen, setMessageOpen] = useState(false);
	const [messageboxMsg, setMessageboxMsg] = useState('');
	const [loading, setLoading] = useState(false);
	const [dialogbox, setDialogbox] = useState(false);
	const [accept, setAccept] = useState(false);
	const dispatch = useDispatch();
	const selected = useSelector<CombinedStates>(
		(state) => state.resdataReducer.selected,
	) as string;

	useEffect(() => {
		if (accept == true) {
			requestResourceDeletion();
			//Reset action accept state
			setAccept(false);
		}
	}, [accept]);

	async function openModal(type: string): Promise<void> {
		if (type === 'edit') {
			//Check if there is a resource selected
			if (store.getState().resdataReducer.selected !== '') {
				try {
					//Activate loading screen
					setLoading(true);
					//First get the phase
					//Get info about resource from database
					const response = await axios({
						method: 'get',
						url: `http://127.0.0.1:3000/api/admin/videos/infodb/general?id=${
							store.getState().resdataReducer.selected
						}`,
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${await getAuth()}`,
						},
					});
					//Set received editable data
					setEditData({
						name: response.data.name,
						tags: response.data.tags,
						description: response.data.description,
					});
					//Close loading screen
					setLoading(false);
					//Open edit modal and pass editable data of this resource
					setModalType(type);
					setIsOpen(true);
				} catch (error) {
					//Close loading screen
					setLoading(false);
					//Info could not be retrieved from database
					const message = ResponseCodes.get(error.response.status);
					//Notify user about occured error
					setMessageboxMsg(message);
					setMessageOpen(true);
				}
			} else {
				//Notify user that he must select a resource first
				setMessageboxMsg('Selectati o resursa intai!');
				setMessageOpen(true);
			}
		} else if (type === 'upload') {
			//Make sure editable data is clean
			setEditData({
				name: '',
				tags: '',
				description: '',
			});
			//Just open the upload modal
			setModalType(type);
			setIsOpen(true);
		}
	}

	/**
	 *
	 */
	async function requestResourceDeletion(): Promise<void> {
		//Activate loading screen
		setLoading(true);
		try {
			//Request deletion of resource
			await axios({
				method: 'delete',
				url: `http://127.0.0.1:3000/api/admin/videos?id=${
					store.getState().resdataReducer.selected
				}`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${await getAuth()}`,
				},
			});
			//Reset selected resource state
			dispatch({ type: 'resdata/selected', payload: '' });
			//Close loading screen
			setLoading(false);
		} catch (error) {
			//Close loading screen
			setLoading(false);
			//Retrieve message for corresponding status code
			const message = ResponseCodes.get(error.response.status);
			//Set message and notify user about occured error
			setMessageboxMsg(message);
			setMessageOpen(true);
		}
	}

	function onRequestDeleteClick(): void {
		//First check if a resource was selected
		if (store.getState().resdataReducer.selected != '') {
			setDialogbox(true);
		} else {
			//Notify user that he must select a resource first
			setMessageboxMsg('Selectati o resursa intai!');
			setMessageOpen(true);
		}
	}

	return (
		<div className={props.container + ' ToolbarContainer '}>
			<ReactTooltip
				place="top"
				type="dark"
				effect="float"
				delayShow={500}
			/>
			<div className="TitleDiv">
				<p className="TitleSelected">{selected}</p>
			</div>
			<img
				data-tip="Incarca"
				src={ToolbarIcons['UploadIcon']}
				className="ActionIcon"
				onClick={(): Promise<void> => openModal('upload')}
			/>
			<img
				data-tip="Editeaza"
				src={ToolbarIcons['EditIcon']}
				className="ActionIcon"
				onClick={(): Promise<void> => openModal('edit')}
			/>
			<img
				data-tip="Sterge"
				src={ToolbarIcons['DeleteIcon']}
				className="ActionIcon"
				onClick={onRequestDeleteClick}
			/>
			<UploadVideoModal
				modalIsOpen={modalIsOpen}
				setModalIsOpen={setIsOpen}
				type={modalType}
				editable={editData}
			/>
			<Modal
				isOpen={messageOpen}
				style={dialogStyles}
				contentLabel="Upload"
				ariaHideApp={false}
			>
				<MessageBox
					setIsOpen={setMessageOpen}
					message={messageboxMsg}
				/>
			</Modal>
			<Modal
				isOpen={dialogbox}
				style={dialogStyles}
				contentLabel="Dialog box"
				ariaHideApp={false}
			>
				<DialogBox
					setIsOpen={setDialogbox}
					message="Esti sigur ca vrei sa stergi aceasta resursa?"
					setAccepted={setAccept}
				/>
			</Modal>
			<Modal isOpen={loading} style={hourglassStyle} ariaHideApp={false}>
				<div className="hourglass"></div>
			</Modal>
		</div>
	);
};
