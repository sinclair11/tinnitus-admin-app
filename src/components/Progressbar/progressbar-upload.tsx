import React, { useEffect, useState } from 'react';
import './progressbar.css';
import Modal from 'react-modal';
import { progressStyles } from '@src/styles/styles';
import { ProgressBar, Button } from 'react-bootstrap';
import { Icons } from '@utils/icons';
import { InfoLog } from '@components/infolog/infolog';
import { useSelector, useDispatch } from 'react-redux';
import { CombinedStates } from '@store/reducers/custom';

export const ProgressbarUpload: React.FC = () => {
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

	useEffect(() => {
		if (progress === 100) {
			setAbortOpac(0.5);
			setContinueOpac(1);
		} else {
			setContinueOpac(0.5);
			setAbortOpac(1);
		}
	});

	/**
	 * @function deleteRes
	 */
	async function deleteRes(): Promise<any> {
		//
	}

	/**
	 * @function close
	 * @param action
	 */
	function close(action: string): void {
		switch (action) {
			case 'cancel':
				//Request server to delete unfinished resource
				if (progress < 100) {
				}
				dispatch({ type: 'progress/clean', payload: null });
				deleteRes();
				break;

			case 'abort':
				//Abort upload process and request deletion of unfinished resource
				dispatch({ type: 'progress/progress', payload: 100 });
				dispatch({ type: 'progress/variant', payload: 'danger' });
				dispatch({
					type: 'progress/log',
					payload: {
						type: 'red',
						value: 'Tranzactia a fost intrerupta',
					},
				});
				deleteRes();
				break;

			case 'continue':
				//Reset the state of progressbar component
				if (progress === 100) {
					dispatch({ type: 'progress/clean', payload: null });
				}
				break;

			default:
				break;
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
				onClick={(): void => close('cancel')}
			/>
			<Button
				className="BtnProgress"
				style={{ opacity: abortOpac }}
				onClick={(): void => close('abort')}
			>
				<p className="BtnProgressTxt">Abort</p>
			</Button>
			<Button
				className="BtnProgress"
				style={{ right: '95px', opacity: continueOpac }}
				onClick={(): void => close('continue')}
			>
				<p className="BtnProgressTxt">Continue</p>
			</Button>
		</Modal>
	);
};
