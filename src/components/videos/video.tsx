import React, { useState, useEffect } from 'react';
import { MenuMemo } from '@src/components/menu/menu';
import { Container, Row, Col } from 'react-bootstrap';
import { SearchBar } from '@src/components/searchbar/searchbar';
import { InfoFile } from '@src/components/infofile/infofile';
import { Toolbar } from '@src/components/toolbar/toolbar';
import { Graph } from '@src/components/graph/graph';
// import ReactPlayer from 'react-player';
import { Icons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import { Feedback } from '@src/components/feedback/feedback';
import '@components/modal-search/modal-search.css';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';

export const VideoView: React.FC = () => {
	const [isVisible, setIsVisible] = useState(true);
	const dispatch = useDispatch();
	const selected = useSelector<CombinedStates>(
		(state) => state.resdataReducer.selected,
	) as string;
	const thumbnail = useSelector<CombinedStates>(
		(state) => state.resdataReducer.thumbnail,
	) as string;

	useEffect(() => {
		//No resource data on first rendering
		dispatch({ type: 'resdata/selected', payload: '' });
	}, []);

	/**
	 * @function moveToFeedback
	 */
	function moveToFeedback(): void {
		setIsVisible(!isVisible);
		ReactTooltip.hide();
	}

	/**
	 * @function playerOrPlaceholder
	 * @returns
	 */
	function playerOrPlaceholder(): JSX.Element {
		//Check if a resource was selected
		if (selected !== '') {
			//Insert video player
			return (
				// <ReactPlayer
				// 	className="react-player"
				// 	url="https://youtu.be/T-4ACR94U4M"
				// 	width="100%"
				// 	height="40%"
				// 	controls={true}
				// />
				<div className="ThumbPlaceholder">
					<img
						src={`data:image/png;base64,${thumbnail}`}
						className="ThumbImg"
					/>
				</div>
			);
		}
		//Functionality N/A
		else {
			return (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						width: '100%',
						height: '40%',
						background: '#004687',
						boxShadow: '-3px 5px 4px -1px rgba(0,0,0,0.66)',
					}}
				>
					<p>Functia de redare video nu este disponibila momentan.</p>
				</div>
			);
		}
	}

	return (
		<div>
			<div id="View">
				<ReactTooltip
					place="top"
					type="dark"
					effect="float"
					delayShow={1000}
				/>
				<MenuMemo page="Page" outer="View" />
				<div id="Page">
					{isVisible && (
						<div className="SearchBarDiv">
							<SearchBar type="video" />
						</div>
					)}
					{isVisible && (
						<Container id="content" className="ContentPlaceholder">
							<Toolbar type="video" />
							<Row className="Row">
								<Col className="Col">
									{playerOrPlaceholder()}
									<Graph container="Graph" />
								</Col>
								<Col className="ColInfo">
									<InfoFile
										title="Informatii generale"
										type={'general'}
									/>
									<InfoFile
										title="Informatii utilizare"
										type={'usage'}
									/>
								</Col>
							</Row>
						</Container>
					)}
					{!isVisible && (
						<div
							id="feedback"
							style={{
								height: '100%',
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Feedback type="video" />
						</div>
					)}
					<img
						src={Icons['SwitchIcon']}
						className="SwitchIcon"
						onClick={(): void => moveToFeedback()}
					/>
				</div>
			</div>
		</div>
	);
};
