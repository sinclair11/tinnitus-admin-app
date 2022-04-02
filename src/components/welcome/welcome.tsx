import React, { useEffect } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import logoIcon from '@icons/logo.png';
import { Icons } from '@utils/icons';
import { getAuth } from 'firebase/auth';

const Welcome: React.FC = () => {
    const history = useHistory();

    useEffect(() => {
        if (getAuth().currentUser) {
            //Continue in page
        } else {
            history.push('/');
        }
    });

    return (
        <div className="Stack">
            <img src={logoIcon} className="Logo fade linear" />
            <GridActionsMemo />
            <p
                style={{
                    position: 'absolute',
                    color: 'black',
                    bottom: '1px',
                }}
            >
                Copyright © 2021 Tinnitus Sounds
            </p>
        </div>
    );
};

const GridActions: React.FC = () => {
    const history = useHistory();

    function goToRoute(route: string): void {
        history.push(route);
    }

    return (
        <div className={'GridActions GridMove'}>
            <ButtonGroup vertical className="ButtonGroup">
                <Button
                    className="GridButton GridButtonText"
                    onClick={(): void => goToRoute('/audio')}
                >
                    <img src={Icons['AudioIcon']} className="ButtonIcon" />
                    Administreaza albume audio
                </Button>
                <Button
                    className="GridButton GridButtonText"
                    onClick={(): void => goToRoute('/generator')}
                >
                    <img src={Icons['GeneratorIcon']} className="ButtonIcon" />
                    Administreaza generator
                </Button>
                <Button className="GridButton GridButtonText">
                    <img src={Icons['StatisticsIcon']} className="ButtonIcon" />
                    Statistici si rapoarte
                </Button>
                <Button
                    className="GridButton GridButtonText"
                    onClick={(): Window =>
                        window.open(
                            'https://www.youtube.com/c/TinnitusSounds',
                            'modal',
                        )
                    }
                >
                    <img src={Icons['ChannelIcon']} className="ButtonIcon" />
                    Canal YouTube
                </Button>
            </ButtonGroup>
        </div>
    );
};

const GridActionsMemo = React.memo(GridActions);

export default Welcome;
