import { Icons } from '@src/utils/icons';
import React from 'react';
import { useTable } from 'react-table';

type TableProps = {
    columns: any;
    data: any;
};

const Table: React.FC<TableProps> = (props: TableProps) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(props);

    const inputSong = React.useRef(null);

    function getSong(event: any): void {
        //  
    }

    function onPlusClick(): void {
        inputSong.current.click();
    }

    return (
        <div className="table-section">
            <table {...getTableProps()} className="table">
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </td>
                                    );
                                })}
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
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    onChange={(event) => getSong(event)}
                />
            </div>
        </div>
    );
};

export default Table;
