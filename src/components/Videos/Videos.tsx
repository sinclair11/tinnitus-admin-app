import React, { useState, useEffect } from 'react';
import { MenuMemo } from '@components/menu/Menu';
import { Container, Row, Col } from 'react-bootstrap';
import { SearchBar } from '@components/searchbar/SearchBar';
import { InfoFile } from '@components/infofile/InfoFile';
import { Toolbar } from '@components/toolbar/Toolbar';
import { Graph } from '@components/graph/Graph';
import ReactPlayer from 'react-player';
import { Icons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import { Feedback } from '@components/feedback/Feedback';
import '@components/modal-search/modal-search.css';
import { useDispatch } from 'react-redux';

type ResProps = {
	resourceType: string;
};

export const Videos: React.FC<ResProps> = (props: ResProps) => {
	const [isVisible, setIsVisible] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		//No resource data on first rendering
		dispatch({ type: 'resdata/selected', payload: '' });
		dispatch({ type: 'resdata/edit', payload: '' });
		dispatch({ type: 'resdata/delete', payload: '' });
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
		if (false /*selected !== ''*/) {
			//Insert video player
			if (props.resourceType === 'video') {
				return (
					<ReactPlayer
						className="react-player"
						url="https://youtu.be/T-4ACR94U4M"
						width="100%"
						height="40%"
						controls={true}
					/>
				);
			} else if (props.resourceType === 'audio') {
				//Insert audio player
			}
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
							<SearchBar />
						</div>
					)}
					{isVisible && (
						<Container id="content" className="ContentPlaceholder">
							<Row className="Row">
								<Col className="Col">
									<Toolbar container="Toolbar" />
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
							<Feedback type="videos" />
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
