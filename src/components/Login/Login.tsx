import React, { useState } from 'react';
import { InputGroup, FormControl, Button, Form } from 'react-bootstrap';
import logo from '@icons/logo.png';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { ResponseCodes, watchToken } from '@utils/utils';
import { useDispatch } from 'react-redux';

export const Login: React.FC = () => {
	const [admin, setAdmin] = useState('');
	const [passw, setPassw] = useState('');
	const [adminInvalid, setAdminInvalid] = useState('');
	const [passwInvalid, setPasswInvalid] = useState('');
	const history = useHistory();
	const dispatch = useDispatch();

	function storeToken(token: string): void {
		//Notify main process to store received jwt
		const result = ipcRenderer.sendSync('eventWriteJwt', token);
		//Everything went as expected
		if (result) {
			watchToken();
			dispatch({ type: 'general/set-admin', payload: admin });
			dispatch({ type: 'general/set-password', payload: passw });
			history.push('/welcome');
		} else {
			//Error handling
		}
	}

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
				const response = await axios({
					method: 'post',
					url: `http://127.0.0.1:3000/api/admin/login`,
					headers: {
						'Content-Type': 'application/json',
					},
					data: {
						user: admin,
						passw: passw,
					},
				});
				if (response.status === 200) {
					// history.push('/welcome')
					const data = response.data as {
						message: string;
						token: string;
					};
					storeToken(data.token);
				} else {
					setPasswInvalid('Credentialele de admin sunt invalide.');
				}
				setAdmin('');
				setPassw('');
			} catch (error) {
				//console.error(error)
				if (error.response === undefined) {
					setPasswInvalid(error.message);
				} else {
					setPasswInvalid(ResponseCodes.get(error.response.status));
				}
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
							placeholder="Admin"
							className="LoginInput"
							value={admin}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							onChange={(e: any): void =>
								setAdmin(e.target.value)
							}
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
							placeholder="Parola"
							className="LoginInput"
							value={passw}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							onChange={(e: any): void =>
								setPassw(e.target.value)
							}
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