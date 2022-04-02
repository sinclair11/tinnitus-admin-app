import { action, GeneralState } from './custom';

const initialState: GeneralState = {
    auth: null,
};

/**
 *
 * @param state Global state found in store
 * @param action Event triggered for state
 * @returns Global state of app
 * @description Available actions regarding general state are:
 * - general/auth
 */
export function generalReducer(
    state: GeneralState = initialState,
    action: action,
): GeneralState {
    const payload = action.payload;
    switch (action.type) {
        case 'general/auth':
            return {
                ...state,
                auth: payload,
            };

        default:
            return state;
    }
}
