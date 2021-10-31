import React, { useEffect, useState } from 'react';
import './progressbar.css';
import Modal from 'react-modal';
import { progressStyles } from '@src/styles/styles';
import { ProgressBar, Button } from 'react-bootstrap';
import { Icons } from '@utils/icons';
import { InfoLog } from '@components/infolog/infolog';
import { setAbort } from '@components/modal-upload/modal-upload';
import { useSelector, useDispatch } from 'react-redux';
import { CombinedStates } from '@store/reducers/custom';

type ProgressProps = {
	isOpen?: boolean;
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	progress?: number;
	messages?: Array<{ type: string; value: unknown }>;
	updateConsoleLog?: React.Dispatch<
		React.SetStateAction<Array<{ type: string; value: unknown }>>
	>;
	updateProgress?: React.Dispatch<React.SetStateAction<number>>;
	variant?: string;
	updateVariant?: React.Dispatch<React.SetStateAction<string>>;
};

export const ProgressbarUpload: React.FC<ProgressProps> = (
	props: ProgressProps,
) => {
	const dispatch = useDispatch();
	const [continueOpac, setContinueOpac] = useState(0.5);
	const [abortOpac, setAbortOpac] = useState(1);
	const isOpen = useSelector<CombinedStates>(
		(state) => state.progressReducer.open,
	) as boolean;
	const progress = useSelector<CombinedStates>(
		(state) => state.progressReducer.progress,
	) as number;
	const variant = useSelector<CombinedStates>(
		(state) => state.progressReducer.variant,
	) as string;
	const log = useSelector<CombinedStates>(
		(state) => state.progressReducer.log,
	) as Array<{ type: string; value: unknown }>;
	// const abort = useSelector<CombinedStates>(
	// 	(state) => state.progressReducer.abort,
	// ) as boolean;

	useEffect(() => {
		if (progress === 100) {
			setAbortOpac(0.5);
			setContinueOpac(1);
		} else {
			setContinueOpac(0.5);
			setAbortOpac(1);
		}
	});

	function resetProgress(): void {
		dispatch({ type: 'progress/clean', payload: null });
	}

	function closeModal(): void {
		// if (progress < 100) {
		// 	abortJob();
		// }
		dispatch({ type: 'progress/open', payload: false });
	}

	function continueModal(): void {
		if (progress === 100) {
			resetProgress();
		}
		dispatch({ type: 'progress/open', payload: false });
	}

	function abortJob(): void {
		if (progress < 100) {
			setAbort(true);
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			style={progressStyles}
			contentLabel="Progressbar"
			ariaHideApp={false}
		>
			<div className="ProgressContainer">
				<ProgressBar
					variant={variant}
					className="ProgressBar"
					animated
					now={progress}
					label={`${progress}%`}
				/>
			</div>
			<InfoLog messages={log} />
			<p className="ModalTitle">Upload</p>
			<img
				src={Icons['CancelIcon']}
				className="CancelIcon"
				onClick={(): void => closeModal()}
			/>
			<Button
				className="BtnProgress"
				style={{ opacity: abortOpac }}
				onClick={abortJob}
			>
				<p className="BtnProgressTxt">Abort</p>
			</Button>
			<Button
				className="BtnProgress"
				style={{ right: '95px', opacity: continueOpac }}
				onClick={continueModal}
			>
				<p className="BtnProgressTxt">Continue</p>
			</Button>
		</Modal>
	);
};
