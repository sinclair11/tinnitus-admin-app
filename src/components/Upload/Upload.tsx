import React, { useState } from 'react';
import { Icons } from '@src/utils/icons';
import { modalStyle } from '../../styles/styles';
import Modal from 'react-modal';
import { UploadForm } from '../modal-upload/modal-upload';
import { ProgressbarUpload } from '@src/components/progressbar/progressbar-upload';

type UploadModalProps = {
	modalIsOpen: boolean;
	setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setDone?: React.Dispatch<React.SetStateAction<boolean>>;
	type: string;
};

export const UploadVideoModal: React.FC<UploadModalProps> = (
	props: UploadModalProps,
) => {
	const [progressOpen, setProgressOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [messages, setMessages] = useState([]);
	const [variant, setVariant] = useState('success');

	function closeModal(): void {
		props.setModalIsOpen(false);
	}

	return (
		<div>
			<Modal
				isOpen={props.modalIsOpen}
				style={modalStyle(props.type)}
				contentLabel="Upload"
				ariaHideApp={false}
			>
				<div className="UploadFormContainer">
					<UploadForm
						formModal={props.setModalIsOpen}
						progressModal={setProgressOpen}
						updateProgress={setProgress}
						updateConsoleLog={setMessages}
						setVariant={setVariant}
						type={props.type}
						rowClass={
							props.type === 'upload' ? 'UploadType' : 'EditType'
						}
					/>
				</div>

				<p className="ModalTitle">
					{props.type === 'upload' ? 'Upload' : 'Edit'}
				</p>
				<img
					src={Icons['CancelIcon']}
					className="CancelIcon"
					onClick={closeModal}
				/>
			</Modal>
			<ProgressbarUpload
				isOpen={progressOpen}
				setOpen={setProgressOpen}
				progress={progress}
				messages={messages}
				updateConsoleLog={setMessages}
				updateProgress={setProgress}
				variant={variant}
				updateVariant={setVariant}
			/>
		</div>
	);
};
