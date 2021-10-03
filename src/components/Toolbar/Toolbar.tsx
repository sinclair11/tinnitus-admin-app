import React, { useState } from 'react';
import { ToolbarIcons } from '../../utils/icons';
import ReactTooltip from 'react-tooltip';
import { UploadVideoModal } from '../upload/upload';

type ToolbarProps = {
	container: string;
};

export const Toolbar: React.FC<ToolbarProps> = (props?: ToolbarProps) => {
	const [modalIsOpen, setIsOpen] = useState(false);
	const [modalType, setModalType] = useState('');

	function openModal(type: string): void {
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
				onClick={(): void => openModal('upload')}
			/>
			<img
				data-tip="Editeaza"
				src={ToolbarIcons['EditIcon']}
				className="ActionIcon"
				onClick={(): void => openModal('edit')}
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
