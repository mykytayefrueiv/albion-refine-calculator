import {CITIES, url} from "./constants";
import {filter, includes, join, map} from "lodash";
import items from "./items.json";
import {QueryClientProvider, useQuery} from "@tanstack/react-query";
import {transformToTable} from "./helpers";
import {Box, Button, Checkbox, Input, MultiSelect, Table, Title} from "@mantine/core";
import {useEffect, useState} from "react";

function Main() {
	const [selectedCities, setSelectedCities] = useState(CITIES);
	const [weapons, setWeapons] = useState(true);
	const [armor, setArmor] = useState(true);
	const [enchanted, setEnchanted] = useState(false);

	const armorList = filter(map(items, "UniqueName"), name => (includes(name, 'MAIN') || includes(name, '2H') || includes(name, 'ARMOR') || includes(name, 'SHOES') || includes(name, 'HEAD')) && includes(name, 'T8') && !includes(name, '@1') && !includes(name, 'ARTEFACT') && !includes(name, '@3') && !includes(name, '@2') && !includes(name, '@4') && !includes(name, 'GATHERER'))
	const armorUrl = join(armorList, ',');

	const { data: rawData, refetch, isFetching } = useQuery(['BLYZGA'], async () => {
		const raw = await (await fetch(`${url}/${armorUrl}.json`)).json();
		const filterByQuality = filter(raw, {quality: 2});
		const filterByCity = filter(filterByQuality, ({city}) => includes(selectedCities, city));

		return transformToTable(filterByCity);
	}, {
		refetchOnWindowFocus: false,
	})

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
						{map(selectedCities, name => (<th>{element[name]}</th>))}
					</tr>))}
					</tbody>
				</Table>
			</Box>
	);
}

export default Main;