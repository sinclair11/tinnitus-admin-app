import React from 'react';
import { Button } from 'react-bootstrap';
import { Icons } from '@utils/icons';

type DialogProps = {
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	message: string;
};

export const Dialog: React.FC<DialogProps> = (props: DialogProps) => {
	return (
		<>
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
		</>
	);
};
