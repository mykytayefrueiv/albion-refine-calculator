import logo from './logo.svg';
import './App.css';
import {useEffect,useState} from "react";
import {groupBy, join, map, reduce, values, reject, includes, filter, minBy} from 'lodash';
import * as React from "react";
import {useTable} from "react-table";

const RESOURCE_TYPE = {
    RAW: "RAW",
    REFINED: "REFINED"
};

const RAW_RESOURCE = {
    'FIBER': 'FIBER',
    'HIDE': 'HIDE',
    'ORE': 'ORE',
    'WOOD': 'WOOD',
    'ROCK': 'ROCK',
};

const REFINED_RESOURCE = {
    'CLOTH': 'CLOTH',
    'LEATHER': 'LEATHER',
    'METALBAR': 'METALBAR',
    'PLANKS': 'PLANKS',
    'STONEBLOCK': 'STONEBLOCK',
};

const PRE_LEVELS = {
    'LEVEL1': 'T1',
    'LEVEL2': 'T2',
    'LEVEL3': 'T3',
    'LEVEL4': 'T4',
    'LEVEL5': 'T5',
    'LEVEL6': 'T6',
    'LEVEL7': 'T7',
    'LEVEL8': 'T8',
};

const POST_LEVELS = {
    'LEVEL1': 'LEVEL1@1',
    'LEVEL2': 'LEVEL2@2',
    'LEVEL3': 'LEVEL3@3',
};

const REFINED_TO_RAW = {
    'CLOTH': 'FIBER',
    'LEATHER': 'HIDE',
    'METALBAR': 'ORE',
    'PLANKS': 'WOOD',
    'STONEBLOCK': 'ROCK',
};

