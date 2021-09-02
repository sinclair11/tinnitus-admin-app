import React, { useEffect, useState, useRef } from 'react';
import "./video.css"
import { Menu } from '../Menu/Menu'
import { Container, Row, Col } from 'react-bootstrap';
import { SearchBar } from '../SearchBar/SearchBar'
import { InfoFile } from '../InfoFile/InfoFile'
import { InfoFileList, InfoUsageList } from '../../utils/info'
import { Toolbar } from '../Toolbar/Toolbar'
import { Graph } from '../Graph/Graph'
import ReactPlayer from 'react-player';
import { Icons } from '../../utils/icons'
import ReactTooltip from 'react-tooltip';
import { Feedback } from '../Feedback/Feedback'

export const Videos: React.FC = () => {

  const [isVisible, setIsVisible] = useState(true);
  const [info, setInfo] = useState([{
    name: 'Nume',
    value: 'N/A'
  },
  {
    name: 'Lungime',
    value: 'N/A'
  },
  {
    name: 'Data creare',
    value: 'N/A'
  },
  {
    name: 'Data incarcare',
    value: 'N/A'
  },
  {
    name: 'Tags',
    value: 'N/A'
  },
  {
    name: 'Descriere',
    value: 'N/A'
  },]);
  const [usage, setUsage] = useState([{
    name: 'Total durata vizionari',
    value: 'N/A'
  },
  {
    name: 'Total vizionari',
    value: 'N/A'
  },
  {
    name: 'Durata per utilizator',
    value: 'N/A'
  },
  {
    name: 'Aprecieri',
    value: 'N/A'
  },
  {
    name: 'Favorizari',
    value: 'N/A'
  },
  {
    name: 'Feedback-uri',
    value: 'N/A'
  },]);

  function moveToFeedback() {
    setIsVisible(!isVisible)
    ReactTooltip.hide()
  }

  function changeBtnTip(): string {
    if (!isVisible) {
      return 'Pagina principala'
    }
    else {
      return 'Feedback-uri'
    }
  }

  return (
    <div>
      <div id="View">
        <ReactTooltip place="top" type="dark" effect="float" delayShow={500} />
        <Menu page="Page" outer="View" />
        <div id="Page">
          {isVisible && <div className="SearchBarDiv">
            <SearchBar
              updateInfo={setInfo}
              updateUsage={setUsage}
            />
          </div>}
          {isVisible && <Container id="content" className="ContentPlaceholder">
            <Row className="Row">
              <Col className="Col">
                <Toolbar container='Toolbar' />
                {/* <div className="VideoPlaceholder">
                            </div> */}
                <ReactPlayer
                  className='react-player'
                  url='https://youtu.be/T-4ACR94U4M'
                  width="100%"
                  height="40%"
                  controls={true}
                />
                <Graph container='Graph' />
              </Col>
              <Col className="ColInfo">
                <InfoFile
                  title="Informatii video"
                  className=""
                  elements={info} />
                <InfoFile
                  title="Informatii utilizare"
                  className="InfoFilePos"
                  elements={usage} />
              </Col>
            </Row>
          </Container>}
          {!isVisible && <div id="feedback" style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Feedback />
          </div>}
          <img data-tip={changeBtnTip()}
            src={Icons['SwitchIcon']}
            className="SwitchIcon"
            onClick={() => moveToFeedback()}
          />
        </div>
      </div>
    </div>
  )
}


