import {filter, find, groupBy, includes, join, map, minBy, reduce, reject, values} from "lodash";
import items from "./items.json";
import {
	CRAFTING,
	POST_LEVELS,
	POST_LEVELS_ARRAY,
	PRE_LEVELS,
	PRE_LEVELS_ARRAY,
	REFINED_TO_RAW,
	RESOURCE_TYPE
} from "./constants";

export const isLowLevel = (level) => level === PRE_LEVELS.LEVEL1 ||
	level === PRE_LEVELS.LEVEL2 ||
	level === PRE_LEVELS.LEVEL3;

export const getUrlFor = resource => {
	const allLevels = map(PRE_LEVELS_ARRAY, (level) => `${level}_${resource}`);
	const withoutLowLevel = map(reject(PRE_LEVELS_ARRAY, isLowLevel), (level) => `${level}_${resource}`);

	const withEnchance = reduce(POST_LEVELS_ARRAY, (sum, postLevel) => {
		return [...sum, ...map(withoutLowLevel, preLevel => `${preLevel}_${postLevel}`)]
	}, []);

	return join([...allLevels, ...withEnchance], ',');
};

export const transformToTable = data => map(groupBy(data, 'item_id'), (value, key) => {
		const blackMarket = find(value, { city: 'Black Market' });

		const citiesPrices = reduce(value, (sum, val) => ({
			...sum,
			[val.city]: val.sell_price_min
				? `${val.sell_price_min} (${Math.round(((1 - val.sell_price_min / (blackMarket.sell_price_min - blackMarket.sell_price_min * 0.0065)) * 100))})`
				: ''
		}), {});

		const minPrice = citiesPrices['Black Market'];
		const maxPrice = Math.max(...values(citiesPrices));

		const profit =  minPrice / (maxPrice - maxPrice * 0.0065);
		const visibleProfit = !isNaN(minPrice) && !isNaN(maxPrice) ? Math.round((1 - profit) * 100) : 0


		return {
			item_id: key,
			name: find(items, { UniqueName: key }).LocalizedNames["RU-RU"],
			...citiesPrices,
		};
	}
);

const transformToRefinedTable = (refinedResource, refined, raw) => map(groupBy(refined, 'item_id'), (itemsByLevel, key) => {
		const itemExample = itemsByLevel[0];
		const rawResource = REFINED_TO_RAW[refinedResource];

		const citiesPrices = reduce(itemsByLevel, (sum, val) => {
			return {
				...sum,
				[val.city]: val.sell_price_min
			}
		}, {});

		const level = reduce(PRE_LEVELS, (sum, val) => includes(itemExample.item_id, val) ? val : sum, undefined);
		const enchantLevel = reduce(POST_LEVELS, (sum, val) => includes(itemExample.item_id, val) ? val : sum, undefined);
		const craftingRecipe = CRAFTING[level];

		const recipe = map(craftingRecipe, (part) => {
			if(part.type === RESOURCE_TYPE.RAW) {
				const rawItems = filter(raw, item =>
					includes(item.item_id, part.level) &&
					includes(item.item_id, rawResource) &&
					(enchantLevel ? includes(item.item_id, enchantLevel) : !includes(item.item_id, 'LEVEL'))
				);

				return {
					...part,
					enchantLevel,
					rawResource,
					lowestPrice: minBy(reject(rawItems, ({ sell_price_min }) => sell_price_min === 0), 'sell_price_min')
				};
			}

			if(part.type === RESOURCE_TYPE.REFINED) {
				const refinedItems = filter(refined, item =>
					includes(item.item_id, part.level) &&
					includes(item.item_id, refinedResource) &&
					(enchantLevel ? includes(item.item_id, enchantLevel) : !includes(item.item_id, 'LEVEL'))
				);

				return {
					...part,
					enchantLevel,
					rawResource,
					lowestPrice: minBy(reject(refinedItems, ({ sell_price_min }) => sell_price_min === 0), 'sell_price_min')
				};
			}
		});

		const craftingCost = reduce(recipe, (sum, part) => sum + (part.lowestPrice?.sell_price_min * part.amount), 0);

		return {
			item_id: key,
			...citiesPrices,
			profit: `${(1 - (Math.min(...values(citiesPrices)) / Math.max(...values(citiesPrices)))) * 100}%`,
			recipe,
			craftingCost,
			craftingProfitWithoutRefiningBonus: Math.min(...values(citiesPrices)) / craftingCost
		};
	}
);