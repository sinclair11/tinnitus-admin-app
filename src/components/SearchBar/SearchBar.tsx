import React, { useState } from 'react';
import './searchbar.css'
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import magnifier from '../../icons/magnifier.png'
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import { ResponseCodes } from '@src/utils/utils';

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
    props.updateUsage(arr => [...arr, { name: 'Feedback-uri', value: dataUsage['feedback'] }])
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
            /** @todo Notify user */
          }
        }
        catch (err) {
          let message: string
          if (err.response === undefined) {
            message = err.message;
          }
          else {
            message = ResponseCodes.get(err.response.data);
          }
          /** @todo Notify user about error */
        }
      }
    }
    catch (err) {
      let message: string
      if (err.response === undefined) {
        message = err.message;
      }
      else {
        message = ResponseCodes.get(err.response.data);
      }
      /** @todo Notify user about error */
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
        className="SearchButton"
        onClick={getResourceData}
      >
        <img src={magnifier} className="SearchIcon"></img>
      </Button>
    </InputGroup>
  )
}
