import React, { useState } from 'react';
import { InputGroup, FormControl, Button, Form } from 'react-bootstrap';
import logo from '@icons/logo.png';
import { useHistory } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { app } from '@config/firebase';
import { useDispatch } from 'react-redux';

export const Login: React.FC = () => {
    const dispatch = useDispatch();
    const [admin, setAdmin] = useState('');
    const [passw, setPassw] = useState('');
    const [adminInvalid, setAdminInvalid] = useState('');
    const [passwInvalid, setPasswInvalid] = useState('');
    const history = useHistory();
    const auth = getAuth(app);

    async function AuthAdmin(): Promise<void> {
        let isValid = 0;

        if (admin === '') {
            setAdminInvalid('Acest camp este obligatoriu');
            isValid++;
        } else {
            setAdminInvalid('');
        }

        if (passw === '') {
            setPasswInvalid('Acest camp este obligatoriu');
            isValid++;
        } else {
            setPasswInvalid('');
        }

        if (isValid === 0) {
            //Send authentication request
            try {
                await setPersistence(auth, browserSessionPersistence);
                await signInWithEmailAndPassword(getAuth(), admin, passw);
                dispatch({
                    type: 'general/auth',
                    payload: getAuth().currentUser.uid,
                });
                setAdmin('');
                setPassw('');
                history.push('/welcome');
            } catch (error) {
                //Handle error and display message
                setPasswInvalid('Invalid username or password');
                setAdmin('');
                setPassw('');
            }
        } else {
            /*Do nothing*/
        }
    }

    return (
        <div className="PageLogin">
            <img src={logo} className="LogoLogin" />
            <Form noValidate className="LoginForm">
                <div className="InputSection" style={{ height: '55px' }}>
                    <InputGroup className="InputGroupPath" hasValidation>
                        <FormControl
                            required
                            placeholder="email"
                            className="LoginInput"
                            value={admin}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(e: any): void => setAdmin(e.target.value)}
                        />
                    </InputGroup>
                    <p className="InvalidRed" style={{ marginTop: '2px' }}>
                        {adminInvalid}
                    </p>
                </div>
                <div className="InputSection" style={{ height: '55px' }}>
                    <InputGroup className="InputGroupPath" hasValidation>
                        <FormControl
                            required
                            type="password"
                            placeholder="password"
                            className="LoginInput"
                            value={passw}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(e: any): void => setPassw(e.target.value)}
                        />
                    </InputGroup>
                    <p className="InvalidRed" style={{ marginTop: '2px' }}>
                        {passwInvalid}
                    </p>
                </div>
                <Button onClick={AuthAdmin} className="LoginBtn">
                    Login
                </Button>
            </Form>
            <p className="Copyright">© 2021 Tinnitus Sounds</p>
        </div>
    );
};
