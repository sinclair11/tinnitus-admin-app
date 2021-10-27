import React from 'react';
import Modal from 'react-modal';
import { dialogStyles } from '@src/styles/styles';
import { Button } from 'react-bootstrap';
import { Icons } from '@utils/icons';

type DialogProps = {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	message: string;
};

export const Dialog: React.FC<DialogProps> = (props: DialogProps) => {
	return (
		<Modal style={dialogStyles} isOpen={props.isOpen} ariaHideApp={false}>
			<div className="DialogHeader">
				<p style={{ margin: '4px' }}>Message</p>
			</div>
			<p style={{ marginLeft: '10px' }}>{props.message}</p>
			<Button
				className="BtnOk"
				onClick={(): void => props.setIsOpen(false)}
			>
				OK
			</Button>
			<img
				src={Icons['CancelIcon']}
				className="CancelIcon"
				onClick={(): void => props.setIsOpen(false)}
			/>
		</Modal>
	);
};
