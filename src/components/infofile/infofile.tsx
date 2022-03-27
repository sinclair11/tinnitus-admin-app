import React from 'react';
import { useSelector } from 'react-redux';
import { CombinedStates } from '@store/reducers/custom';

type InfoProps = {
    title?: string;
    type: string;
};

export const InfoFile: React.FC<InfoProps> = (props?: InfoProps) => {
    // Choose which type of info to be displayed
    const info =
        props.type === 'general'
            ? (useSelector<CombinedStates>(
                  (state) => state.resdataReducer.info,
              ) as {
                  name: string;
                  value: unknown;
              }[])
            : (useSelector<CombinedStates>(
                  (state) => state.resdataReducer.usage,
              ) as {
                  name: string;
                  value: unknown;
              }[]);

    const selected = useSelector<CombinedStates>(
        (state) => state.resdataReducer.selected,
    ) as string;

    /**
     * @function displayInfo Display corresponding info or a message if info does not exist
     * @returns What to be displayed
     */
    function displayInfo(): JSX.Element {
        //Display a message to indicate that no resource was selected
        if (selected === '') {
            return (
                <div className="NoSelected">
                    <p>
                        Selectati un album pentru a vedea informatii{' '}
                        {props.type === 'general' ? 'generale' : 'de utilizare'}
                    </p>
                </div>
            );
        }
        //Display corresponding info
        else {
            return (
                <div className="ListDiv">
                    <ul className="InfoList">
                        {info.map((item, index) => (
                            <li key={index}>
                                {item.name}: <b>{item.value}</b>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
    }

    return <div className="InfoPlaceholder">{displayInfo()}</div>;
};
