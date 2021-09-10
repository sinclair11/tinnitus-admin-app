import React, { useState } from 'react';
import './searchbar.css'
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import { ResponseCodes } from '@src/utils/utils';
import { Icons } from '@src/utils/icons'
import Store from 'electron-store';

/**
 * @type        SearchbarProps
 * @description Properties for SearchBar component
 */
type SearchbarProps = {
  /**
   * @field       updateInfo
   * @description Set state action for resource general information
   */
  updateInfo?: React.Dispatch<React.SetStateAction<Array<{ name: string, value: unknown }>>>,
  /**
   * @field       updateUsage
   * @description Set state action for resource usage information
   */
  updateUsage?: React.Dispatch<React.SetStateAction<Array<{ name: string, value: unknown }>>>,

  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;

  setDialog?: React.Dispatch<React.SetStateAction<boolean>>;

  setTableOpen?: React.Dispatch<React.SetStateAction<boolean>>;

  setDialogMessage?: React.Dispatch<React.SetStateAction<string>>;

  setTableData?: React.Dispatch<React.SetStateAction<Array<{ name: string, date: unknown }>>>,
}


export const SearchBar: React.FC<SearchbarProps> = (props: SearchbarProps) => {

  const [searchVal, setSearchVal] = useState('');

  /**
   * @function updateInfoData
   * @description Internal function to update view with resource information aquired from firestore
   * @param dataInfo General information of resource
   * @param dataUsage Usage information of resource
   */
  function updateInfoData(dataInfo: any, dataUsage: any) {
    //Clear old values
    props.updateInfo([])
    //Add new values
    props.updateInfo(arr => [...arr, { name: 'Nume', value: dataInfo['name'] }])
    props.updateInfo(arr => [...arr, { name: 'Lungime', value: dataInfo['length'] }])
    props.updateInfo(arr => [...arr, { name: 'Data creare', value: dataInfo['creation'] }])
    props.updateInfo(arr => [...arr, { name: 'Data incarcare', value: dataInfo['upload'] }])
    props.updateInfo(arr => [...arr, { name: 'Tags', value: dataInfo['tags'] }])
    props.updateInfo(arr => [...arr, { name: 'Descriere', value: dataInfo['description'] }])
    //Clear old values
    props.updateUsage([])
    //Add new values
    props.updateUsage(arr => [...arr, { name: 'Total durata vizionari', value: dataUsage['views_length'] }])
    props.updateUsage(arr => [...arr, { name: 'Total vizionari', value: dataUsage['views'] }])
    props.updateUsage(arr => [...arr, { name: 'Durata per utilizator', value: dataUsage['views_per_user'] }])
    props.updateUsage(arr => [...arr, { name: 'Aprecieri', value: dataUsage['likes'] }])
    props.updateUsage(arr => [...arr, { name: 'Favorizari', value: dataUsage['favs'] }])
    props.updateUsage(arr => [...arr, { name: 'Feedback-uri', value: dataUsage['nr_feedback'] }])
  }

  /**
   * @callback    getResourceData
   * @description Callback function which aquires resource general and usage information
   */
  async function getResourceData() {
    const secret = fs.readFileSync('.sdjkvneriuhweiubkdshbcvds').toString('utf-8')
    const id = crypto.createHash('sha256').update(searchVal).digest('hex').toString()
    let dataInfo = []
    let dataUsage = []

    //Show loading modal
    props.setIsOpen(true)
    //Get general information about resource
    try {
      const response = await axios({
        method: 'get',
        url: `http://127.0.0.1:3000/api/admin/videos/infodb/general?id=${id}`,
        headers: {
          'Authorization': `${secret}`
        },
      });
      if (response.status === 200) {
        //Update information about resource
        dataInfo = response.data;
        //Get usage information about resource
        try {
          const response = await axios({
            method: 'get',
            url: `http://127.0.0.1:3000/api/admin/videos/infodb/usage?id=${id}`,
            headers: {
              'Authorization': `${secret}`
            },
          });
          if (response.status === 200) {
            //Update usage about resource
            dataUsage = response.data;
            //Update view with info from firestore
            updateInfoData(dataInfo, dataUsage);
            props.setIsOpen(false);
          }
        }
        catch (err) {
          let message: string
          if (err.response === undefined) {
            message = err.message;
          }
          else {
            message = ResponseCodes.get(err.response.status);
          }
          /* Notify user about error */
          props.setDialogMessage(message);
          props.setIsOpen(false);
          props.setDialog(true);
        }
      }
    }
    catch (err) {
      let message: string
      if (err.response === undefined) {
        message = err.message;
      }
      else {
        message = ResponseCodes.get(err.response.status);
      }
      /* Notify user about error */
      props.setDialogMessage(message);
      props.setIsOpen(false);
      props.setDialog(true);
    }
  }

  async function getListOfResources() {
    const secret = fs.readFileSync('../../sdjkvneriuhweiubkdshbcvds').toString('utf-8');

    //Show loading modal
    props.setIsOpen(true)
    //Get a list with all uploaded videosnm
    try {
      const response = await axios({
        method: 'get',
        url: `http://127.0.0.1:3000/api/admin/videos/infodb/listofvideos`,
        headers: {
          'Authorization': `${secret}`
        },
      });
      const names = response.data['names'];
      const dates = response.data['dates'];
      const length = names.length;
      //Data containing the records name and upload date
      for (let i = 0; i < length; i++) {
        props.setTableData(arr => [...arr, { name: names[i], date: dates[i] }])
      }
      //Hide hourglass modal
      props.setIsOpen(false)
      //Display table with data
      props.setTableOpen(true)
    }
    catch (err) {
      let message: string
      if (err.response === undefined) {
        message = err.message;
      }
      else {
        message = ResponseCodes.get(err.response.status);
      }
      /* Notify user about error */
      props.setDialogMessage(message);
      props.setIsOpen(false);
      props.setDialog(true);
    }
  }

  return (
    <InputGroup className="SearchGroup">
      <FormControl
        placeholder="Nume video..."
        aria-label="Nume video"
        aria-describedby="basic-addon2"
        className="SearchBar"
        value={searchVal}
        onChange={(e: any) => setSearchVal(e.target.value)}
      />
      <Button
        data-tip="Cauta"
        className="SearchButton"
        onClick={getResourceData}
      >
        <img src={Icons['MagnifierIcon']} className="SearchIcon"></img>
      </Button>
      <Button
        data-tip="Lista video"
        className="SearchButton"
        style={{ marginLeft: '5px' }}
        onClick={getListOfResources}
      >
        <img src={Icons['ListIcon']} className="SearchIcon"></img>
      </Button>
    </InputGroup>
  )
}
