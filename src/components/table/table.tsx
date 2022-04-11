import { Icons } from '@src/utils/icons';
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import Dropdown from '@components/dropdown/dropdown';
import { SongData } from '@src/types/album';

type TableProps = {
    type: string;
    headers: Array<any>;
    data?: Array<SongData>;
    calculateDuration?: CallableFunction;
};

export const Table = forwardRef((props: TableProps, ref: any) => {
    const [invalid, setInvalid] = useState('');
    const table = useRef(null);
    const [tableData, setTableData] = useState(Array<SongData>());
    const [categories, setCategories] = useState(Array<string>());
    const inputSong = useRef(null);
    const loadingEl = (
        <div id="table-loading">
            <img src={Icons.Loading} className="table-loading-anim" />
        </div>
    );

    useEffect(() => {
        if (props.type === 'view' || props.type === 'edit') {
            setTableData(props.data);
        } else {
            //No data to be displayed
        }
    }, []);

    useEffect(() => {
        const durations = new Array<string>();
        for (const song of tableData) {
            durations.push(song.length);
        }
        props.calculateDuration(durations);
    }, [tableData]);

    function verifyHeaders(): Array<any> {
        const temp = Object.assign([], props.headers);
        if (props.type === 'create') {
            temp.push(loadingEl);
        }

        return temp;
    }

    useImperativeHandle(ref, () => ({
        setCategories: (value: Array<string>): void => {
            setCategories(value);
        },

        getData: (): Array<SongData> => {
            return tableData;
        },

        clearInternalStates: (): void => {
            setTableData([]);
        },

        getInputValidation: async (): Promise<boolean> => {
            if (tableData.length === 0) {
                setInvalid('Please add at least one item');
                return false;
            } else {
                for (const entry of tableData) {
                    if (entry.name === '' || entry.category === '') {
                        setInvalid('All fields are mandatory');
                        return false;
                    } else {
                        setInvalid('');
                        return true;
                    }
                }
            }
        },
    }));

    function getSong(event: any): void {
        const reader = new FileReader();
        const file = event.target.files[0];
        const audio = document.createElement('audio');

        if (event.target.files && file) {
            //Trigger loading animation
            document.getElementById('table-loading').style.display = 'flex';
            //Read content of audio file
            reader.readAsDataURL(file);
            reader.onloadend = (): void => {
                audio.src = reader.result as string;
                //Load metadata for audio file
                audio.onloadedmetadata = (): void => {
                    const duration = Math.round(audio.duration);
                    //Set all required data
                    setTableData([
                        ...tableData,
                        {
                            file: file,
                            extension: file.name.split('.').pop(),
                            name: file.name.slice(0, file.name.lastIndexOf('.')),
                            pos: tableData.length + 1,
                            length: getDurationFormat(duration),
                            category: categories[0],
                            likes: 0,
                            favorites: 0,
                            views: 0,
                        },
                    ]);
                    setInvalid('');
                    //Loading ended
                    document.getElementById('table-loading').style.display = 'none';
                    //Trigger animation for new inserted entry
                    document.getElementById(`${tableData.length}`).classList.add('table-row-animation');
                    //Callback parent to calculate total duration
                };
            };
        }
        //Reset to be able to choose last selected file
        event.target.value = null;
    }

    function onCategoryChange(value: string, id: string): void {
        const temp = Object.assign([], tableData);
        const index = id[id.length - 1] as unknown as number;
        temp[index].category = value;
        setTableData(temp);
    }

    function onRowAnimationStart(id: number): void {
        //Also set animation to the input fields in the row
        document.getElementById(`row-name-${id}`).classList.add('table-row-animation');
        document.getElementById(`row-category-${id}`).classList.add('table-row-animation');
    }

    function onRowAnimationEnd(id: number): void {
        //Remove animations from row level and inputs inside the row
        document.getElementById(`row-name-${id}`).classList.remove('table-row-animation');
        document.getElementById(`row-category-${id}`).classList.remove('table-row-animation');
        document.getElementById(`${id}`).classList.remove('table-row-animation');
    }

    function displayName(type: string, index: number, name: string): any {
        if (type === 'view') {
            return <p>{name}</p>;
        } else if (type === 'create' || type === 'edit') {
            return (
                <td>
                    <input
                        id={`row-name-${index}`}
                        className="input-name"
                        value={name}
                        onChange={(event): void => onChangeName(event, index)}
                    />
                </td>
            );
        }
    }

    function onChangeName(event: any, id: number): void {
        const temp = Object.assign([], tableData);
        temp[id].name = event.target.value;
        setTableData(temp);
    }

    function displayCategory(type: string, id: number, category?: string): any {
        if (type === 'view') {
            return <p>{category}</p>;
        } else if (type === 'create' || type === 'edit') {
            return (
                <Dropdown
                    id={`row-category-${id}`}
                    items={categories}
                    className="dropdown-category"
                    onChange={onCategoryChange}
                    current={tableData[id].category}
                />
            );
        }
    }

    function deleteEntry(id: number): void {
        const temp = Object.assign([], tableData);
        temp.splice(id, 1);
        //Replace all positions
        for (let i = 0; i < temp.length; i++) {
            temp[i].pos = i + 1;
        }

        setTableData(temp);
    }

    function onPlusClick(): void {
        //Trigger choose file dialog
        inputSong.current.click();
    }

    function getDurationFormat(duration: number): string {
        //Calculate duration in HH:MM:SS format
        const hours = Math.floor(duration / 3600);
        const hoursRemSec = duration - hours * 3600;
        const minutes = Math.floor(hoursRemSec / 60);
        const seconds = hoursRemSec - minutes * 60;

        //Append a 0
        let retVal = `0${hours}:`;
        if (minutes < 10) {
            retVal += '0';
        }
        retVal += `${minutes}:`;
        if (seconds < 10) {
            retVal += '0';
        }
        retVal += `${seconds}`;

        return retVal;
    }

    function moveUp(id: number): void {
        const temp = Object.assign([], tableData);
        const tempEl = temp[id];
        let currentRowHtml;

        if (id === 0) {
            //Already the first position
        } else {
            //Interchange elements and change positions in album
            temp[id] = temp[id - 1];
            temp[id].pos = (temp[id].pos as number) + 1;
            temp[id - 1] = tempEl;
            temp[id - 1].pos = (temp[id - 1].pos as number) - 1;
            //Set highlight animation
            currentRowHtml = document.getElementById(`${id - 1}`);
            currentRowHtml.classList.add('table-row-animation');
            setTableData(temp);
        }
    }

    function moveDown(id: number): void {
        const temp = Object.assign([], tableData);
        const tempEl = temp[id];
        let currentRowHtml;

        if (id == temp.length - 1) {
            //Already the last position
        } else {
            //Interchange elements and change positions in album
            temp[id] = temp[id + 1];
            temp[id].pos = (temp[id].pos as number) - 1;
            temp[id + 1] = tempEl;
            temp[id + 1].pos = (temp[id + 1].pos as number) + 1;
            //Set highlight animation
            currentRowHtml = document.getElementById(`${id + 1}`);
            currentRowHtml.classList.add('table-row-animation');
            setTableData(temp);
        }
    }

    return (
        <div className="table-section">
            <table className="table" id="album-table" ref={table}>
                <thead>
                    <tr>
                        {verifyHeaders().map((header, i) => (
                            <th id={`table-edit-header-${i}`} key={`${i}`}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, i) => {
                        return (
                            <tr
                                id={`${i}`}
                                key={`${i}`}
                                onAnimationStart={(): void => {
                                    onRowAnimationStart(i);
                                }}
                                onAnimationEnd={(): void => {
                                    onRowAnimationEnd(i);
                                }}
                            >
                                {displayName(props.type, i, row.name)}
                                <td>{row.pos}</td>
                                <td>{row.length}</td>
                                <td className="category">{displayCategory(props.type, i, row.category)}</td>
                                {props.type === 'view' ? <td> {row.views}</td> : null}
                                {props.type === 'view' ? <td> {row.likes}</td> : null}
                                {props.type === 'view' ? <td> {row.favorites}</td> : null}
                                {props.type === 'create' || props.type === 'edit' ? (
                                    <td>
                                        <div className="table-row-func">
                                            {/* Delete icon */}
                                            <img
                                                src={Icons.DeleteRow}
                                                className="remove-icon"
                                                onClick={(): void => deleteEntry(i)}
                                            />
                                            {/* Up & Down buttons */}
                                            <div className="nav-section">
                                                <img src={Icons.Up} onClick={(): void => moveUp(i)} />
                                                <img
                                                    src={Icons.Down}
                                                    className="down"
                                                    onClick={(): void => moveDown(i)}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                ) : null}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <p className="invalid-input invalid-table">{invalid}</p>
            <div className="plus-body" onClick={onPlusClick}>
                <img src={Icons.Plus} className="plus" />
                <input
                    ref={inputSong}
                    className="input-plus"
                    type="file"
                    accept="audio/*"
                    onChange={(event): void => getSong(event)}
                />
            </div>
        </div>
    );
});
