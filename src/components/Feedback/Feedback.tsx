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
import { dialogStyles, hourglassStyle } from '@src/styles/styles';

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
	const [loading, setLoading] = useState(false);

	//* Use effect to update feedbacks when a resource is selected
	useEffect(() => {
		if (selected != '') {
			buildFeedbackMap();
		} else {
			setViewMsg(
				'Selectati o resursa intai pentru a vedea feedback-uri.',
			);
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
			//Show loading screen
			setLoading(true);
			const secret = await getAuth();
			//Request feedback data
			const response = await axios({
				method: 'get',
				timeout: 30000,
				timeoutErrorMessage: 'timeout',
				url: `http://127.0.0.1:3000/api/admin/${props.type}/feedbacks?id=${selected}&month=dec&year=2021`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${secret}`,
				},
			});
			//Construct dictionary with feedbacks
			if (response.data.length > 0) {
				const feedbacksData = response.data;
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
				//Hide loading screen
				setLoading(false);
			} else {
				//No feedbacks for this resource
				setFeedbacks(new Map<string, FeedbackData>());
				setViewMsg('Aceasta resursa nu are niciun feedback momentan.');
			}
			//Hide loading screen
			setLoading(false);
		} catch (error) {
			if (error.message === 'timeout') {
				//! Timeout reached
				setError('Serverul intarzie sa raspunda. Tranzactie inchisa.');
			} else {
				//! Could not retrieve feedbacks from server
				setError(ResponseCodes.get(error.response.status));
			}
			//Hide loading screen
			setLoading(false);
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

	function onDeleteClick(id: string): void {
		//Show prompt for deletion
		setDialogOpen(true);
		//Set id of resource
		setId(id);
	}

	function displayFeedbacks(): JSX.Element {
		//* Check if a resource was selected
		if (selected != '') {
			//* Check if there are any feedbacks for this resource
			if (feedbacks.size > 0) {
				const arr = [];
				//Convert to array to use map()
				for (const [key, value] of feedbacks.entries()) {
					arr.push({ id: key, value: value });
				}
				return (
					<ul className="FeedbackList">
						{arr.map((item, index) => (
							<li key={index}>
								<FeedbackItem
									data={{
										id: item.id,
										email: item.value.email,
										comment: item.value.comment,
										date: item.value.date,
									}}
									onDelete={onDeleteClick}
								></FeedbackItem>
							</li>
						))}
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
			<Modal isOpen={loading} style={hourglassStyle} ariaHideApp={false}>
				<div className="hourglass"></div>
			</Modal>
		</div>
	);
};

export const FeedbackItem: React.FC<FeedbackItemProps> = (
	props: FeedbackItemProps,
) => {
	return (
		<div className="Fback">
			<ReactTooltip
				place="top"
				type="dark"
				effect="float"
				delayShow={1000}
			/>
			<div className="FbackHeader">
				<div style={{ display: 'flex', justifyContent: 'flex-start' }}>
					<p className="FbackMail">{props.data.email}</p>
					<p className="FbackDate">{props.data.date}</p>
				</div>
				<img
					src={ToolbarIcons['DeleteIcon']}
					className="DeleteFback"
					data-tip="Sterge comentariu"
					onClick={(): void => props.onDelete(props.data.id)}
				/>
			</div>
			<div className="FbackTextDiv">
				<p className="FbackText">{props.data.comment}</p>
			</div>
		</div>
	);
};
