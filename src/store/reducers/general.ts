import { action, GeneralState } from './custom';

const initialState: GeneralState = {
    token: '',
    isTokenExpired: false,
    admin: '',
    password: '',
};

/**
 *
 * @param state Global state found in store
 * @param action Event triggered for state
 * @returns Global state of app
 * @description Available actions regarding general state are:
 * - general/set-token
 * - general/set-expiration
 * - general/set-password
 * - general/set-password
 */
export function generalReducer(
    state: GeneralState = initialState,
    action: action,
): GeneralState {
    const payload = action.payload;
    switch (action.type) {
        case 'general/set-token':
            return {
                ...state,
                token: payload as string,
            };

        case 'general/set-expiration':
            return {
                ...state,
                isTokenExpired: payload as boolean,
            };

        case 'general/set-admin':
            return {
                ...state,
                admin: payload as string,
            };

        case 'general/set-password':
            return {
                ...state,
                password: payload as string,
            };

        default:
            return state;
    }
}
