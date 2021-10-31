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
};

export type ModalState = {
	uploadVisible: boolean;
	type: string;
};

export type CombinedStates = {
	resdataReducer: ResdataState;
	progressReducer: ProgState;
};

export type action = {
	type: string;
	payload: unknown;
};
