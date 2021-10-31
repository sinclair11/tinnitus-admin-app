import { combineReducers } from '@reduxjs/toolkit';
import { progressReducer } from './progress';
import { resdataReducer } from './resdata';

export const rootReducer = combineReducers({
	progressReducer: progressReducer,
	resdataReducer: resdataReducer,
});
