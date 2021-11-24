import React, { useState } from 'react';
import { ToolbarIcons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import { UploadVideoModal } from '@components/upload/Upload';
import { store } from '@store/store';
import { getAuth, ResponseCodes } from '@src/utils/utils';
import axios, { AxiosError } from 'axios';
import Modal from 'react-modal';
import { Dialog } from '../dialog/Dialog';
import { dialogStyles, hourglassStyle } from '@src/styles/styles';

type ToolbarProps = {
	container: string;
};

export const Toolbar: React.FC<ToolbarProps> = (props?: ToolbarProps) => {
	const [modalIsOpen, setIsOpen] = useState(false);
	const [modalType, setModalType] = useState('');
	const [editData, setEditData] = useState({
		name: '',
		tags: '',
		description: '',
	});
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMsg, setDialogMsg] = useState('');
	const [loading, setLoading] = useState(false);

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
					console.log(response.data);
					//Open edit modal and pass editable data of this resource
					setModalType(type);
					setIsOpen(true);
				} catch (error) {
					//Close loading screen
					setLoading(false);
					//Info could not be retrieved from database
					const message = ResponseCodes.get(error.response.status);
					//Notify user about occured error
					setDialogMsg(message);
					setDialogOpen(true);
				}
			} else {
				//Notify user that he must select a resource first
				setDialogMsg('Selectati o resursa intai!');
				setDialogOpen(true);
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

	return (
		<div className={props.container + ' Container'}>
			<ReactTooltip
				place="top"
				type="dark"
				effect="float"
				delayShow={500}
			/>
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
			/>
			<UploadVideoModal
				modalIsOpen={modalIsOpen}
				setModalIsOpen={setIsOpen}
				type={modalType}
				editable={editData}
			/>
			<Modal
				isOpen={dialogOpen}
				style={dialogStyles}
				contentLabel="Upload"
				ariaHideApp={false}
			>
				<Dialog setIsOpen={setDialogOpen} message={dialogMsg} />
			</Modal>
			<Modal isOpen={loading} style={hourglassStyle} ariaHideApp={false}>
				<div className="hourglass"></div>
			</Modal>
		</div>
	);
};
