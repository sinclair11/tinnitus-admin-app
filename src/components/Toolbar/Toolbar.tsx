import React, { useState } from 'react';
import { ToolbarIcons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import { UploadVideoModal } from '@components/upload/Upload';

type ToolbarProps = {
	container: string;
};

export const Toolbar: React.FC<ToolbarProps> = (props?: ToolbarProps) => {
	const [modalIsOpen, setIsOpen] = useState(false);
	const [modalType, setModalType] = useState('');
	const [editData, setEditData] = useState({});

	async function openModal(type: string): Promise<void> {
		if (type === 'edit') {
			// try {
			// 	//First get the phase
			// 	//Get info about resource from database
			// 	axios({
			// 		method: 'get',
			// 		url: 'http://127.0.0.1:3000/api/admin/auth',
			// 		headers: {
			// 			'Content-Type': 'application/json',
			// 			Authorization: `Bearer ${transactionToken}`,
			// 		},
			// 	});
			// } catch (error) {
			// 	//Info could not be retrieved from database
			// 	const message = ResponseCodes.get(error.response.statusCode);
			// }
		}
		setModalType(type);
		setIsOpen(true);
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
			/>
		</div>
	);
};
