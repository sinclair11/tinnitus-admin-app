import { Icons } from '@src/utils/icons';
import React, { useState, useRef, useEffect } from 'react';

type DropdownProps = {
    id?: string;
    className?: string;
    items: Array<string>;
    onChange?: any;
    current?: string;
};

const Dropdown: React.FC<DropdownProps> = (props: DropdownProps) => {
    const [toggle, setToggle] = useState(true);
    const listDiv = useRef(null);
    const list = useRef(null);
    const [selected, setSelected] = useState(props.current !== null ? props.current : 'General');

    useEffect(() => {
        setSelected(props.current);
    }, [props.current]);

    function onDropdownClick(): void {
        if (toggle === true) {
            listDiv.current.style.display = 'flex';
        } else {
            listDiv.current.style.display = 'none';
        }

        setToggle(!toggle);
    }

    function onListClick(value: string): void {
        setSelected(value);
        props.onChange(value, props.id);
    }

    function onLeavingComponent(): void {
        listDiv.current.style.display = 'none';
    }

    return (
        <div id={props.id} className={`dropdown ${props.className}`} onClick={onDropdownClick}>
            <p>{selected}</p>
            <img src={Icons.ArrowDown} />
            <div
                ref={listDiv}
                className="dropdown-list-div"
                id="album-info-dropdown"
                onBlur={(): void => onLeavingComponent()}
            >
                <ul ref={list}>
                    {props.items.map((item, key) => {
                        return (
                            <li key={key} onClick={(): void => onListClick(item)}>
                                {item}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default Dropdown;
