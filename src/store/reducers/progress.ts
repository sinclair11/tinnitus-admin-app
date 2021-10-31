import { ProgState, action } from './custom';

const initialState: ProgState = {
	open: false,
	progress: 0,
	variant: 'success',
	log: Array<{ type: string; value: unknown }>(),
	abort: false,
};

/**
 *
 * @param state Global state found in store
 * @param action Event triggered for state
 * @returns Global state of app
 * @description Available actions regarding progressbar state are:
 * - progress/update
 * - progress/log
 * - progress/change
 * - progress/show
 */
export function progressReducer(
	state: ProgState = initialState,
	action: action,
): ProgState {
	const payload = action.payload;
	switch (action.type) {
		case 'progress/open': {
			return {
				...state,
				open: action.payload as boolean,
			};
		}
		case 'progress/update': {
			return {
				...state,
				progress: payload as number,
			};
		}
		case 'progress/log':
			return {
				...state,
				log: [
					...state.log,
					payload as { type: string; value: unknown },
				],
			};
		case 'progress/variant':
			return {
				...state,
				variant: payload as string,
			};
		case 'progress/abort':
			return {
				...state,
				abort: payload as boolean,
			};
		case 'progress/fail':
			return {
				...state,
				variant: 'danger',
				progress: 100,
				log: [
					...state.log,
					payload as { type: string; value: unknown },
				],
			};
		case 'progress/clean':
			return {
				...state,
				progress: 0,
				variant: 'success',
				log: Array<{ type: string; value: unknown }>(),
				abort: false,
			};
		default:
			//Just return the state
			return state;
	}
}
