import { combineReducers } from '@reduxjs/toolkit';
import { progressReducer } from './progress';
import { resdataReducer } from './resdata';
import { generalReducer } from './general';
import { ociReducer } from './oci';

export const rootReducer = combineReducers({
    ociReducer: ociReducer,
    progressReducer: progressReducer,
    resdataReducer: resdataReducer,
    generalReducer: generalReducer,
});
