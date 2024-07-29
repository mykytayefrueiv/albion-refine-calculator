import {values} from "lodash";

export const RESOURCE_TYPE = {
	RAW: "RAW",
	REFINED: "REFINED"
};

export const RAW_RESOURCE = {
	'FIBER': 'FIBER',
	'HIDE': 'HIDE',
	'ORE': 'ORE',
	'WOOD': 'WOOD',
	'ROCK': 'ROCK',
};

export const REFINED_RESOURCE = {
	'CLOTH': 'CLOTH',
	'LEATHER': 'LEATHER',
	'METALBAR': 'METALBAR',
	'PLANKS': 'PLANKS',
	'STONEBLOCK': 'STONEBLOCK',
};

export const PRE_LEVELS = {
	'LEVEL1': 'T1',
	'LEVEL2': 'T2',
	'LEVEL3': 'T3',
	'LEVEL4': 'T4',
	'LEVEL5': 'T5',
	'LEVEL6': 'T6',
	'LEVEL7': 'T7',
	'LEVEL8': 'T8',
};

export const POST_LEVELS = {
	'LEVEL1': 'LEVEL1@1',
	'LEVEL2': 'LEVEL2@2',
	'LEVEL3': 'LEVEL3@3',
};

export const REFINED_TO_RAW = {
	'CLOTH': 'FIBER',
	'LEATHER': 'HIDE',
	'METALBAR': 'ORE',
	'PLANKS': 'WOOD',
	'STONEBLOCK': 'ROCK',
};

export const CRAFTING = {
	[PRE_LEVELS.LEVEL1]: undefined,
	[PRE_LEVELS.LEVEL2]: [{
		level: PRE_LEVELS.LEVEL2,
		type: RESOURCE_TYPE.RAW,
		amount: 1
	}],
	[PRE_LEVELS.LEVEL3]: [{
		level: PRE_LEVELS.LEVEL3,
		type: RESOURCE_TYPE.RAW,
		amount: 2
	}, {
		level: PRE_LEVELS.LEVEL2,
		type: RESOURCE_TYPE.REFINED,
		amount: 1
	}],
	[PRE_LEVELS.LEVEL4]: [{
		level: PRE_LEVELS.LEVEL4,
		type: RESOURCE_TYPE.RAW,
		amount: 2
	}, {
		level: PRE_LEVELS.LEVEL3,
		type: RESOURCE_TYPE.REFINED,
		amount: 1
	}],
	[PRE_LEVELS.LEVEL5]: [{
		level: PRE_LEVELS.LEVEL5,
		type: RESOURCE_TYPE.RAW,
		amount: 3
	}, {
		level: PRE_LEVELS.LEVEL4,
		type: RESOURCE_TYPE.REFINED,
		amount: 1
	}],
	[PRE_LEVELS.LEVEL6]: [{
		level: PRE_LEVELS.LEVEL6,
		type: RESOURCE_TYPE.RAW,
		amount: 4
	}, {
		level: PRE_LEVELS.LEVEL5,
		type: RESOURCE_TYPE.REFINED,
		amount: 1
	}],
	[PRE_LEVELS.LEVEL7]: [{
		level: PRE_LEVELS.LEVEL7,
		type: RESOURCE_TYPE.RAW,
		amount: 5
	}, {
		level: PRE_LEVELS.LEVEL6,
		type: RESOURCE_TYPE.REFINED,
		amount: 1
	}],
	[PRE_LEVELS.LEVEL8]: [{
		level: PRE_LEVELS.LEVEL8,
		type: RESOURCE_TYPE.RAW,
		amount: 5
	}, {
		level: PRE_LEVELS.LEVEL7,
		type: RESOURCE_TYPE.REFINED,
		amount: 1
	}],
};

export const RAW_RESOURCE_ARRAY = values(RAW_RESOURCE);

export const REFINED_RESOURCE_ARRAY = values(REFINED_RESOURCE);

export const PRE_LEVELS_ARRAY = values(PRE_LEVELS);

export const POST_LEVELS_ARRAY = values(POST_LEVELS);

export const CITIES = [
	'Caerleon',
	'Black Market',
	'Bridgewatch',
	'Fort Sterling',
	'Lymhurst',
	'Martlock',
	'Thetford',
	'Morganas Rest',
	'5003',
	'Arthurs Rest',
];

export const url = 'https://europe.albion-online-data.com/api/v2/stats/prices';
