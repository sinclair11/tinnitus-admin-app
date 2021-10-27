import React, { useState } from 'react';
import { MenuMemo } from '@components/menu/menu';
import { Container, Row, Col } from 'react-bootstrap';
import { SearchBar } from '@components/searchbar/searchbar';
import { InfoFile } from '@components/infofile/infofile';
import { Toolbar } from '@components/toolbar/toolbar';
import { Graph } from '@components/graph/graph';
import ReactPlayer from 'react-player';
import { Icons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import { Feedback } from '@components/feedback/feedback';
import { ModalSearch } from '@components/modal-search/modal-search';
import { Dialog } from '@components/dialog/dialog';
import { ResourceTable } from '@components/table/table';

export const Videos: React.FC = () => {
	const [isVisible, setIsVisible] = useState(true);
	const [info, setInfo] = useState([
		{
			name: 'Nume',
			value: 'N/A',
		},
		{
			name: 'Lungime',
			value: 'N/A',
		},
		{
			name: 'Data creare',
			value: 'N/A',
		},
		{
			name: 'Data incarcare',
			value: 'N/A',
		},
		{
			name: 'Tags',
			value: 'N/A',
		},
		{
			name: 'Descriere',
			value: 'N/A',
		},
	]);
	const [usage, setUsage] = useState([
		{
			name: 'Total durata vizionari',
			value: 'N/A',
		},
		{
			name: 'Total vizionari',
			value: 'N/A',
		},
		{
			name: 'Durata per utilizator',
			value: 'N/A',
		},
		{
			name: 'Aprecieri',
			value: 'N/A',
		},
		{
			name: 'Favorizari',
			value: 'N/A',
		},
		{
			name: 'Feedback-uri',
			value: 'N/A',
		},
	]);
	const [isOpen, setIsOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [tableElements, setTableElements] = useState([]);
	const [tableOpen, setTableOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [videoSelected, setVideoSelected] = useState(false);

	function moveToFeedback(): void {
		setIsVisible(!isVisible);
		ReactTooltip.hide();
	}

	function changeBtnTip(): string {
		if (!isVisible) {
			return 'Pagina principala';
		} else {
			return 'Feedback-uri';
		}
	}

	function playerOrPlaceholder(): JSX.Element {
		if (videoSelected) {
			return (
				<ReactPlayer
					className="react-player"
					url="https://youtu.be/T-4ACR94U4M"
					width="100%"
					height="40%"
					controls={true}
				/>
			);
		} else {
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
					delayShow={500}
				/>
				<MenuMemo page="Page" outer="View" />
				<div id="Page">
					{isVisible && (
						<div className="SearchBarDiv">
							<SearchBar
								updateInfo={setInfo}
								updateUsage={setUsage}
								setIsOpen={setIsOpen}
								setDialog={setDialogOpen}
								setDialogMessage={setMessage}
								setTableData={setTableElements}
								setTableOpen={setTableOpen}
							/>
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
										title="Informatii video"
										className=""
										elements={info}
									/>
									<InfoFile
										title="Informatii utilizare"
										className="InfoFilePos"
										elements={usage}
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
							<Feedback />
						</div>
					)}
					<img
						data-tip={changeBtnTip()}
						src={Icons['SwitchIcon']}
						className="SwitchIcon"
						onClick={(): void => moveToFeedback()}
					/>
					<ModalSearch isOpen={isOpen} setIsOpen={setIsOpen} />
					<Dialog
						isOpen={dialogOpen}
						setIsOpen={setDialogOpen}
						message={message}
					/>
					<ResourceTable
						isOpen={tableOpen}
						setIsOpen={setTableOpen}
						elements={tableElements}
						setElements={setTableElements}
					/>
				</div>
			</div>
		</div>
	);
};
