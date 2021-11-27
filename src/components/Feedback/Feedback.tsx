import React, { useEffect, useState } from 'react';
import { Icons, ToolbarIcons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap';
import { CombinedStates } from '@src/store/reducers/custom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getAuth, ResponseCodes } from '@src/utils/utils';
import { MessageBox } from '../messagebox/messagebox';
import { DialogBox } from '../dialogbox/dialogbox';
import { dialogStyles } from '@src/styles/styles';

type FeedbackProps = {
	type: string;
};

type FeedbackItemProps = {
	data: FeedbackData;
	onDelete: any;
};

type FeedbackData = {
	id?: string;
	email: string;
	comment: string;
	date: string;
};

export const Feedback: React.FC<FeedbackProps> = (props: FeedbackProps) => {
	const selected = useSelector<CombinedStates>(
		(state) => state.resdataReducer.selected,
	) as string;
	//Map which contains all feedbacks
	const [feedbacks, setFeedbacks] = useState(new Map<string, FeedbackData>());
	const [messageOpen, setMessageOpen] = useState(false);
	const [error, setError] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [actionAccepted, setAcctionAccepted] = useState(false);
	const [id, setId] = useState('');
	const [viewMsg, setViewMsg] = useState('');

	//* Use effect to update feedbacks when a resource is selected
	useEffect(() => {
		if (selected != '') {
			buildFeedbackMap();
		} else {
			setViewMsg('Selectati o resursa intai pentru a vedea feedback-uri');
		}
	}, [selected]);

	//* Use effect to execute delete action if it was accepted
	useEffect(() => {
		if (actionAccepted === true) {
			deleteFeedback(id);
		}
	}, [actionAccepted]);

	/**
	 * @function buildFeedbackMap
	 * @param data Feedbacks received from server
	 */
	async function buildFeedbackMap(): Promise<void> {
		try {
			const secret = getAuth();
			//Request feedback data
			const response = await axios({
				method: 'get',
				timeout: 30000,
				timeoutErrorMessage: 'timeout',
				url: `http://127.0.0.1:3000/api/admin/${props.type}/feedbacks`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${secret}`,
				},
			});
			//Construct dictionary with feedbacks
			if (response.data.message === 'filled') {
				const feedbacksData = response.data.payload;
				const feedbackMap = new Map<string, FeedbackData>();
				//Dispatch received feedbacks
				for (const feedback of feedbacksData) {
					feedbackMap.set(feedback.id, {
						email: feedback.email,
						comment: feedback.comment,
						date: feedback.date,
					});
				}
				//Display feedbacks
				setFeedbacks(feedbackMap);
			} else if (response.data.message === 'empty') {
				//No feedbacks for this resource
				setFeedbacks(new Map<string, FeedbackData>());
				setViewMsg('Aceasta resursa nu are niciun feedback momentan');
			}
		} catch (error) {
			if (error.message === 'timeout') {
				//! Timeout reached
				setError('Serverul intarzie sa raspunda. Tranzactie inchisa.');
			} else {
				//! Could not retrieve feedbacks from server
				setError(ResponseCodes.get(error.response.status));
			}
			//Notify user about the error (set in message box)
			setMessageOpen(true);
			//In case of server error do not display a message on view
			setViewMsg('');
		}
	}

	/**
	 * @function deleteFeedback
	 * @param feedbackId
	 */
	async function deleteFeedback(feedbackId: string): Promise<void> {
		try {
			// TODO: Request feedback deletion
			// TODO: Refresh locally saved feedbacks map
		} catch (error) {
			if (error.message === 'timeout') {
				//! Timeout reached
				setError('Serverul intarzie sa raspunda. Tranzactie inchisa.');
			} else {
				//! Could not retrieve feedbacks from server
				setError(ResponseCodes.get(error.response.status));
			}
			//Notify user about the error (set in message box)
			setMessageOpen(true);
		}
	}

	function displayFeedbacks(): JSX.Element {
		if (selected != '') {
			if (feedbacks.size > 0) {
				return (
					<ul>
						{Object.entries(feedbacks).map((item) => {
							<li>
								<FeedbackComment></FeedbackComment>
							</li>;
						})}
					</ul>
				);
			} else {
				return <p className="NoFeedbacks">{viewMsg}</p>;
			}
		} else {
			return <p className="NoFeedbacks">{viewMsg}</p>;
		}
	}

	return (
		<div className="FbContainer">
			{displayFeedbacks()}
			<Modal isOpen={messageOpen} style={dialogStyles}>
				<MessageBox setIsOpen={setMessageOpen} message={error} />
			</Modal>
			<Modal isOpen={dialogOpen} style={dialogStyles}>
				<DialogBox
					setIsOpen={setDialogOpen}
					message="Esti sigur ca vrei sa stergi acest feedback?"
					setAccepted={setAcctionAccepted}
				/>
			</Modal>
		</div>
	);
};

export const FeedbackComment: React.FC = () => {
	const [modalIsOpen, setIsOpen] = React.useState(false);

	const customStyles = {
		content: {
			display: 'block',
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: '#0b537c',
			top: '50%',
			left: '50%',
			right: 'auto',
			bottom: 'auto',
			marginRight: '-50%',
			transform: 'translate(-50%, -50%)',
			borderRadius: '10px',
			border: '1px solid aqua',
			padding: '0px',
		},
	};

	function closeModal(): void {
		setIsOpen(false);
	}

	return (
		<div className="Fback">
			<ReactTooltip
				place="top"
				type="dark"
				effect="float"
				delayShow={500}
			/>
			<div className="FbackHeader">
				<div style={{ display: 'flex', justifyContent: 'flex-start' }}>
					<p className="FbackMail">useremail@gmail.com </p>
					<p className="FbackDate">3 Aug 2021 </p>
				</div>
				<img
					src={ToolbarIcons['DeleteIcon']}
					className="DeleteFback"
					data-tip="Sterge comentariu"
					onClick={(): void => setIsOpen(true)}
				/>
				<Modal
					isOpen={modalIsOpen}
					style={customStyles}
					contentLabel="Example Modal"
					ariaHideApp={false}
				>
					<div className="DialogHeader">
						<p style={{ margin: '5px' }}>Message</p>
					</div>
					<div style={{ padding: '10px' }}>
						<div>
							<p
								style={{
									color: 'white',
									fontWeight: 300,
									fontSize: 16,
								}}
							>
								{' '}
								Esti sigur ca vrei sa stergi acest obiect ?
							</p>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								marginTop: '10%',
							}}
						>
							<Button onClick={closeModal} className="ModalBtn">
								OK
							</Button>
							<Button onClick={closeModal} className="ModalBtn">
								Cancel
							</Button>
						</div>
					</div>

					<img
						src={Icons['CancelIcon']}
						className="CancelIcon"
						onClick={closeModal}
					/>
				</Modal>
			</div>
			<div className="FbackTextDiv">
				<p className="FbackText">Feedback review</p>
			</div>
		</div>
	);
};
