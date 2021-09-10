import React, { useState } from 'react';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap';
import './table.css';
import { tableStyles } from '@src/utils/styles';
import { Icons } from '@src/utils/icons';
import { Column, useTable } from 'react-table';

type TableProps = {
  isOpen?: boolean,
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  elements: Array<{ name: string, date: string }>;
  setElements?: React.Dispatch<React.SetStateAction<Array<{ name: string, date: string }>>>;
}


export const ResourceTable: React.FC<TableProps> = (props: TableProps) => {

  const columns: Array<Column<{ name: string; date: string }>> = React.useMemo(
    () => [
      {
        Header: 'Nume',
        accessor: 'name',
      },
      {
        Header: 'Data incarcare',
        accessor: 'date',
      },
    ],
    []
  );
  const data = props.elements;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  })

  function onOk() {
    props.setElements([])
    props.setIsOpen(false)
  }

  function onCancel() {
    props.setElements([])
    props.setIsOpen(false)
  }

  return (
    <Modal
      style={tableStyles}
      isOpen={props.isOpen}
      ariaHideApp={false}
    >
      <div className="DialogHeader">
        <p style={{ margin: '4px' }}>Lista video</p>
      </div>
      <img src={Icons['CancelIcon']} className="CancelIcon" onClick={onCancel} />

      <table {...getTableProps()} className="ResTable">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <Button
        className="BtnOk"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        className="BtnOk" style={{ marginRight: '75px' }}
        onClick={onOk}
      >
        OK
      </Button>

    </Modal>
  )
}
