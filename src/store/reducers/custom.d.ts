export type ProgState = {
    open: boolean;
    progress: number;
    variant: string;
    log: Array<{ type: string; value: unknown }>;
    abort: boolean;
};

export type ResdataState = {
    selected: string;
    info: { name: string; value: unknown }[];
    usage: { name: string; value: unknown }[];
    infoData: any;
    thumbnail: string;
    checks: unknown;
};

export type GeneralState = {
    auth: any;
};

export type CombinedStates = {
    resdataReducer: ResdataState;
    progressReducer: ProgState;
    generalReducer: GeneralState;
};

export type action = {
    type: string;
    payload: unknown;
};
