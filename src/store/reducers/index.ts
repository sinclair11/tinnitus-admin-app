import { combineReducers } from '@reduxjs/toolkit';
import { progressReducer } from './progress';
import { resdataReducer } from './resdata';
import { generalReducer } from './general';

export const rootReducer = combineReducers({
    progressReducer: progressReducer,
    resdataReducer: resdataReducer,
    generalReducer: generalReducer,
});
