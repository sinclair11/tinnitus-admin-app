import React, { useState } from 'react';
import './login.css'
import { InputGroup, FormControl, Button, Form } from 'react-bootstrap';
import logo from '../../icons/logo.png'
import axios from 'axios'
import crypto from 'crypto';
import { useHistory } from 'react-router-dom';
import fs from 'fs';
import { ipcRenderer } from 'electron';


export const Login: React.FC = () => {

  const [admin, setAdmin] = useState('');
  const [passw, setPassw] = useState('');
  const [adminInvalid, setAdminInvalid] = useState('');
  const [passwInvalid, setPasswInvalid] = useState('');
  const history = useHistory();

  function storeToken(token: string) {
    fs.writeFile(ipcRenderer.sendSync("eventFromRenderer") + '/.sdjkvneriuhweiubkdshbcvds', token, () => { history.push('/welcome'); console.log('Token written') })
  }

  async function AuthAdmin(event: any) {

    let isValid = 0

    if (admin === '') {
      setAdminInvalid('Acest camp este obligatoriu')
      isValid++
    }
    else {/*Do nothing*/ }

    if (passw === '') {
      setPasswInvalid('Acest camp este obligator')
      isValid++
    }
    else {/*Do nothing*/ }

    if (isValid === 0) {
      const psswEnc = crypto.createHash('sha256').update(passw).digest('hex');
      //Send authentication request
      try {
        const response = await axios({
          method: 'post',
          url: `http://127.0.0.1:3000/api/admin/login`,
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            uid: 'kuUFNpDIUHX7u5hOODUIvA1ICp73',
            user: admin,
            passw: psswEnc,
          }
        })
        if (response.status === 200) {
          // history.push('/welcome')
          const data = response.data as { message: string, token: string }
          storeToken(data.token);
        }
        else {
          setPasswInvalid('Credentialele de admin sunt invalide.');
        }
        setAdmin('')
        setPassw('')
      }
      catch (error) {
        //console.error(error)
        if (error.response === undefined) {
          setPasswInvalid(error.message)
        }
        else if (error.response.status === 401) {
          setPasswInvalid('Credentialele de admin sunt invalide');
        }
        setAdmin('')
        setPassw('')
      }
    }
    else {/*Do nothing*/ }
  }

  return (
    <div className="PageLogin">
      <img
        src={logo}
        className="LogoLogin"
      />
      <Form noValidate className="LoginForm">
        <div className="InputSection" style={{ height: '55px' }}>
          <InputGroup
            className="InputGroupPath"
            hasValidation
          >
            <FormControl
              required
              placeholder="Admin"
              className="LoginInput"
              value={admin}
              onChange={(e: any) => setAdmin(e.target.value)}
            />
          </InputGroup>
          <p className="InvalidField" style={{ marginTop: '2px' }}>{adminInvalid}</p>
        </div>
        <div className="InputSection" style={{ height: '55px' }}>
          <InputGroup
            className="InputGroupPath"
            hasValidation
          >
            <FormControl
              required
              type='password'
              placeholder="Parola"
              className="LoginInput"
              value={passw}
              onChange={(e: any) => setPassw(e.target.value)}
            />
          </InputGroup>
          <p className="InvalidField" style={{ marginTop: '2px' }}>{passwInvalid}</p>
        </div>
        <Button onClick={() => AuthAdmin('')} className="LoginBtn">
          Login
        </Button>
      </Form>
      <p className="Copyright">© 2021 Tinnitus Sounds</p>
    </div>
  )
}
