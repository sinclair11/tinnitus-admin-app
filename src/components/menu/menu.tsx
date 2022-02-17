import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { slide as ScaleMenu } from 'react-burger-menu';
import Logo from '@icons/logo.png';
import useWindowDimensions from '@src/hooks/use-window-dimensions';
import { Icons } from '@utils/icons';

export const Menu: React.FC<{ page: string; outer: string }> = (props) => {
    const [menuWidth, setMenuWidth] = useState('25%');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { height, width } = useWindowDimensions();

    useEffect(() => {
        if (width > 1280) {
            setMenuWidth('15%');
        } else {
            setMenuWidth('20%');
        }
    });

    return (
        <ScaleMenu
            width={menuWidth}
            pageWrapId={props.page}
            outerContainerId={props.outer}
        >
            <div style={{ display: 'flex' }}>
                <img src={Logo} className="LogoMenu" />
                <p className="Title">Tinnitus Admin</p>
            </div>
            <Link
                className="MenuLink"
                style={{ borderTop: '1px solid aquamarine' }}
                to="/welcome"
            >
                <div className="LinkPlaceholder">
                    <img src={Icons['HomeIcon']} className="MenuIcon" />
                    <p className="LinkText">Home</p>
                </div>
            </Link>
            <Link className="MenuLink" to="/video">
                <div className="LinkPlaceholder">
                    <img src={Icons['VideoIcon']} className="MenuIcon" />
                    <p className="LinkText">Video</p>
                </div>
            </Link>
            <Link className="MenuLink" to="/audio">
                <div className="LinkPlaceholder">
                    <img src={Icons['AudioIcon']} className="MenuIcon" />
                    <p className="LinkText">Audio</p>
                </div>
            </Link>
            <Link className="MenuLink" to="/generator">
                <div className="LinkPlaceholder">
                    <img src={Icons['GeneratorIcon']} className="MenuIcon" />
                    <p className="LinkText">Generator</p>
                </div>
            </Link>
            <Link className="MenuLink" to="/statistics">
                <div className="LinkPlaceholder">
                    <img src={Icons['StatisticsIcon']} className="MenuIcon" />
                    <p className="LinkText">Statistici & Rapoarte</p>
                </div>
            </Link>
            <button
                className="ChannelLink"
                onClick={(): Window =>
                    window.open(
                        'https://www.youtube.com/channel/UCIygYFvZg8xH3S05mS7xzNg',
                        'modal',
                    )
                }
            >
                <div className="LinkPlaceholder">
                    <img src={Icons['ChannelIcon']} className="MenuIcon" />
                    <p className="LinkText">Canal YouTube</p>
                </div>
            </button>
            <p className="CopyMenu">© 2021 Tinnitus Sounds</p>
        </ScaleMenu>
    );
};

export const MenuMemo = React.memo(Menu);
