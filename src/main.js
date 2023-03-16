import {CITIES, url} from "./constants";
import {filter, includes, isEmpty, join, map} from "lodash";
import items from "./items.json";
import { useQuery} from "@tanstack/react-query";
import {transformToTable} from "./helpers";
import {Box, Button, Checkbox, Flex, Input, MultiSelect, Table, Title} from "@mantine/core";
import {useState} from "react";
import {BarChart, Bar, Cell, XAxis, YAxis, ComposedChart, Tooltip, Legend, Line, Area} from 'recharts';
import {DateTime} from "luxon";

const data = [
	{
		name: 'Page A',
		item_count: 1000
	},
	{
		name: 'Page B',
		item_count: 1200
	},
	{
		name: 'Page C',
		item_count: 1400
	},
	{
		name: 'Page D',
		item_count: 1600
	},
	{
		name: 'Page E',
		item_count: 800
	},
	{
		name: 'Page F',
		item_count: 500
	},
	{
		name: 'Page G',
		item_count: 300
	},
];

function Main() {
	const [selectedCities, setSelectedCities] = useState(CITIES);
	const [weapons, setWeapons] = useState(true);
	const [armor, setArmor] = useState(true);
	const [enchanted, setEnchanted] = useState(false);

	const armorList = filter(map(items, "UniqueName"), name => (includes(name, 'MAIN') || includes(name, '2H') || includes(name, 'ARMOR') || includes(name, 'SHOES') || includes(name, 'HEAD')) && includes(name, 'T8') && !includes(name, '@1') && !includes(name, 'ARTEFACT') && !includes(name, '@3') && !includes(name, '@2') && !includes(name, '@4') && !includes(name, 'GATHERER'))
	const armorUrl = join(armorList, ',');


	const { data: rawData, refetch, isFetching } = useQuery(['BLYZGA'], async () => {
		const lastWeek = DateTime.now().minus({ days: 7 }).toFormat('yyyy-MM-dd');

		const raw = await (await fetch(`${url}/${armorUrl}.json`)).json();
		const filterByQuality = filter(raw, {quality: 2});
		const filterByCity = filter(filterByQuality, ({city}) => includes(selectedCities, city));

		const chartData = await(await fetch(`https://www.albion-online-data.com/api/v2/stats/history/${armorUrl}?time-scale=24&locations=Black%20Market&qualities=2&date=${lastWeek}`)).json();

		return transformToTable(filterByCity, chartData);
	}, {
		refetchOnWindowFocus: false,
	})


	return (
			<Box p='lg'>
				<Box my='md' gap='xs'>
					<Title>Фільтра</Title>

					<Box>
						<Input.Label>Товар</Input.Label>
						<Checkbox
							checked={weapons}
							label="Пушкі?"
							onChange={e => setWeapons(e.currentTarget.checked)}
						/>
						<Checkbox
							checked={armor}
							onChange={e => setArmor(e.currentTarget.checked)}
							label="Бронька?"
						/>
						<Checkbox
							checked={enchanted}
							onChange={e => setEnchanted(e.currentTarget.checked)}
							label="+1 Зачар?"
						/>
					</Box>


					<MultiSelect
						data={CITIES}
						label="Cities"
						value={selectedCities}
						onChange={citites => setSelectedCities(citites)}
					/>
					<Button loading={isFetching} onClick={refetch}>Підгрузіть, будь-ласка</Button>
				</Box>

				<Table withBorder highlightOnHover striped withColumnBorders>
					<thead>
					<tr>
						<th>Item id</th>
						<th>Name</th>
						{map(selectedCities, name => (<th>{name}</th>))}
					</tr>
					</thead>
					<tbody>{map(rawData, (element) => (<tr key={element.item_id}>
						<td>{element.item_id}</td>
						<td>{element.name}</td>
						{map(selectedCities, name => (<td>
							<Flex
								justify="center"
								align="center"
								direction="row"
							>
								{element[name]}

								{!isEmpty(element?.chartData) && name === 'Black Market' && <ComposedChart
									width={400}
									height={150}
									data={element?.chartData}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5,
									}}
								>
									<Tooltip/>
									<Bar yAxisId="left" dataKey="item_count" fill="#00b300"/>
									<Line yAxisId="right" type="monotone" dataKey="avg_price" fill="#000"/>
									<YAxis yAxisId="right" orientation="right" />
									<YAxis yAxisId="left" />
									<XAxis dataKey="timestamp" />
								</ComposedChart>}
							</Flex>
						</td>))}
					</tr>))}
					</tbody>
				</Table>
			</Box>
	);
}

export default Main;


// useEffect(() => {
//     const reesourceUrl = getUrlFor(RAW_RESOURCE.ORE);
//     const refinedResourseUrl = getUrlFor(REFINED_RESOURCE.METALBAR);
//
//     (async () => {
//         const raw = await (await fetch(`${url}/${reesourceUrl}.json`)).json();
//         const refined = await (await fetch(`${url}/${refinedResourseUrl}.json`)).json();
//         const filteredCitiesRaw = filter(raw, ({ city }) => includes(CITIES, city));
//         const filteredCitiesRefined = filter(refined, ({ city }) => includes(CITIES, city));
//
//         setRawData(transformToTable(filteredCitiesRaw));
//         setRefinedData(transformToRefinedTable(REFINED_RESOURCE.METALBAR, filteredCitiesRefined, filteredCitiesRaw));
//     })()
// }, []);

// useEffect(() => {
// 	// const reesourceUrl = getUrlFor(RAW_RESOURCE.ORE);
// 	// console.log(reesourceUrl);
//
//
//
// 	(async () => {
// 		const raw = await (await fetch(`${url}/${armorUrl}.json`)).json();
// 		// const raw = await (await fetch(`https://www.albion-online-data.com/api/v2/stats/history/T8_ARMOR_CLOTH_SET1.json?time-scale=24`)).json();
//
// 		const filterByQuality = filter(raw, {quality: 2});
// 		const filterByCity = filter(filterByQuality, ({city}) => includes(selectedCities, city));
//
// 		// const refined = await (await fetch(`${url}/${refinedResourseUrl}.json`)).json();
// 		// const filteredCitiesRaw = filter(raw, ({ city }) => includes(CITIES, city));
// 		// const filteredCitiesRefined = filter(refined, ({ city }) => includes(CITIES, city));
//
// 		setRawData(transformToTable(filterByCity));
// 		// setRefinedData(transformToRefinedTable(REFINED_RESOURCE.METALBAR, filteredCitiesRefined, filteredCitiesRaw));
// 	})()
// }, []);