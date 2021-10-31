import { ResdataState } from './custom';

const initialState: ResdataState = {
	selected: '',
	editSelected: '',
	deleteSelected: '',
	info: [],
	usage: [],
};

export function resdataReducer(
	state: ResdataState = initialState,
	action: { type: string; payload: unknown },
): ResdataState {
	switch (action.type) {
		case 'resdata/selected': {
			return {
				...state,
				selected: action.payload as string,
			};
		}
		case 'resdata/edit': {
			return {
				...state,
				editSelected: action.payload as string,
			};
		}
		case 'resdata/delete': {
			return {
				...state,
				deleteSelected: action.payload as string,
			};
		}
		case 'resdata/info': {
			return {
				...state,
				info: action.payload as { name: string; value: unknown }[],
			};
		}
		case 'resdata/usage': {
			return {
				...state,
				usage: action.payload as { name: string; value: unknown }[],
			};
		}
		default:
			return state;
	}
}
