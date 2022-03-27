import { Icons } from '@src/utils/icons';
import React, { useState, useRef } from 'react';

type DropdownProps = {
    className?: string;
    items: Array<string>;
    onChange?: any;
};

const Dropdown: React.FC<DropdownProps> = (props: DropdownProps) => {
    const [toggle, setToggle] = useState(true);
    const listDiv = useRef(null);
    const list = useRef(null);
    const [selected, setSelected] = useState(props.items[0]);

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
        props.onChange(value);
    }

    return (
        <div
            className={`dropdown ${props.className}`}
            onClick={onDropdownClick}
        >
            <p>{selected}</p>
            <img src={Icons.ArrowDown} />
            <div
                ref={listDiv}
                className="dropdown-list-div"
                id="album-info-dropdown"
            >
                <ul ref={list}>
                    {props.items.map((item, key) => {
                        return (
                            <li
                                key={key}
                                onClick={(): void => onListClick(item)}
                            >
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
