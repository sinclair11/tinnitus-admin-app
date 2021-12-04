import React, { useEffect, useRef, useState } from 'react';
import { ToolbarIcons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { CombinedStates } from '@src/store/reducers/custom';
import axios from 'axios';
import { getAuth, MonthsMap, ResponseCodes } from '@src/utils/utils';
import { MessageBox } from '../messagebox/messagebox';
import { DialogBox } from '../dialogbox/dialogbox';
import { dialogStyles, hourglassStyle } from '@src/styles/styles';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '@store/store';

type FeedbackProps = {
	type: string;
};

type FeedbackItemProps = {
	id?: string;
	data: FeedbackData;
	onDelete: unknown;
};

type FeedbackData = {
	id: string;
	email: string;
	comment: string;
	date: string;
};

type FbackToolbarProps = {
	setMessage?: any;
	showMessagebox?: any;
	setLoading?: any;
	display: any;
	type: string;
};

export const Feedback: React.FC<FeedbackProps> = (props: FeedbackProps) => {
	const selected = useSelector<CombinedStates>(
		(state) => state.resdataReducer.selected,
	) as string;
	const dispatch = useDispatch();
	//Map which contains all feedbacks
	const [feedbacks, setFeedbacks] = useState(new Map<string, FeedbackData>());
	const [messageOpen, setMessageOpen] = useState(false);
	const [error, setError] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [actionAccepted, setAcctionAccepted] = useState(false);
	const [id, setId] = useState('');
	const [viewMsg, setViewMsg] = useState('');
	const [loading, setLoading] = useState(false);
	const feedbackItems = useRef(
		new Array<{ id: string; value: FeedbackData }>(),
	);

	//* Use effect to update feedbacks when a resource is selected
	useEffect(() => {
		if (selected != '') {
			// buildFeedbackMap('dec', '2021');
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
	async function buildFeedbackMap(
		month: string,
		year: string,
	): Promise<void> {
		try {
			//Show loading screen
			setLoading(true);
			const secret = await getAuth();
			//Request feedback data
			const response = await axios({
				method: 'get',
				timeout: 30000,
				timeoutErrorMessage: 'timeout',
				url: `http://127.0.0.1:3000/api/admin/${props.type}/feedbacks?id=${selected}&month=${month}&year=${year}`,
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
						id: feedback.id,
						email: feedback.email,
						comment: feedback.comment,
						date: feedback.date,
					});
				}
				//Build plain object (as map) with id:string and value:boolean
				const temp: any = {};
				for (const [key] of feedbackMap.entries()) {
					temp[key] = false;
				}
				//Set all checked states for feedback items
				dispatch({ type: 'resdata/checks', payload: temp });
				//Display feedbacks
				setFeedbacks(feedbackMap);
				//Hide loading screen
				setLoading(false);
			} else {
				//No feedbacks for this resource
				setFeedbacks(new Map<string, FeedbackData>());
				setViewMsg(
					'Aceasta resursa nu are niciun feedback pentru perioada selectata.',
				);
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
				feedbackItems.current = arr;

				return (
					<>
						<FeedbackToolbar
							showMessagebox={setMessageOpen}
							setMessage={setError}
							display={buildFeedbackMap}
							setLoading={setLoading}
							type={props.type}
						/>
						<ul className="FeedbackList">
							{feedbackItems.current.map((item, index) => (
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
					</>
				);
			} else {
				return (
					<>
						<FeedbackToolbar
							showMessagebox={setMessageOpen}
							setMessage={setError}
							display={buildFeedbackMap}
							setLoading={setLoading}
							type={props.type}
						/>
						<div className="FbackPlaceholder">
							<p className="NoFeedbacks">{viewMsg}</p>
						</div>
					</>
				);
			}
		} else {
			return <p className="NoFeedbacks">{viewMsg}</p>;
		}
	}

	return (
		<div className="FbContainer">
			{displayFeedbacks()}
			<Modal
				isOpen={messageOpen}
				style={dialogStyles}
				ariaHideApp={false}
			>
				<MessageBox setIsOpen={setMessageOpen} message={error} />
			</Modal>
			<Modal isOpen={dialogOpen} style={dialogStyles} ariaHideApp={false}>
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
	const id = props.data.id;
	const dispatch = useDispatch();
	const checks = useSelector<CombinedStates>(
		(state) => state.resdataReducer.checks,
	) as any;

	function toggle(): void {
		//Create deep clone
		const temp = JSON.parse(JSON.stringify(checks));
		//Change corresponding check state
		temp[id] = !temp[id];
		//Update check state
		dispatch({ type: 'resdata/checks', payload: temp });
	}

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

				<input
					type="checkbox"
					checked={checks[id]}
					onChange={(): void => {
						/* */
					}}
					onClick={toggle}
				></input>
			</div>
			<div className="FbackTextDiv">
				<p className="FbackText">{props.data.comment}</p>
			</div>
		</div>
	);
};

const FeedbackToolbar: React.FC<FbackToolbarProps> = (
	props: FbackToolbarProps,
) => {
	const months = [
		'Ianuarie',
		'Februarie',
		'Martie',
		'Aprilie',
		'Mai',
		'Iunie',
		'Iulie',
		'August',
		'Septembrie',
		'Octombrie',
		'Noiembrie',
		'Decembrie',
	];

	const years = ['2021', '2022', '2023', '2024', '2025', '2026'];
	const dispatch = useDispatch();
	const checkType = useRef(true);
	const [selectText, setSelectText] = useState('Selecteaza toate');
	const month = useRef(months[0]);
	const year = useRef(years[0]);

	useEffect(() => {
		displayFeedbacks();
	}, []);

	/**
	 *
	 */
	function selectAll(): void {
		//Get an array of id:string; value:boolean
		const entries = Object.entries(store.getState().resdataReducer.checks);
		const temp: any = {};
		if (checkType.current) {
			//Mark all as selected
			for (const [key] of entries) {
				temp[key] = true;
			}
			setSelectText('Deselecteaza toate');
		} else {
			//Mark all as unselected
			for (const [key] of entries) {
				temp[key] = false;
			}
			setSelectText('Selecteaza toate');
		}
		//Update check state
		dispatch({ type: 'resdata/checks', payload: temp });
		//Change to opposite
		checkType.current = !checkType.current;
	}

	/**
	 *
	 */
	async function deleteSelected(): Promise<void> {
		//Get an array of id:string; value:boolean
		const entries = Object.entries(store.getState().resdataReducer.checks);
		const checks: any = store.getState().resdataReducer.checks;
		const fbacksToDelete = new Array<string>();
		let counter = 0;

		for (const [key] of entries) {
			if (checks[key] === true) {
				fbacksToDelete.push(key);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				counter++;
			}
		}

		//Check if there was at least one feedback selected
		if (counter > 0) {
			// TODO: Delete all selected feedbacks
			//Show loading screen
			props.setLoading(true);
			const secret = await getAuth();
			//Request deletion of selected feedbacks
			try {
				await axios({
					method: 'delete',
					timeout: 30000,
					timeoutErrorMessage: 'timeout',
					url: `http://127.0.0.1:3000/api/admin/${props.type}/feedbacks`,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${secret}`,
					},
					data: {
						videoId: store.getState().resdataReducer.selected,
						feedbackIds: fbacksToDelete,
					},
				});
				//Render remained feedbacks
				displayFeedbacks();
				//Notify user that request was handled successfully
				props.setMessage('Feedback-urile au fost sterse cu succes!');
				props.showMessagebox(true);
			} catch (error) {
				if (error.message === 'timeout') {
					//Timeout for response
					props.setMessage(
						'Serverul intarzie sa raspunda. Tranzactie inchisa.',
					);
				} else {
					//Firestore service is not available
					props.setMessage(ResponseCodes.get(error.response.status));
				}
				props.setLoading(false);
				//Notify user
				props.showMessagebox(true);
			}
		} else {
			//Notify user that he musts select a feedback first
			props.setMessage('Selectati cel putin un feedback!');
			props.showMessagebox(true);
		}
		props.setLoading(false);
	}

	/**
	 *
	 */
	function displayFeedbacks(): void {
		props.display(MonthsMap.get(month.current).text, year.current);
	}

	return (
		<div className="FeedbackToolbar">
			<Dropdown
				options={months}
				placeholder="Luna"
				className="FbackToolbarMonth"
				value={months[0]}
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				onChange={(event) => {
					month.current = event.value;
				}}
			/>
			<Dropdown
				options={years}
				placeholder="An"
				className="FbackToolbarYear"
				value={years[0]}
				// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
				onChange={(event) => {
					year.current = event.value;
				}}
			/>
			<Button
				className="FbackToolbarBtnDisplay"
				onClick={displayFeedbacks}
			>
				Afiseaza
			</Button>
			<Button className="FbackToolbarBtnSelect" onClick={selectAll}>
				{selectText}
			</Button>
			<img
				src={ToolbarIcons['DeleteIcon']}
				className="DeleteFback"
				data-tip="Sterge comentariu"
				onClick={deleteSelected}
			/>
		</div>
	);
};
