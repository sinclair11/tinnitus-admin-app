import { Icons } from '@src/utils/icons';
import React from 'react';

type InfologProps = {
    messages?: Array<{ type: string; value: unknown }>;
};

export const InfoLog: React.FC<InfologProps> = (props: InfologProps) => {
    const types = React.useRef(
        new Map<string, { color: string; img: string }>([
            ['error', { color: '#FF0000', img: Icons.ErrorProgress }],
            ['success', { color: '#00FF00', img: Icons.SuccessProgress }],
            ['info', { color: '#00FFFF', img: Icons.InfoProgress }],
        ]),
    );

    function getColor(type: string): string {
        if (type != '') {
            return types.current.get(type).color;
        } else {
            return '#FFFFFF';
        }
    }

    function getImg(type: string): string {
        if (type != '') {
            return types.current.get(type).img;
        } else {
            return Icons.InfoProgress;
        }
    }

    return (
        <div className="InfologContainer">
            <ul className="InfoLog">
                {props.messages.map((item, index) => (
                    <li
                        key={index}
                        style={{
                            color: getColor(item.type),
                            fontSize: '15px',
                            marginBottom: '10px',
                        }}
                    >
                        <img src={getImg(item.type)} />
                        {item.value}
                    </li>
                ))}
            </ul>
        </div>
    );
};
