import { Icons } from '@src/utils/icons';
import React, { useState, useRef } from 'react';
import Dropdown from '@components/dropdown/dropdown';

type TableProps = {
    table: any;
    setInvalid: any;
    categories?: Array<string>;
    data?: Array<TableData>;
};

export type TableData = {
    file: Blob;
    name: string;
    pos: string | number;
    length: string;
    category: string;
};

type RowEditProps = {
    name: string;
    position: number;
    length: string;
    categories: Array<string>;
};

export const TableEdit: React.FC<TableProps> = (props: TableProps) => {
    const inputSong = useRef(null);
    const loadingEl = (
        <div id="table-loading">
            <img src={Icons.Loading} className="table-loading-anim" />
        </div>
    );
    const [entries, setEntries] = useState(Array<TableData>());
    const headers = ['Nume', 'Pozitie', 'Durata', 'Categorie', loadingEl];
    const [update, setUpdate] = useState(false);
    //Assign function to pass table data to Upload component
    props.table.function = getData;

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
                            category: 'General',
                        },
                    ]);
                    props.setInvalid('');
                    //Loading ended
                    document.getElementById('table-loading').style.display =
                        'none';
                    //Trigger animation for new inserted entry
                    document
                        .getElementById(`${entries.length}`)
                        .classList.add('table-row-animation');
                };
            };
        }
        //Reset to be able to choose last selected file
        event.target.value = null;
    }

    //Function used to pass data to Upload component
    function getData(): TableData[] {
        return entries;
    }

    function deleteEntry(id: number): void {
        const temp = entries;

        temp.splice(id, 1);

        //Replace all positions
        for (let i = 0; i < temp.length; i++) {
            temp[i].pos = i + 1;
        }

        setEntries(temp);
        setUpdate(!update);
    }

    function onDisplayName(id: number): string {
        return entries[id].name;
    }

    function onChangeName(event: any, id: number): void {
        const temp = entries;

        temp[id].name = event.target.value;

        setEntries(temp);
        //Idk why is not rendering on first change state
        setUpdate(!update);
    }

    function onPlusClick(): void {
        //Trigger choose file dialog
        inputSong.current.click();
    }

    function onCategoryChange(value: string, id: string): void {
        const temp = entries;
        const index = id[id.length - 1] as unknown as number;
        temp[index].category = value;
        setEntries(temp);
        setUpdate(!update);
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

    function onMoveUp(id: number): void {
        const temp = entries;
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
            setEntries(temp);
            setUpdate(!update);
        }
    }

    function onMoveDown(id: number): void {
        const temp = entries;
        const tempEl = temp[id];
        let currentRowHtml;

        if (id == entries.length - 1) {
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
            setEntries(temp);
            setUpdate(!update);
        }
    }

    function onRowAnimationStart(id: number): void {
        //Also set animation to the input fields in the row
        document
            .getElementById(`row-name-${id}`)
            .classList.add('table-row-animation');
        document
            .getElementById(`row-category-${id}`)
            .classList.add('table-row-animation');
    }

    function onRowAnimationEnd(id: number): void {
        //Remove animations from row level and inputs inside the row
        document
            .getElementById(`row-name-${id}`)
            .classList.remove('table-row-animation');
        document
            .getElementById(`row-category-${id}`)
            .classList.remove('table-row-animation');
        document
            .getElementById(`${id}`)
            .classList.remove('table-row-animation');
    }

    return (
        <div className="table-section">
            <table className="table" id="album-table">
                <thead>
                    <tr>
                        {headers.map((header, i) => (
                            <th id={`table-edit-header-${i}`} key={`${i}`}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entries.map((row, i) => {
                        return (
                            <tr
                                key={`${i}`}
                                id={`${i}`}
                                onAnimationStart={(): void => {
                                    onRowAnimationStart(i);
                                }}
                                onAnimationEnd={(): void => {
                                    onRowAnimationEnd(i);
                                }}
                            >
                                <td>
                                    <input
                                        id={`row-name-${i}`}
                                        className="input-name"
                                        value={onDisplayName(i)}
                                        onChange={(event): void =>
                                            onChangeName(event, i)
                                        }
                                    />
                                </td>
                                <td>{row.pos}</td>
                                <td>{row.length}</td>
                                <td className="category">
                                    <Dropdown
                                        id={`row-category-${i}`}
                                        items={props.categories}
                                        className="dropdown-category"
                                        onChange={onCategoryChange}
                                        current={entries[i].category}
                                    />
                                </td>
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
                                            <img
                                                src={Icons.Up}
                                                onClick={(): void =>
                                                    onMoveUp(i)
                                                }
                                            />
                                            <img
                                                src={Icons.Down}
                                                className="down"
                                                onClick={(): void =>
                                                    onMoveDown(i)
                                                }
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