const CRAFTING = {
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

const RAW_RESOURCE_ARRAY = values(RAW_RESOURCE);

const REFINED_RESOURCE_ARRAY = values(REFINED_RESOURCE);

const PRE_LEVELS_ARRAY = values(PRE_LEVELS);

const POST_LEVELS_ARRAY = values(POST_LEVELS);

const CITIES = [
    'Bridgewatch',
    'Caerleon',
    'Fort Sterling',
    'Lymhurst',
    'Martlock',
    'Thetford',
];

const url = 'https://www.albion-online-data.com/api/v2/stats/prices';

const isLowLevel = (level) => level === PRE_LEVELS.LEVEL1 ||
    level === PRE_LEVELS.LEVEL2 ||
    level === PRE_LEVELS.LEVEL3;

const getUrlFor = resource => {
    const allLevels = map(PRE_LEVELS_ARRAY, (level) => `${level}_${resource}`);
    const withoutLowLevel = map(reject(PRE_LEVELS_ARRAY, isLowLevel), (level) => `${level}_${resource}`);

    const withEnchance = reduce(POST_LEVELS_ARRAY, (sum, postLevel) => {
        return [...sum, ...map(withoutLowLevel, preLevel => `${preLevel}_${postLevel}`)]
    }, []);

    return join([...allLevels, ...withEnchance], ',');
};

const transformToTable = data => map(groupBy(data, 'item_id'), (value, key) => {
        const citiesPrices = reduce(value, (sum, val) => ({
            ...sum,
            [val.city]: val.sell_price_min
        }), {});

        return {
            item_id: key,
            ...citiesPrices,
            profit: `${(1 - (Math.min(...values(citiesPrices)) / Math.max(...values(citiesPrices)))) * 100}%`
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

        // {
        //     level: PRE_LEVELS.LEVEL3,
        //     type: RESOURCE_TYPE.RAW,
        //     amount: 2
        // }, {
        //     level: PRE_LEVELS.LEVEL2,
        //     type: RESOURCE_TYPE.REFINED,
        //     amount: 1
        // }


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

function App() {
    const [rawData, setRawData] = useState([]);
    const [refinedData, setRefinedData] = useState([]);


    useEffect(() => {
        const reesourceUrl = getUrlFor(RAW_RESOURCE.ORE);
        const refinedResourseUrl = getUrlFor(REFINED_RESOURCE.METALBAR);

        (async () => {
            const raw = await (await fetch(`${url}/${reesourceUrl}.json`)).json();
            const refined = await (await fetch(`${url}/${refinedResourseUrl}.json`)).json();
            const filteredCitiesRaw = filter(raw, ({ city }) => includes(CITIES, city));
            const filteredCitiesRefined = filter(refined, ({ city }) => includes(CITIES, city));

            setRawData(transformToTable(filteredCitiesRaw));
            setRefinedData(transformToRefinedTable(REFINED_RESOURCE.METALBAR, filteredCitiesRefined, filteredCitiesRaw));
        })()
    }, []);

    const columns = React.useMemo(
        () => [
            {
                Header: 'TOVAR',
                accessor: 'item_id',
            },
            {
                Header: 'Bridgewatch',
                accessor: 'Bridgewatch',
            },
            {
                Header: 'Caerleon',
                accessor: 'Caerleon',
            },
            {
                Header: 'Fort Sterling',
                accessor: 'Fort Sterling',
            },
            {
                Header: 'Lymhurst',
                accessor: 'Lymhurst',
            },
            {
                Header: 'Martlock',
                accessor: 'Martlock',
            },
            {
                Header: 'Thetford',
                accessor: 'Thetford',
            },
            {
                Header: 'Profit',
                accessor: 'profit',
            },
        ],
        []
    );

    const refinedColumns = React.useMemo(
        () => [
            {
                Header: 'TOVAR',
                accessor: 'item_id',
            },
            {
                Header: 'Bridgewatch',
                accessor: 'Bridgewatch',
            },
            {
                Header: 'Caerleon',
                accessor: 'Caerleon',
            },
            {
                Header: 'Fort Sterling',
                accessor: 'Fort Sterling',
            },
            {
                Header: 'Lymhurst',
                accessor: 'Lymhurst',
            },
            {
                Header: 'Martlock',
                accessor: 'Martlock',
            },
            {
                Header: 'Thetford',
                accessor: 'Thetford',
            },
            {
                Header: 'Profit',
                accessor: 'profit',
            },
            {
                Header: 'Crafting cost',
                accessor: 'craftingCost',
            },
            {
                Header: 'Crafting Profit (no bonus, no fee)',
                accessor: 'craftingProfitWithoutRefiningBonus',
            },
        ],
        []
    );

    const rawTable = useTable({ columns, data: rawData });
    const refinedTable = useTable({ columns: refinedColumns, data: refinedData });

    return (
    <div className="App">
        <table {...rawTable.getTableProps()}>
            <thead>
            {// Loop over the header rows
                rawTable.headerGroups.map(headerGroup => (
                    // Apply the header row props
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {// Loop over the headers in each row
                            headerGroup.headers.map(column => (
                                // Apply the header cell props
                                <th {...column.getHeaderProps()}>
                                    {// Render the header
                                        column.render('Header')}
                                </th>
                            ))}
                    </tr>
                ))}
            </thead>
            {/* Apply the table body props */}
            <tbody {...rawTable.getTableBodyProps()}>
            {// Loop over the table rows
                rawTable.rows.map(row => {
                    // Prepare the row for display
                    rawTable.prepareRow(row)
                    return (
                        // Apply the row props
                        <tr {...row.getRowProps()}>
                            {// Loop over the rows cells
                                row.cells.map(cell => {
                                    // Apply the cell props
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {// Render the cell contents
                                                cell.render('Cell')}
                                        </td>
                                    )
                                })}
                        </tr>
                    )
                })}
            </tbody>
        </table>

        <br/>
        <br/>
        <br/>

        <table {...refinedTable.getTableProps()}>
            <thead>
            {// Loop over the header rows
                refinedTable.headerGroups.map(headerGroup => (
                    // Apply the header row props
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {// Loop over the headers in each row
                            headerGroup.headers.map(column => (
                                // Apply the header cell props
                                <th {...column.getHeaderProps()}>
                                    {// Render the header
                                        column.render('Header')}
                                </th>
                            ))}
                    </tr>
                ))}
            </thead>
            {/* Apply the table body props */}
            <tbody {...refinedTable.getTableBodyProps()}>
            {// Loop over the table rows
                refinedTable.rows.map(row => {
                    // Prepare the row for display
                    refinedTable.prepareRow(row)
                    return (
                        // Apply the row props
                        <tr {...row.getRowProps()}>
                            {// Loop over the rows cells
                                row.cells.map(cell => {
                                    // Apply the cell props
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {// Render the cell contents
                                                cell.render('Cell')}
                                        </td>
                                    )
                                })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
  );
}

export default App;
