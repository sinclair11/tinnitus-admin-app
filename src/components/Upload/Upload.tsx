import React, { useState } from 'react';
import { Icons } from '@src/utils/icons';
import { modalStyle } from '@src/styles/styles';
import Modal from 'react-modal';
import { UploadForm } from '@components/modal-upload/modal-upload';
import { ProgressbarUpload } from '@components/progressbar/progressbar-upload';

type UploadModalProps = {
	modalIsOpen?: boolean;
	setModalIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	type?: string;
	editable?: { name: string; tags: string; description: string };
};

export const UploadVideoModal: React.FC<UploadModalProps> = (
	props: UploadModalProps,
) => {
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
						type={props.type}
						data={props.editable}
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
			<ProgressbarUpload />
		</div>
	);
};
