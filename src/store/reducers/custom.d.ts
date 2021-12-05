export type ProgState = {
	open: boolean;
	progress: number;
	variant: string;
	log: Array<{ type: string; value: unknown }>;
	abort: boolean;
};

export type ResdataState = {
	selected: string;
	editSelected: string;
	deleteSelected: string;
	info: { name: string; value: unknown }[];
	usage: { name: string; value: unknown }[];
	thumbnail: string;
	checks: unknown;
};

export type GeneralState = {
	token: string;
	isTokenExpired: boolean;
	admin: string;
	password: string;
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
