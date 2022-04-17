import React, { useState } from 'react';
import { InputGroup, FormControl, Button, Form } from 'react-bootstrap';
import logo from '@icons/logo.png';
import { useHistory } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { app, db } from '@config/firebase';
import { useDispatch } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';

const Login: React.FC = () => {
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
                //Login in firebase
                await signInWithEmailAndPassword(getAuth(), admin, passw);
                dispatch({
                    type: 'general/auth',
                    payload: getAuth().currentUser.uid,
                });
                await fetchConfig();
                setAdmin('');
                setPassw('');
                history.push('/album/view/0');
            } catch (error) {
                //Handle error and display message
                setPasswInvalid(error.message);
                setAdmin('');
                setPassw('');
            }
        } else {
            /*Do nothing*/
        }
    }

    async function fetchConfig(): Promise<void> {
        try {
            //Retrieve oci configuration
            let docSnap = await getDoc(doc(db, 'misc', 'config'));
            const ociConfig = docSnap.data();
            dispatch({
                type: 'oci/config',
                payload: {
                    fingerprint: ociConfig.oci_fingerprint,
                    host: ociConfig.oci_host,
                    tenancy: ociConfig.oci_tenancy,
                    id: ociConfig.oci_id,
                    namespace: ociConfig.oci_namespace,
                    prereq: ociConfig.oci_prereq,
                },
            });
            docSnap = await getDoc(doc(db, 'misc', 'albums'));
            const albumsConfig = docSnap.data();
            dispatch({
                type: 'general/categories',
                payload: albumsConfig.categories,
            });
        } catch (error) {
            throw error;
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

export default Login;
