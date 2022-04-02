import React from 'react';
import { Icons } from '@src/utils/icons';
import { useHistory } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const history = useHistory();

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={Icons.LogoIcon} />
                <p>Tinnitus CMS Menu</p>
            </div>
            <div className="sidebar-menu-content">
                <div className="sidebar-menu-item" onClick={(): void => history.push('/audio')}>
                    <img src={Icons.AudioIcon} />
                    <p>Administreaza albume</p>
                </div>
                <div className="sidebar-menu-item" onClick={(): void => history.push('/generator')}>
                    <img src={Icons.GeneratorIcon} />
                    <p>Administreaza generator</p>
                </div>
                <div className="sidebar-menu-item" onClick={(): void => history.push('/statistics')}>
                    <img src={Icons.StatisticsIcon} />
                    <p>Statistici si rapoarte</p>
                </div>
                <div
                    className="sidebar-menu-item"
                    onClick={(): Window => window.open('https://www.youtube.com/channel/UCIygYFvZg8xH3S05mS7xzNg')}
                >
                    <img src={Icons.ChannelIcon} />
                    <p>Canal de Youtube</p>
                </div>
                <div className="sidebar-menu-item" onClick={(): Window => window.open('https://www.earsbuzzing.com')}>
                    <img src={Icons.EarsbuzzingSite} />
                    <p>Ears Buzzing site</p>
                </div>
                <div className="sidebar-menu-item" onClick={(): void => history.push('/tutorial')}>
                    <img src={Icons.Tutorial} />
                    <p>Tutorial</p>
                </div>
            </div>
            <p className="sidebar-copyright">Copyright © 2022 Tinnitus Sounds</p>
        </div>
    );
};

export default Sidebar;
