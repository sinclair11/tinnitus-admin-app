import { Icons } from '@src/utils/icons';
import React, { useState, useRef } from 'react';

type RowNameProps = {
    name: string;
    setName: any;
};

type RowFuncsProps = {
    id: number;
    deleteCallback: any;
};

type TableProps = {
    table: any;
};

type TableData = {
    file: Blob;
    name: string;
    pos: string;
    length: string;
};

const Table: React.FC<TableProps> = (props: TableProps) => {
    const inputSong = useRef(null);
    const [entries, setEntries] = useState([]);
    const headers = ['Nume', 'Pozitie', 'Durata', ''];
    const [update, setUpdate] = useState(false);
    props.table.function = getData;

    function getSong(event: any): void {
        const reader = new FileReader();
        const file = event.target.files[0];
        const audio = document.createElement('audio');

        if (event.target.files && file) {
            reader.readAsDataURL(file);
            reader.onloadend = (): void => {
                audio.src = reader.result as string;
                audio.onloadedmetadata = (): void => {
                    const duration = Math.round(audio.duration);
                    setEntries([
                        ...entries,
                        {
                            file: file,
                            name: file.name.slice(
                                0,
                                file.name.lastIndexOf('.'),
                            ),
                            pos: entries.length + 1,
                            length: getDurationFormat(duration),
                        },
                    ]);
                };
            };
        }
        event.target.value = null;
    }

    function getData(): TableData[] {
        return entries;
    }

    function deleteEntry(id: number): void {
        const temp = entries;
        //Find and delete the entry by provided id
        for (let i = 0; i < temp.length; i++) {
            if (temp[i].pos === id) {
                temp.splice(i, 1);
                break;
            }
        }
        //Replace all positions
        for (let i = 0; i < temp.length; i++) {
            temp[i].pos = i + 1;
        }

        setEntries(temp);
        setUpdate(!update);
    }

    function onDisplayName(id: number): string {
        for (const entry of entries) {
            if (entry.pos === id) {
                return entry.name;
            }
        }
    }

    function onChangeName(event: any, id: number): void {
        const temp = entries;

        for (const entry of temp) {
            if (entry.pos === id) {
                entry.name = event.target.value;
            }
        }

        setEntries(temp);
        setUpdate(!update);
    }

    function onPlusClick(): void {
        inputSong.current.click();
    }

    function getDurationFormat(duration: number): string {
        const hours = Math.round(duration / 3600);
        const hoursRemSec = duration - hours * 3600;
        const minutes = Math.round(hoursRemSec / 60);
        const seconds = hoursRemSec - minutes * 60;

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

    return (
        <div className="table-section">
            <table className="table" id="album-table">
                <thead>
                    <tr>
                        {headers.map((header, i) => (
                            <th key={`${i}`}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entries.map((row, i) => {
                        return (
                            <tr key={`${i}`} id={`${i + 1}`}>
                                <td>
                                    <input
                                        id={`row-name-${i + 1}`}
                                        className="input-name"
                                        value={onDisplayName(i + 1)}
                                        onChange={(event): void =>
                                            onChangeName(event, i + 1)
                                        }
                                    />
                                </td>
                                <td>{row.pos}</td>
                                <td>{row.length}</td>
                                <td>
                                    <div className="table-row-func">
                                        {/* Delete icon */}
                                        <img
                                            src={Icons.DeleteRow}
                                            className="remove-icon"
                                            onClick={(): void =>
                                                deleteEntry(i + 1)
                                            }
                                        />
                                        {/* Up & Down buttons */}
                                        <div className="nav-section">
                                            <img src={Icons.Up} />
                                            <img
                                                src={Icons.Down}
                                                className="down"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
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
};

export const RowFuncs: React.FC<RowFuncsProps> = (props: RowFuncsProps) => {
    function deleteEntry(): void {
        props.deleteCallback(props.id);
    }

    return (
        <div className="table-row-func">
            {/* Delete icon */}
            <img
                src={Icons.DeleteRow}
                className="remove-icon"
                onClick={deleteEntry}
            />
            {/* Up & Down buttons */}
            <div className="nav-section">
                <img src={Icons.Up} />
                <img src={Icons.Down} className="down" />
            </div>
        </div>
    );
};

export default Table;
